from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from app.database.connection import get_db
from app.database.models import Scheme
from app.schemas.scheme import SchemeDetailResponse, SchemeSearchRequest, SchemeSearchResponse, SchemeListItem
from app.services.scheme_service import search_schemes
from typing import Optional

router = APIRouter(prefix="/api", tags=["schemes"])

@router.get("/schemes", response_model=SchemeSearchResponse)
def list_schemes(
    query: Optional[str] = None,
    state: Optional[str] = None,
    category: Optional[str] = None,
    government_level: Optional[str] = None,
    is_student: Optional[bool] = None,
    is_farmer: Optional[bool] = None,
    max_income: Optional[float] = None,
    page: int = 1,
    page_size: int = 20,
    db: Session = Depends(get_db)
):
    req = SchemeSearchRequest(
        query=query, state=state, category=category,
        government_level=government_level, is_student=is_student,
        is_farmer=is_farmer, max_income=max_income,
        page=page, page_size=page_size
    )
    return search_schemes(db, req)

@router.get("/schemes/{scheme_id}", response_model=SchemeDetailResponse)
def get_scheme(scheme_id: int, db: Session = Depends(get_db)):
    scheme = (
        db.query(Scheme)
        .options(
            joinedload(Scheme.eligibility_rules),
            joinedload(Scheme.required_documents),
            joinedload(Scheme.sources)
        )
        .filter(Scheme.id == scheme_id, Scheme.is_active == True)
        .first()
    )
    if not scheme:
        raise HTTPException(404, "Scheme not found.")
    return scheme

@router.get("/schemes/{scheme_id}/documents")
def get_scheme_documents(scheme_id: int, db: Session = Depends(get_db)):
    scheme = db.query(Scheme).filter(Scheme.id == scheme_id).first()
    if not scheme:
        raise HTTPException(404, "Scheme not found.")
    return [
        {"document_type": d.document_type, "display_name": d.display_name,
         "is_mandatory": d.is_mandatory, "notes": d.notes}
        for d in scheme.required_documents
    ]

@router.get("/schemes/{scheme_id}/application")
def get_application_guide(scheme_id: int, db: Session = Depends(get_db)):
    scheme = db.query(Scheme).filter(Scheme.id == scheme_id).first()
    if not scheme:
        raise HTTPException(404, "Scheme not found.")
    return {
        "scheme_id": scheme.id,
        "scheme_name": scheme.name,
        "steps": scheme.application_steps,
        "official_application_url": scheme.official_application_url,
        "official_source_url": scheme.official_source_url,
        "url_verified": bool(scheme.official_application_url),
        "disclaimer": "JanSathiii AI does not submit applications on your behalf. You must complete the application through the official government portal."
    }
