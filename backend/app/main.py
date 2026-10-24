import logging
import sys
import os

# Add backend dir and project root to path so both `app` and `ai` packages are importable
_backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))   # .../backend
_project_root = os.path.dirname(_backend_dir)                                  # .../schemesaathi-ai
for _p in [_backend_dir, _project_root]:
    if _p not in sys.path:
        sys.path.insert(0, _p)

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.config import get_settings
from app.database.connection import init_db
from app.routes import health, profile, schemes, eligibility, documents, chat, applications

logging.basicConfig(level=logging.INFO, format='%(asctime)s %(name)s %(levelname)s %(message)s')
logger = logging.getLogger(__name__)

# Reload trigger - schemes updated in chatbot
app = FastAPI(
    title="JanSathiii AI",
    description="JanSathiii AI - AI-powered government scheme discovery for Indian citizens.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

settings = get_settings()

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.origins_list,
    allow_credentials=settings.origins_list != ['*'],
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled error on {request.url}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"error": "An unexpected error occurred. Please try again later.", "detail": str(exc)[:200]}
    )

@app.on_event("startup")
async def startup():
    init_db()
    try:
        from app.database.connection import SessionLocal
        from app.database.models import Scheme
        from ai.rag.retriever import index_schemes
        with SessionLocal() as db:
            active_schemes = db.query(Scheme).filter(Scheme.is_active == True).all()
            if active_schemes:
                index_schemes(active_schemes)
    except Exception as e:
        logger.warning(f"Could not index schemes on startup: {e}")
    logger.info(f"JanSathiii AI started. Env: {settings.app_env}. Mock AI: {settings.use_mock_ai}")


for r in [health.router, profile.router, schemes.router, eligibility.router, documents.router, chat.router, applications.router]:
    app.include_router(r)
