import logging
import uuid
import os
from typing import Optional, Dict, Any
from fastapi import UploadFile
from sqlalchemy.orm import Session
from app.database.models import UploadedDocument, CitizenProfile
from app.config import get_settings

logger = logging.getLogger(__name__)

ALLOWED_MIME_TYPES = {
    'application/pdf', 'image/jpeg', 'image/jpg', 'image/png',
    'image/webp', 'image/tiff'
}

DOC_TYPE_KEYWORDS = {
    'aadhaar': ['aadhaar', 'aadhar', 'uid', 'uidai', 'unique identification'],
    'income_certificate': ['income', 'annual income', 'income certificate'],
    'residence_certificate': ['residence', 'domicile', 'resident', 'address proof'],
    'student_certificate': ['student', 'enrollment', 'bonafide', 'college', 'school'],
    'bank_document': ['bank', 'account', 'passbook', 'ifsc', 'statement'],
    'caste_certificate': ['caste', 'obc', 'sc', 'st', 'scheduled'],
    'disability_certificate': ['disability', 'disabled', 'handicap', 'divyang'],
    'bpl_card': ['bpl', 'below poverty', 'ration card'],
}

def classify_document(text: str) -> tuple[str, float]:
    text_lower = text.lower()
    scores = {}
    for doc_type, keywords in DOC_TYPE_KEYWORDS.items():
        score = sum(1 for kw in keywords if kw in text_lower)
        if score > 0:
            scores[doc_type] = score / len(keywords)
    if not scores:
        return 'other', 0.0
    best = max(scores, key=scores.get)
    return best, round(scores[best], 2)

MOCK_EXTRACTIONS = {
    'aadhaar': {'name': '[REDACTED]', 'uid_last4': 'XXXX', 'dob': '**/**/****', 'gender': 'As per document'},
    'income_certificate': {'annual_income': 'As per document', 'issued_by': 'Revenue Department'},
    'residence_certificate': {'state': 'As per document', 'district': 'As per document'},
    'student_certificate': {'institution': 'As per document', 'enrollment_status': 'Enrolled'},
    'bank_document': {'bank_name': 'As per document', 'account_type': 'Savings'},
}

async def upload_document(
    file: UploadFile,
    profile: CitizenProfile,
    db: Session
) -> UploadedDocument:
    settings = get_settings()

    # Validate mime type
    if file.content_type not in ALLOWED_MIME_TYPES:
        from fastapi import HTTPException
        raise HTTPException(400, f"Unsupported file type: {file.content_type}. Allowed: PDF, JPEG, PNG, WEBP, TIFF.")

    # Validate size
    content = await file.read()
    max_bytes = settings.max_upload_size_mb * 1024 * 1024
    if len(content) > max_bytes:
        from fastapi import HTTPException
        raise HTTPException(400, f"File too large. Maximum allowed size is {settings.max_upload_size_mb}MB.")

    s3_key = f"documents/{profile.session_id}/{uuid.uuid4().hex}/{file.filename}"
    is_mock = settings.use_mock_s3 or not settings.is_aws_configured

    if not is_mock:
        try:
            import boto3
            s3 = boto3.client(
                's3',
                region_name=settings.aws_region,
                aws_access_key_id=settings.aws_access_key_id or None,
                aws_secret_access_key=settings.aws_secret_access_key or None,
                aws_session_token=settings.aws_session_token or None
            )
            s3.put_object(
                Bucket=settings.aws_s3_bucket,
                Key=s3_key,
                Body=content,
                ContentType=file.content_type,
                ServerSideEncryption='AES256'
            )
        except Exception as e:
            logger.error(f"S3 upload failed: {e}. Using mock.")
            is_mock = True

    doc = UploadedDocument(
        profile_id=profile.id,
        original_filename=file.filename,
        s3_key=s3_key if not is_mock else f"mock/{s3_key}",
        file_size_bytes=len(content),
        mime_type=file.content_type,
        textract_status="mock_complete" if is_mock else "pending",
        is_mock=is_mock
    )
    db.add(doc)
    db.flush()

    if is_mock:
        mock_text = f"Sample document: {file.filename}"
        doc_type, confidence = classify_document(file.filename)
        doc.document_type = doc_type
        doc.classification_confidence = confidence
        doc.extracted_data = MOCK_EXTRACTIONS.get(doc_type, {})
        doc.display_name = doc_type.replace('_', ' ').title()
        doc.textract_status = "mock_complete"
    else:
        doc.textract_status = "processing"

    db.commit()
    db.refresh(doc)
    return doc

async def analyze_document(doc_id: int, db: Session) -> Optional[Dict[str, Any]]:
    doc = db.query(UploadedDocument).filter(UploadedDocument.id == doc_id).first()
    if not doc:
        return None
    settings = get_settings()

    if doc.is_mock or settings.use_mock_textract or not settings.is_aws_configured:
        doc_type, confidence = classify_document(doc.original_filename)
        doc.document_type = doc_type
        doc.classification_confidence = max(confidence, 0.75)
        doc.extracted_data = MOCK_EXTRACTIONS.get(doc_type, {'note': 'Mock extraction complete'})
        doc.textract_status = "mock_complete"
        doc.is_mock = True
        db.commit()
        return {
            'document_type': doc_type,
            'confidence': doc.classification_confidence,
            'extracted_fields': doc.extracted_data,
            'is_mock': True
        }

    # Real Textract
    try:
        import boto3
        textract = boto3.client(
            'textract',
            region_name=settings.aws_region,
            aws_access_key_id=settings.aws_access_key_id or None,
            aws_secret_access_key=settings.aws_secret_access_key or None,
            aws_session_token=settings.aws_session_token or None
        )
        response = textract.detect_document_text(
            Document={'S3Object': {'Bucket': settings.aws_s3_bucket, 'Name': doc.s3_key}}
        )
        words = ' '.join([
            block['Text'] for block in response.get('Blocks', [])
            if block['BlockType'] == 'LINE'
        ])
        doc_type, confidence = classify_document(words)
        doc.document_type = doc_type
        doc.classification_confidence = confidence
        doc.extracted_data = {'raw_text_length': len(words), 'classified_as': doc_type}
        doc.textract_status = "complete"
        doc.is_mock = False
        db.commit()
        return {
            'document_type': doc_type,
            'confidence': confidence,
            'extracted_fields': doc.extracted_data,
            'is_mock': False
        }
    except Exception as e:
        logger.error(f"Textract failed: {e}")
        doc.textract_status = "failed"
        db.commit()
        return None
