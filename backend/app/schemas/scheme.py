from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class EligibilityRuleResponse(BaseModel):
    id: int
    field: str
    operator: str
    value: str
    display_label: Optional[str]
    is_mandatory: bool
    class Config:
        from_attributes = True

class RequiredDocumentResponse(BaseModel):
    id: int
    document_type: str
    display_name: str
    is_mandatory: bool
    notes: Optional[str]
    class Config:
        from_attributes = True

class SchemeListItem(BaseModel):
    id: int
    name: str
    description: Optional[str]
    category: Optional[str]
    government_level: Optional[str]
    state: Optional[str]
    department: Optional[str]
    benefits: Optional[str]
    eligibility_summary: Optional[str]
    official_application_url: Optional[str]
    official_source_url: Optional[str]
    last_verified_date: Optional[str]
    is_demo_data: bool
    tags: Optional[List[str]]
    class Config:
        from_attributes = True

class SchemeDetailResponse(SchemeListItem):
    eligibility_rules: List[EligibilityRuleResponse] = []
    required_documents: List[RequiredDocumentResponse] = []
    application_steps: Optional[str]
    beneficiary_type: Optional[str] = "self"
    class Config:
        from_attributes = True

class SchemeSearchRequest(BaseModel):
    query: Optional[str] = None
    state: Optional[str] = None
    category: Optional[str] = None
    min_age: Optional[int] = None
    max_age: Optional[int] = None
    max_income: Optional[float] = None
    is_student: Optional[bool] = None
    is_farmer: Optional[bool] = None
    gender: Optional[str] = None
    caste_category: Optional[str] = None
    government_level: Optional[str] = None
    tags: Optional[List[str]] = None
    page: int = 1
    page_size: int = 20

class SchemeSearchResponse(BaseModel):
    total: int
    page: int
    page_size: int
    schemes: List[SchemeListItem]
