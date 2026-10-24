from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from app.database.connection import get_db
from app.database.models import Scheme, CitizenProfile
from app.schemas.eligibility import EligibilityCheckRequest, EligibilityCheckResponse
from ai.eligibility.engine import check_eligibility

router = APIRouter(prefix="/api", tags=["eligibility"])

@router.post("/eligibility/check", response_model=EligibilityCheckResponse)
def check_eligibility_endpoint(payload: EligibilityCheckRequest, db: Session = Depends(get_db)):
    profile = db.query(CitizenProfile).filter(
        CitizenProfile.session_id == payload.profile_session_id
    ).first()
    if not profile:
        raise HTTPException(404, "Profile not found. Please create a profile first.")

    scheme = (
        db.query(Scheme)
        .options(joinedload(Scheme.eligibility_rules), joinedload(Scheme.required_documents))
        .filter(Scheme.id == payload.scheme_id, Scheme.is_active == True)
        .first()
    )
    if not scheme:
        raise HTTPException(404, "Scheme not found.")

    return check_eligibility(scheme, profile)
