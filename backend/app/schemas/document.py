from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from datetime import datetime

class DocumentUploadResponse(BaseModel):
    id: int
    document_type: Optional[str]
    display_name: Optional[str]
    original_filename: str
    file_size_bytes: int
    textract_status: str
    is_mock: bool
    message: str

class DocumentAnalysisResponse(BaseModel):
    id: int
    document_type: str
    classification_confidence: Optional[float]
    extracted_fields: Dict[str, Any]
    matched_scheme_requirements: List[str]
    is_mock: bool
    disclaimer: str = "Extracted information is for reference only. Official verification is required by the scheme authority."

class DocumentChecklistItem(BaseModel):
    document_type: str
    display_name: str
    is_mandatory: bool
    status: str  # available / missing / unverified
    uploaded_document_id: Optional[int]
    notes: Optional[str]

class DocumentChecklistResponse(BaseModel):
    scheme_id: int
    scheme_name: str
    total_required: int
    available: int
    missing: int
    readiness_percentage: float
    items: List[DocumentChecklistItem]
    disclaimer: str = "Document presence does not guarantee acceptance by the government authority. Ensure all documents are valid and current."
