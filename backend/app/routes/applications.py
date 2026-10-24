from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.database.models import Application, CitizenProfile, Scheme
from app.schemas.eligibility import EligibilityCheckRequest
from ai.eligibility.engine import check_eligibility
from sqlalchemy.orm import joinedload
from typing import Optional

router = APIRouter(prefix="/api", tags=["applications"])

@router.get("/applications/{session_id}")
def list_applications(session_id: str, db: Session = Depends(get_db)):
    profile = db.query(CitizenProfile).filter(CitizenProfile.session_id == session_id).first()
    if not profile:
        raise HTTPException(404, "Profile not found.")
    apps = db.query(Application).filter(Application.profile_id == profile.id).all()
    result = []
    for app in apps:
        scheme = db.query(Scheme).filter(Scheme.id == app.scheme_id).first()
        result.append({
            "id": app.id,
            "scheme_id": app.scheme_id,
            "scheme_name": scheme.name if scheme else "Unknown",
            "status": app.status,
            "started_at": app.started_at.isoformat() if app.started_at else None,
            "reference_number": app.reference_number
        })
    return result

@router.post("/applications/start")
def start_application(session_id: str, scheme_id: int, db: Session = Depends(get_db)):
    profile = db.query(CitizenProfile).filter(CitizenProfile.session_id == session_id).first()
    if not profile:
        raise HTTPException(404, "Profile not found.")
    scheme = db.query(Scheme).options(
        joinedload(Scheme.eligibility_rules), joinedload(Scheme.required_documents)
    ).filter(Scheme.id == scheme_id).first()
    if not scheme:
        raise HTTPException(404, "Scheme not found.")

    existing = db.query(Application).filter(
        Application.profile_id == profile.id, Application.scheme_id == scheme_id
    ).first()
    if existing:
        return {"application_id": existing.id, "status": existing.status, "message": "Application already exists."}

    elig = check_eligibility(scheme, profile)
    uploaded_types = {doc.document_type for doc in profile.uploaded_documents}
    missing_docs = [rd.display_name for rd in scheme.required_documents if rd.is_mandatory and rd.document_type not in uploaded_types]
    available_docs = [rd.document_type for rd in scheme.required_documents if rd.document_type in uploaded_types]

    if missing_docs:
        status = "documents_missing"
    elif elig.status == "potentially_eligible":
        status = "ready_to_apply"
    else:
        status = "not_started"

    app = Application(
        profile_id=profile.id,
        scheme_id=scheme_id,
        status=status,
        eligibility_result=elig.model_dump(),
        documents_ready=available_docs,
        documents_missing=missing_docs
    )
    db.add(app)
    db.commit()
    db.refresh(app)
    return {
        "application_id": app.id,
        "status": app.status,
        "missing_documents": missing_docs,
        "message": f"Application tracking started. Status: {status}."
    }

@router.put("/applications/{app_id}/status")
def update_application_status(app_id: int, status: str, reference_number: Optional[str] = None, db: Session = Depends(get_db)):
    allowed = ['not_started', 'documents_missing', 'ready_to_apply', 'application_started', 'submitted']
    if status not in allowed:
        raise HTTPException(400, f"Invalid status. Allowed: {allowed}")
    app = db.query(Application).filter(Application.id == app_id).first()
    if not app:
        raise HTTPException(404, "Application not found.")
    app.status = status
    if reference_number:
        app.reference_number = reference_number
    db.commit()
    return {"id": app_id, "status": status, "message": "Status updated."}
