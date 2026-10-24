import logging
from typing import List, Optional
from sqlalchemy.orm import Session
from ai.rag.retriever import retrieve_relevant_schemes
from ai.eligibility.engine import check_eligibility
from app.database import models

logger = logging.getLogger(__name__)

def run_rag_pipeline(
    query: str,
    profile: Optional[models.CitizenProfile],
    db: Session,
    top_k: int = 5
) -> dict:
    """Run full RAG pipeline: retrieve → evaluate → return structured result."""
    scheme_ids = retrieve_relevant_schemes(query, top_k=top_k)
    if not scheme_ids:
        return {"schemes": [], "message": "No schemes found for this query."}

    results = []
    for sid in scheme_ids:
        scheme = db.query(models.Scheme).filter(
            models.Scheme.id == sid, models.Scheme.is_active == True
        ).first()
        if not scheme:
            continue
        eligibility = None
        if profile:
            eligibility = check_eligibility(scheme, profile)
        results.append({
            "scheme_id": scheme.id,
            "scheme_name": scheme.name,
            "category": scheme.category,
            "description": scheme.description,
            "benefits": scheme.benefits,
            "eligibility": eligibility.model_dump() if eligibility else None
        })

    return {"schemes": results}
