from typing import Any, Optional
from app.database.models import Scheme, CitizenProfile, EligibilityRule
from app.schemas.eligibility import CriterionResult, EligibilityCheckResponse
import logging

logger = logging.getLogger(__name__)

OPERATOR_DISPLAY = {
    "gte": ">=", "lte": "<=", "eq": "=", "in": "in",
    "neq": "!=", "gt": ">", "lt": "<", "contains": "contains"
}

FIELD_LABELS = {
    "age": "Age", "annual_income": "Annual Family Income",
    "state": "State", "gender": "Gender",
    "is_student": "Student Status", "is_farmer": "Farmer Status",
    "has_disability": "Disability Status", "area_type": "Area Type (Rural/Urban)",
    "caste_category": "Caste Category", "is_bpl": "BPL Status",
    "occupation": "Occupation", "education_level": "Education Level",
    "has_aadhaar": "Aadhaar Card", "has_bank_account": "Bank Account"
}

# Fields that describe the applicant themselves (not their dependents)
SELF_FIELDS = {
    "age", "gender", "state", "district", "area_type",
    "annual_income", "occupation", "is_student", "is_farmer",
    "has_disability", "caste_category", "is_bpl",
    "has_aadhaar", "has_bank_account", "education_level"
}

# Friendly labels for child-beneficiary context
CHILD_FIELD_QUESTIONS = {
    "gender": "gender of your child",
    "age":    "age of your child",
}

BENEFICIARY_CONTEXT_LABELS = {
    "child":  "your child",
    "family": "your family",
}


def get_profile_value(profile: CitizenProfile, field: str) -> Optional[Any]:
    return getattr(profile, field, None)


def evaluate_rule(
    rule: EligibilityRule,
    profile: CitizenProfile,
    beneficiary_type: str = "self"
) -> CriterionResult:
    field = rule.field
    operator = rule.operator
    rule_value_str = rule.value
    label = rule.display_label or FIELD_LABELS.get(field, field.replace('_', ' ').title())

    # ── Child-beneficiary guard ────────────────────────────────────────────────
    # If the scheme is meant for a child (e.g. BBBP) and this rule is about a
    # field that only makes sense for the child, we cannot evaluate it from the
    # parent's own profile.  Mark it unknown and ask the parent to provide info.
    if beneficiary_type == "child" and field in SELF_FIELDS:
        child_q = CHILD_FIELD_QUESTIONS.get(field, f"{label.lower()} of your child")
        return CriterionResult(
            field=field,
            display_label=label,
            status="unknown",
            rule_description=f"{label} {OPERATOR_DISPLAY.get(operator, operator)} {rule_value_str}",
            user_value=None,
            explanation=(
                f"This criterion applies to your child, not to you directly. "
                f"Please provide the {child_q} when prompted to get an accurate assessment."
            )
        )
    # ── End guard ──────────────────────────────────────────────────────────────

    user_value = get_profile_value(profile, field)

    if user_value is None:
        return CriterionResult(
            field=field,
            display_label=label,
            status="unknown",
            rule_description=f"{label} {OPERATOR_DISPLAY.get(operator, operator)} {rule_value_str}",
            user_value=None,
            explanation=f"⚠ This criterion could not be checked because you have not provided your {label.lower()}."
        )

    try:
        if field in ("age",):
            user_val = int(user_value)
            rule_val = int(rule_value_str)
        elif field in ("annual_income",):
            user_val = float(user_value)
            rule_val = float(rule_value_str)
        elif field in ("is_student", "is_farmer", "has_disability", "is_bpl", "has_aadhaar", "has_bank_account"):
            user_val = bool(user_value)
            rule_val = rule_value_str.lower() in ("true", "1", "yes")
        elif operator == "in":
            rule_val = [v.strip().lower() for v in rule_value_str.split(",")]
            user_val = str(user_value).lower()
        else:
            user_val = str(user_value).lower()
            rule_val = str(rule_value_str).lower()
    except (ValueError, TypeError) as e:
        logger.warning(f"Rule parse error for field {field}: {e}")
        return CriterionResult(
            field=field, display_label=label, status="unknown",
            rule_description=f"{label} {OPERATOR_DISPLAY.get(operator, operator)} {rule_value_str}",
            user_value=str(user_value),
            explanation=f"⚠ Could not evaluate this criterion due to a data format issue."
        )

    ops = {
        "gte": lambda u, r: u >= r,
        "lte": lambda u, r: u <= r,
        "gt":  lambda u, r: u > r,
        "lt":  lambda u, r: u < r,
        "eq":  lambda u, r: u == r,
        "neq": lambda u, r: u != r,
        "in":  lambda u, r: u in r,
        "contains": lambda u, r: r in u,
    }
    evaluator = ops.get(operator)
    if not evaluator:
        return CriterionResult(
            field=field, display_label=label, status="unknown",
            rule_description=f"{label} {operator} {rule_value_str}",
            user_value=str(user_value),
            explanation="⚠ Unknown operator — could not evaluate."
        )

    passed = evaluator(user_val, rule_val)
    fmt_user = f"{user_value:,.0f}" if isinstance(user_value, float) and field == "annual_income" else str(user_value)
    op_sym = OPERATOR_DISPLAY.get(operator, operator)

    if passed:
        explanation = (
            f"✓ Your {label.lower()} ({fmt_user}) meets the published requirement ({label} {op_sym} {rule_value_str})."
        )
    else:
        explanation = (
            f"✕ Your {label.lower()} ({fmt_user}) does not meet the published requirement ({label} {op_sym} {rule_value_str})."
        )

    return CriterionResult(
        field=field, display_label=label,
        status="pass" if passed else "fail",
        rule_description=f"{label} {op_sym} {rule_value_str}",
        user_value=fmt_user,
        explanation=explanation
    )


