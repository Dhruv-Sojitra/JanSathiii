from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.database.models import CitizenProfile
from app.schemas.profile import ProfileCreate, ProfileUpdate, ProfileResponse

router = APIRouter(prefix="/api", tags=["profile"])

@router.post("/profile", response_model=ProfileResponse, status_code=201)
def create_profile(payload: ProfileCreate, db: Session = Depends(get_db)):
    existing = db.query(CitizenProfile).filter(CitizenProfile.session_id == payload.session_id).first()
    if existing:
        raise HTTPException(409, "Profile already exists for this session. Use PUT to update.")
    profile = CitizenProfile(**payload.model_dump())
    db.add(profile)
    db.commit()
    db.refresh(profile)
    return profile

@router.get("/profile/{session_id}", response_model=ProfileResponse)
def get_profile(session_id: str, db: Session = Depends(get_db)):
    profile = db.query(CitizenProfile).filter(CitizenProfile.session_id == session_id).first()
    if not profile:
        raise HTTPException(404, "Profile not found.")
    return profile

@router.put("/profile/{session_id}", response_model=ProfileResponse)
def update_profile(session_id: str, payload: ProfileUpdate, db: Session = Depends(get_db)):
    profile = db.query(CitizenProfile).filter(CitizenProfile.session_id == session_id).first()
    if not profile:
        raise HTTPException(404, "Profile not found.")
    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(profile, field, value)
    db.commit()
    db.refresh(profile)
    return profile
