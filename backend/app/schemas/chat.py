from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from app.schemas.scheme import SchemeListItem

class ChatMessage(BaseModel):
    role: str  # user / assistant
    content: str

class ChatRequest(BaseModel):
    session_id: str
    message: str
    history: List[ChatMessage] = []
    language: str = "en"
    profile_context: Optional[Dict[str, Any]] = None

class ExtractedProfile(BaseModel):
    age: Optional[int] = None
    gender: Optional[str] = None
    state: Optional[str] = None
    district: Optional[str] = None
    annual_income: Optional[float] = None
    occupation: Optional[str] = None
    is_student: Optional[bool] = None
    is_farmer: Optional[bool] = None
    has_disability: Optional[bool] = None
    caste_category: Optional[str] = None
    area_type: Optional[str] = None

class ChatResponse(BaseModel):
    message: str
    extracted_profile: Optional[ExtractedProfile] = None
    suggested_schemes: Optional[List[int]] = None
    schemes: Optional[List[SchemeListItem]] = None
    language_detected: str = "en"
    is_mock: bool = False
    disclaimer: str = "Responses are AI-generated based on official scheme data. Not an official government response."

