from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.database.models import CitizenProfile, UploadedDocument, Scheme
from app.schemas.document import DocumentUploadResponse, DocumentAnalysisResponse, DocumentChecklistResponse, DocumentChecklistItem
from app.services.document_service import upload_document, analyze_document

router = APIRouter(prefix="/api", tags=["documents"])

@router.post("/documents/upload", response_model=DocumentUploadResponse)
async def upload_doc(
    file: UploadFile = File(...),
    session_id: str = Form(...),
    db: Session = Depends(get_db)
):
    profile = db.query(CitizenProfile).filter(CitizenProfile.session_id == session_id).first()
    if not profile:
        raise HTTPException(404, "Profile not found. Please create a profile first.")

    doc = await upload_document(file, profile, db)
    return DocumentUploadResponse(
        id=doc.id,
        document_type=doc.document_type,
        display_name=doc.display_name,
        original_filename=doc.original_filename,
        file_size_bytes=doc.file_size_bytes,
        textract_status=doc.textract_status,
        is_mock=doc.is_mock,
        message="Document uploaded successfully. Analysis is " + ("complete (mock mode)." if doc.is_mock else "in progress.")
    )

@router.post("/documents/analyze/{doc_id}", response_model=DocumentAnalysisResponse)
async def analyze_doc(doc_id: int, db: Session = Depends(get_db)):
    doc = db.query(UploadedDocument).filter(UploadedDocument.id == doc_id).first()
    if not doc:
        raise HTTPException(404, "Document not found.")

    result = await analyze_document(doc_id, db)
    if not result:
        raise HTTPException(500, "Unable to analyze this document. Please upload a clearer PDF or image.")

    scheme_docs = db.query(Scheme).join(Scheme.required_documents).all()
    matched = []
    for s in scheme_docs:
        for rd in s.required_documents:
            if rd.document_type == result['document_type']:
                matched.append(f"{s.name} — {rd.display_name}")

    return DocumentAnalysisResponse(
        id=doc_id,
        document_type=result['document_type'],
        classification_confidence=result.get('confidence'),
        extracted_fields=result.get('extracted_fields', {}),
        matched_scheme_requirements=matched[:5],
        is_mock=result.get('is_mock', True)
    )

@router.get("/documents/checklist/{session_id}/{scheme_id}", response_model=DocumentChecklistResponse)
def document_checklist(session_id: str, scheme_id: int, db: Session = Depends(get_db)):
    profile = db.query(CitizenProfile).filter(CitizenProfile.session_id == session_id).first()
    if not profile:
        raise HTTPException(404, "Profile not found.")
    scheme = db.query(Scheme).filter(Scheme.id == scheme_id).first()
    if not scheme:
        raise HTTPException(404, "Scheme not found.")

    uploaded = {doc.document_type: doc for doc in profile.uploaded_documents}
    items = []
    available = 0
    for rd in scheme.required_documents:
        uploaded_doc = uploaded.get(rd.document_type)
        status = "available" if uploaded_doc else "missing"
        if uploaded_doc:
            available += 1
        items.append(DocumentChecklistItem(
            document_type=rd.document_type,
            display_name=rd.display_name,
            is_mandatory=rd.is_mandatory,
            status=status,
            uploaded_document_id=uploaded_doc.id if uploaded_doc else None,
            notes=rd.notes
        ))

    total = len(items)
    return DocumentChecklistResponse(
        scheme_id=scheme_id,
        scheme_name=scheme.name,
        total_required=total,
        available=available,
        missing=total - available,
        readiness_percentage=round(available / total * 100, 1) if total else 0.0,
        items=items
    )
