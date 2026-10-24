from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class CriterionResult(BaseModel):
    field: str
    display_label: str
    status: str  # pass / fail / unknown
    rule_description: str
    user_value: Optional[str]
    explanation: str

class EligibilityCheckRequest(BaseModel):
    profile_session_id: str
    scheme_id: int

class EligibilityCheckResponse(BaseModel):
    scheme_id: int
    scheme_name: str
    status: str  # potentially_eligible / not_matching_known_criteria / needs_more_information
    passed: List[CriterionResult]
    failed: List[CriterionResult]
    unknown: List[CriterionResult]
    missing_documents: List[str]
    match_score: float  # 0.0 - 1.0
    summary: str
    disclaimer: str = "This is an AI-assisted assessment based on published criteria. It does not constitute an official eligibility determination by the government."
