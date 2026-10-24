import logging
import math
from typing import List, Tuple
from app.config import get_settings

logger = logging.getLogger(__name__)

# In-memory vector store for demo
_scheme_vectors: List[Tuple[int, List[float], str]] = []  # (scheme_id, vector, text)
_initialized = False

def _simple_embed(text: str) -> List[float]:
    """TF-style character n-gram embedding for offline/mock mode."""
    text = text.lower()
    # 256-dim char bigram frequency vector
    vector = [0.0] * 256
    for i in range(len(text) - 1):
        idx = (ord(text[i]) * 31 + ord(text[i+1])) % 256
        vector[idx] += 1.0
    norm = math.sqrt(sum(v**2 for v in vector)) or 1.0
    return [v / norm for v in vector]

def _bedrock_embed(text: str) -> List[float]:
    settings = get_settings()
    try:
        import boto3, json
        bedrock = boto3.client(
            'bedrock-runtime',
            region_name=settings.aws_region,
            aws_access_key_id=settings.aws_access_key_id or None,
            aws_secret_access_key=settings.aws_secret_access_key or None,
            aws_session_token=settings.aws_session_token or None
        )
        response = bedrock.invoke_model(
            modelId=settings.aws_bedrock_embedding_model_id,
            body=json.dumps({"inputText": text[:8000]}),
            contentType='application/json',
            accept='application/json'
        )
        result = json.loads(response['body'].read())
        return result['embedding']
    except Exception as e:
        logger.warning(f"Bedrock embedding failed: {e}. Using simple embed.")
        return _simple_embed(text)

def get_embedding(text: str) -> List[float]:
    settings = get_settings()
    if settings.use_mock_ai or not settings.is_aws_configured:
        return _simple_embed(text)
    return _bedrock_embed(text)

def cosine_similarity(a: List[float], b: List[float]) -> float:
    if len(a) != len(b):
        return 0.0
    dot = sum(x * y for x, y in zip(a, b))
    norm_a = math.sqrt(sum(x**2 for x in a))
    norm_b = math.sqrt(sum(x**2 for x in b))
    return dot / (norm_a * norm_b + 1e-9)

def build_scheme_text(scheme) -> str:
    parts = [scheme.name, scheme.description or '', scheme.category or '',
             scheme.benefits or '', scheme.eligibility_summary or '',
             scheme.department or '', ' '.join(scheme.tags or [])]
    return ' '.join(parts)

def index_schemes(schemes: list) -> None:
    global _scheme_vectors, _initialized
    _scheme_vectors = []
    for scheme in schemes:
        text = build_scheme_text(scheme)
        vec = get_embedding(text)
        _scheme_vectors.append((scheme.id, vec, text))
    _initialized = True
    logger.info(f"Indexed {len(_scheme_vectors)} schemes in vector store.")

def ensure_indexed(db=None) -> None:
    global _initialized, _scheme_vectors
    if _initialized and _scheme_vectors:
        return
    try:
        if db is not None:
            from app.database.models import Scheme
            schemes = db.query(Scheme).filter(Scheme.is_active == True).all()
            if schemes:
                index_schemes(schemes)
        else:
            from app.database.connection import SessionLocal
            from app.database.models import Scheme
            with SessionLocal() as session:
                schemes = session.query(Scheme).filter(Scheme.is_active == True).all()
                if schemes:
                    index_schemes(schemes)
    except Exception as e:
        logger.warning(f"Could not auto-index schemes: {e}")

def retrieve_relevant_schemes(query: str, top_k: int = 5, db=None) -> List[int]:
    if not _initialized or not _scheme_vectors:
        ensure_indexed(db)
    if not _initialized or not _scheme_vectors:
        return []
    query_vec = get_embedding(query)
    scored = [(sid, cosine_similarity(query_vec, vec)) for sid, vec, _ in _scheme_vectors]
    scored.sort(key=lambda x: x[1], reverse=True)
    return [sid for sid, _ in scored[:top_k]]

