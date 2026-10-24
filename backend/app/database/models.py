from sqlalchemy import (
    Column, Integer, String, Text, Boolean, Float, DateTime,
    ForeignKey, Enum, JSON
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database.connection import Base
import enum

class ApplicationStatus(str, enum.Enum):
    NOT_STARTED = "not_started"
    DOCUMENTS_MISSING = "documents_missing"
    READY_TO_APPLY = "ready_to_apply"
    APPLICATION_STARTED = "application_started"
    SUBMITTED = "submitted"

class GovernmentLevel(str, enum.Enum):
    CENTRAL = "central"
    STATE = "state"
    LOCAL = "local"

class CitizenProfile(Base):
    __tablename__ = "citizen_profiles"
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String(100), unique=True, index=True, nullable=False)
    name = Column(String(200))
    age = Column(Integer)
    gender = Column(String(50))
    state = Column(String(100))
    district = Column(String(100))
    area_type = Column(String(20))  # rural / urban
    annual_income = Column(Float)
    occupation = Column(String(100))
    is_student = Column(Boolean, default=False)
    is_farmer = Column(Boolean, default=False)
    has_disability = Column(Boolean, default=False)
    disability_type = Column(String(200))
    caste_category = Column(String(50))  # general/sc/st/obc
    is_bpl = Column(Boolean, default=False)
    has_aadhaar = Column(Boolean)
    has_bank_account = Column(Boolean)
    education_level = Column(String(100))
    preferred_language = Column(String(20), default="en")
    extra_attributes = Column(JSON, default=dict)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    applications = relationship("Application", back_populates="profile", cascade="all, delete-orphan")
    uploaded_documents = relationship("UploadedDocument", back_populates="profile", cascade="all, delete-orphan")

class Scheme(Base):
    __tablename__ = "schemes"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(500), nullable=False, index=True)
    description = Column(Text)
    category = Column(String(100), index=True)
    government_level = Column(String(50))
    state = Column(String(100), index=True)  # null = national
    department = Column(String(300))
    benefits = Column(Text)
    eligibility_summary = Column(Text)
    application_steps = Column(Text)
    official_application_url = Column(String(1000))
    official_source_url = Column(String(1000))
    last_verified_date = Column(String(50))
    is_demo_data = Column(Boolean, default=True)
    is_active = Column(Boolean, default=True)
    # "self" (default) = rules apply to the applicant directly
    # "child" = rules apply to the applicant's child (e.g. BBBP, Sukanya)
    # "family" = rules apply to the whole family unit
    beneficiary_type = Column(String(50), default="self")
    tags = Column(JSON, default=list)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    eligibility_rules = relationship("EligibilityRule", back_populates="scheme", cascade="all, delete-orphan")
    required_documents = relationship("RequiredDocument", back_populates="scheme", cascade="all, delete-orphan")
    applications = relationship("Application", back_populates="scheme")
    sources = relationship("SchemeSource", back_populates="scheme", cascade="all, delete-orphan")

class EligibilityRule(Base):
    __tablename__ = "eligibility_rules"
    id = Column(Integer, primary_key=True, index=True)
    scheme_id = Column(Integer, ForeignKey("schemes.id"), nullable=False)
    field = Column(String(100), nullable=False)  # e.g. "age", "income", "state"
    operator = Column(String(20), nullable=False)  # gte, lte, eq, in, neq
    value = Column(String(500), nullable=False)  # stored as string, parsed by engine
    display_label = Column(String(300))
    is_mandatory = Column(Boolean, default=True)
    scheme = relationship("Scheme", back_populates="eligibility_rules")

class RequiredDocument(Base):
    __tablename__ = "required_documents"
    id = Column(Integer, primary_key=True, index=True)
    scheme_id = Column(Integer, ForeignKey("schemes.id"), nullable=False)
    document_type = Column(String(100), nullable=False)
    display_name = Column(String(300), nullable=False)
    is_mandatory = Column(Boolean, default=True)
    notes = Column(Text)
    scheme = relationship("Scheme", back_populates="required_documents")

class UploadedDocument(Base):
    __tablename__ = "uploaded_documents"
    id = Column(Integer, primary_key=True, index=True)
    profile_id = Column(Integer, ForeignKey("citizen_profiles.id"), nullable=False)
    document_type = Column(String(100))
    display_name = Column(String(300))
    s3_key = Column(String(1000))  # never exposed publicly
    original_filename = Column(String(500))
    file_size_bytes = Column(Integer)
    mime_type = Column(String(100))
    textract_status = Column(String(50), default="pending")
    extracted_data = Column(JSON, default=dict)  # sanitized extracted fields only
    classification_confidence = Column(Float)
    is_mock = Column(Boolean, default=False)
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())
    profile = relationship("CitizenProfile", back_populates="uploaded_documents")

class Application(Base):
    __tablename__ = "applications"
    id = Column(Integer, primary_key=True, index=True)
    profile_id = Column(Integer, ForeignKey("citizen_profiles.id"), nullable=False)
    scheme_id = Column(Integer, ForeignKey("schemes.id"), nullable=False)
    status = Column(String(50), default=ApplicationStatus.NOT_STARTED)
    eligibility_result = Column(JSON)  # stored eligibility check result
    documents_ready = Column(JSON, default=list)
    documents_missing = Column(JSON, default=list)
    notes = Column(Text)
    reference_number = Column(String(200))
    started_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    profile = relationship("CitizenProfile", back_populates="applications")
    scheme = relationship("Scheme", back_populates="applications")

class SchemeSource(Base):
    __tablename__ = "scheme_sources"
    id = Column(Integer, primary_key=True, index=True)
    scheme_id = Column(Integer, ForeignKey("schemes.id"), nullable=False)
    source_type = Column(String(100))  # official_website, gazette, press_release
    url = Column(String(1000))
    title = Column(String(500))
    accessed_date = Column(String(50))
    scheme = relationship("Scheme", back_populates="sources")

class ChatMessage(Base):
    __tablename__ = "chat_messages"
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String(100), index=True, nullable=False)
    role = Column(String(20), nullable=False)  # user / assistant
    content = Column(Text, nullable=False)
    language = Column(String(20), default="en")
    extracted_profile = Column(JSON, default=dict)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
