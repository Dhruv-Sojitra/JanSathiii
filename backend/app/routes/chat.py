from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.database.models import ChatMessage as ChatMessageModel, CitizenProfile
from app.schemas.chat import ChatRequest, ChatResponse
from ai.chatbot.bedrock_client import get_bedrock_response

router = APIRouter(prefix="/api", tags=["chat"])

@router.post("/chat", response_model=ChatResponse)
def chat_endpoint(payload: ChatRequest, db: Session = Depends(get_db)):
    # Store user message
    user_msg = ChatMessageModel(
        session_id=payload.session_id,
        role="user",
        content=payload.message,
        language=payload.language
    )
    db.add(user_msg)
    db.flush()

    profile_ctx = payload.profile_context or {}
    profile = db.query(CitizenProfile).filter(CitizenProfile.session_id == payload.session_id).first()
    if profile:
        profile_ctx = {
            'age': profile.age,
            'gender': profile.gender,
            'state': profile.state,
            'annual_income': profile.annual_income,
            'occupation': profile.occupation,
            'is_student': profile.is_student,
            'is_farmer': profile.is_farmer,
            'has_disability': profile.has_disability,
            'caste_category': profile.caste_category,
            'area_type': profile.area_type
        }

    response = get_bedrock_response(payload.message, payload.history, profile_ctx, payload.language, db=db)


    # Store assistant message
    assistant_msg = ChatMessageModel(
        session_id=payload.session_id,
        role="assistant",
        content=response.message,
        language=response.language_detected,
        extracted_profile=response.extracted_profile.model_dump() if response.extracted_profile else {}
    )
    db.add(assistant_msg)

    # Auto-update profile with extracted info
    if response.extracted_profile and profile:
        ep = response.extracted_profile
        for field in ['age', 'gender', 'state', 'annual_income', 'is_student', 'is_farmer', 'has_disability', 'area_type']:
            val = getattr(ep, field, None)
            if val is not None and getattr(profile, field) is None:
                setattr(profile, field, val)

    db.commit()
    return response
