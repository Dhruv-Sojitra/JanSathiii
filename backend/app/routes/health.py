from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database.connection import get_db
from app.config import get_settings
import datetime

router = APIRouter()

@router.get("/api/health")
def health_check(db: Session = Depends(get_db)):
    settings = get_settings()
    db_ok = False
    try:
        db.execute(text("SELECT 1"))
        db_ok = True
    except Exception:
        pass
    return {
        "status": "healthy",
        "timestamp": datetime.datetime.utcnow().isoformat(),
        "environment": settings.app_env,
        "database": "connected" if db_ok else "error",
        "aws_configured": settings.is_aws_configured,
        "mock_ai": settings.use_mock_ai,
        "mock_s3": settings.use_mock_s3,
        "mock_textract": settings.use_mock_textract,
        "version": "1.0.0"
    }
