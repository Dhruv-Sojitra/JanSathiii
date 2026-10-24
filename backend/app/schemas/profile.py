from pydantic import BaseModel, Field, field_validator
from typing import Optional, Dict, Any
from datetime import datetime

class ProfileCreate(BaseModel):
    session_id: str = Field(..., min_length=1, max_length=100)
    name: Optional[str] = None
    age: Optional[int] = Field(None, ge=0, le=120)
    gender: Optional[str] = None
    state: Optional[str] = None
    district: Optional[str] = None
    area_type: Optional[str] = None  # rural/urban
    annual_income: Optional[float] = Field(None, ge=0)
    occupation: Optional[str] = None
    is_student: bool = False
    is_farmer: bool = False
    has_disability: bool = False
    disability_type: Optional[str] = None
    caste_category: Optional[str] = None
    is_bpl: bool = False
    has_aadhaar: Optional[bool] = None
    has_bank_account: Optional[bool] = None
    education_level: Optional[str] = None
    preferred_language: str = "en"
    extra_attributes: Optional[Dict[str, Any]] = None

    @field_validator('area_type')
    @classmethod
    def validate_area_type(cls, v):
        if v and v not in ('rural', 'urban'):
            raise ValueError('area_type must be rural or urban')
        return v

    @field_validator('gender')
    @classmethod
    def validate_gender(cls, v):
        allowed = ('male', 'female', 'other', 'prefer_not_to_say')
        if v and v.lower() not in allowed:
            raise ValueError(f'gender must be one of {allowed}')
        return v.lower() if v else v

class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    age: Optional[int] = Field(None, ge=0, le=120)
    gender: Optional[str] = None
    state: Optional[str] = None
    district: Optional[str] = None
    area_type: Optional[str] = None
    annual_income: Optional[float] = Field(None, ge=0)
    occupation: Optional[str] = None
    is_student: Optional[bool] = None
    is_farmer: Optional[bool] = None
    has_disability: Optional[bool] = None
    disability_type: Optional[str] = None
    caste_category: Optional[str] = None
    is_bpl: Optional[bool] = None
    has_aadhaar: Optional[bool] = None
    has_bank_account: Optional[bool] = None
    education_level: Optional[str] = None
    preferred_language: Optional[str] = None
    extra_attributes: Optional[Dict[str, Any]] = None

class ProfileResponse(BaseModel):
    id: int
    session_id: str
    name: Optional[str]
    age: Optional[int]
    gender: Optional[str]
    state: Optional[str]
    district: Optional[str]
    area_type: Optional[str]
    annual_income: Optional[float]
    occupation: Optional[str]
    is_student: bool
    is_farmer: bool
    has_disability: bool
    disability_type: Optional[str]
    caste_category: Optional[str]
    is_bpl: bool
    has_aadhaar: Optional[bool]
    has_bank_account: Optional[bool]
    education_level: Optional[str]
    preferred_language: str
    extra_attributes: Optional[Dict[str, Any]]
    created_at: Optional[datetime]
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True
