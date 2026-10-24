from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from app.database.models import Scheme, EligibilityRule
from app.schemas.scheme import SchemeSearchRequest, SchemeSearchResponse, SchemeListItem
from typing import List
import logging

logger = logging.getLogger(__name__)

def search_schemes(db: Session, req: SchemeSearchRequest) -> SchemeSearchResponse:
    q = db.query(Scheme).filter(Scheme.is_active == True)

    if req.state:
        q = q.filter(or_(Scheme.state == None, Scheme.state == req.state))
    if req.category:
        q = q.filter(Scheme.category.ilike(f"%{req.category}%"))
    if req.government_level:
        q = q.filter(Scheme.government_level == req.government_level)

    # Age filter
    if req.min_age is not None or req.max_age is not None:
        age_scheme_ids = set()
        age_rules = db.query(EligibilityRule).filter(
            EligibilityRule.field == 'age'
        ).all()
        for rule in age_rules:
            try:
                rv = int(rule.value)
                if rule.operator == 'gte' and req.max_age is not None and rv <= req.max_age:
                    age_scheme_ids.add(rule.scheme_id)
                elif rule.operator == 'lte' and req.min_age is not None and rv >= req.min_age:
                    age_scheme_ids.add(rule.scheme_id)
                elif rule.operator == 'eq':
                    if (req.min_age is None or rv >= req.min_age) and (req.max_age is None or rv <= req.max_age):
                        age_scheme_ids.add(rule.scheme_id)
            except ValueError:
                pass
        if age_scheme_ids:
            q = q.filter(or_(Scheme.id.in_(age_scheme_ids), ~Scheme.eligibility_rules.any(EligibilityRule.field == 'age')))

    if req.max_income is not None:
        income_scheme_ids = set()
        income_rules = db.query(EligibilityRule).filter(
            EligibilityRule.field == 'annual_income',
            EligibilityRule.operator.in_(['lte', 'lt'])
        ).all()
        for rule in income_rules:
            try:
                if float(rule.value) >= req.max_income:
                    income_scheme_ids.add(rule.scheme_id)
            except ValueError:
                pass
        if income_scheme_ids:
            q = q.filter(or_(Scheme.id.in_(income_scheme_ids), ~Scheme.eligibility_rules.any(EligibilityRule.field == 'annual_income')))

    if req.is_student is True:
        pass  # Will be filtered by rule engine, not SQL here
    if req.is_farmer is True:
        pass
    if req.gender:
        pass

    # Keyword search
    if req.query:
        kw = f"%{req.query}%"
        q = q.filter(or_(
            Scheme.name.ilike(kw),
            Scheme.description.ilike(kw),
            Scheme.benefits.ilike(kw),
            Scheme.category.ilike(kw),
            Scheme.department.ilike(kw)
        ))

    total = q.count()
    offset = (req.page - 1) * req.page_size
    schemes = q.offset(offset).limit(req.page_size).all()

    return SchemeSearchResponse(
        total=total,
        page=req.page,
        page_size=req.page_size,
        schemes=[SchemeListItem.model_validate(s) for s in schemes]
    )

def get_recommended_schemes(db: Session, profile, limit: int = 10) -> List[Scheme]:
    q = db.query(Scheme).filter(Scheme.is_active == True)
    if profile.state:
        q = q.filter(or_(Scheme.state == None, Scheme.state == profile.state))
    return q.limit(limit).all()