def check_eligibility(scheme: Scheme, profile: CitizenProfile) -> EligibilityCheckResponse:
    beneficiary_type = getattr(scheme, "beneficiary_type", None) or "self"

    passed, failed, unknown = [], [], []
    for rule in scheme.eligibility_rules:
        result = evaluate_rule(rule, profile, beneficiary_type=beneficiary_type)
        if result.status == "pass":
            passed.append(result)
        elif result.status == "fail":
            failed.append(result)
        else:
            unknown.append(result)

    # Missing documents
    uploaded_types = {doc.document_type for doc in profile.uploaded_documents}
    missing_docs = [
        doc.display_name for doc in scheme.required_documents
        if doc.is_mandatory and doc.document_type not in uploaded_types
    ]

    total = len(passed) + len(failed) + len(unknown)
    if failed:
        status = "not_matching_known_criteria"
    elif unknown:
        status = "needs_more_information"
    else:
        status = "potentially_eligible"

    match_score = round(len(passed) / total, 2) if total > 0 else 0.0

    beneficiary_label = BENEFICIARY_CONTEXT_LABELS.get(beneficiary_type, "you")
    if status == "potentially_eligible":
        summary = f"Based on the published criteria, you appear potentially eligible for {scheme.name}. All {len(passed)} checked criteria passed."
    elif status == "not_matching_known_criteria":
        summary = f"Based on the published criteria, {len(failed)} criterion/criteria did not match for {scheme.name}."
    else:
        if beneficiary_type != "self":
            summary = (
                f"Additional information about {beneficiary_label} is needed to fully assess eligibility for {scheme.name}. "
                f"{len(unknown)} criteria could not be checked from your own profile alone."
            )
        else:
            summary = f"Additional information is needed to fully assess your eligibility for {scheme.name}. {len(unknown)} criteria could not be checked."

    return EligibilityCheckResponse(
        scheme_id=scheme.id,
        scheme_name=scheme.name,
        status=status,
        passed=passed,
        failed=failed,
        unknown=unknown,
        missing_documents=missing_docs,
        match_score=match_score,
        summary=summary
    )

