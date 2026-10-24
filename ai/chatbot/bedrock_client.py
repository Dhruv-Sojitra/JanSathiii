import json
import logging
import re
from typing import Optional, Dict, Any, List
from sqlalchemy.orm import Session
from app.config import get_settings
from app.schemas.chat import ChatResponse, ExtractedProfile
from app.schemas.scheme import SchemeListItem
from app.database.models import Scheme

logger = logging.getLogger(__name__)

INDIAN_STATES = [
    "andhra pradesh", "arunachal pradesh", "assam", "bihar", "chhattisgarh",
    "goa", "gujarat", "haryana", "himachal pradesh", "jharkhand", "karnataka",
    "kerala", "madhya pradesh", "maharashtra", "manipur", "meghalaya", "mizoram",
    "nagaland", "odisha", "punjab", "rajasthan", "sikkim", "tamil nadu",
    "telangana", "tripura", "uttar pradesh", "uttarakhand", "west bengal",
    "delhi", "jammu and kashmir", "ladakh"
]

def extract_profile_from_text(text: str) -> Dict[str, Any]:
    """Rule-based profile extraction from natural language."""
    extracted = {}
    text_lower = text.lower()

    # Age
    age_match = re.search(r'(\b\d{1,3})\s*(?:year[s]?\s*old|yr[s]?\s*old|years\s*of\s*age|age)', text_lower)
    if age_match:
        age = int(age_match.group(1))
        if 0 <= age <= 120:
            extracted['age'] = age

    # Income
    income_patterns = [
        r'(\d+(?:\.\d+)?)\s*lakh',
        r'rs\.?\s*(\d+(?:,\d+)*)',
        r'income\s*(?:is|of|around|about)?\s*(?:rs\.?)?\s*(\d+(?:,\d+)*)'
    ]
    for pattern in income_patterns:
        match = re.search(pattern, text_lower)
        if match:
            val_str = match.group(1).replace(',', '')
            val = float(val_str)
            if 'lakh' in text_lower[match.start():match.start()+30]:
                val *= 100000
            extracted['annual_income'] = val
            break

    # State
    for state in INDIAN_STATES:
        if state in text_lower:
            extracted['state'] = state.title()
            break

    # Gender
    if any(w in text_lower for w in ['female', 'woman', 'women', 'girl', 'lady']):
        extracted['gender'] = 'female'
    elif any(w in text_lower for w in ['male', 'man', 'boy', 'he ', ' he,', 'his ']):
        if 'gender' not in extracted:
            extracted['gender'] = 'male'

    # Student
    if any(w in text_lower for w in ['student', 'studying', 'school', 'college', 'university', 'scholarship', 'scholarships']):
        extracted['is_student'] = True

    # Farmer
    if any(w in text_lower for w in ['farmer', 'farming', 'agriculture', 'kisan', 'krishi']):
        extracted['is_farmer'] = True

    # Rural/Urban
    if 'rural' in text_lower or 'village' in text_lower or 'gram' in text_lower:
        extracted['area_type'] = 'rural'
    elif 'urban' in text_lower or 'city' in text_lower:
        extracted['area_type'] = 'urban'

    # BPL
    if 'bpl' in text_lower or 'below poverty' in text_lower:
        extracted['is_bpl'] = True

    # Disability
    if any(w in text_lower for w in ['disability', 'disabled', 'differently abled', 'divyangjan']):
        extracted['has_disability'] = True

    return extracted


def detect_language(text: str) -> str:
    hindi_chars = re.findall(r'[\u0900-\u097F]', text)
    odia_chars = re.findall(r'[\u0B00-\u0B7F]', text)
    if len(odia_chars) > 2:
        return 'or'
    if len(hindi_chars) > 2:
        return 'hi'
    return 'en'


def search_schemes_for_chat(
    db: Optional[Session],
    query: str,
    profile_ctx: dict,
    top_k: int = 3
) -> List[Scheme]:
    """Search and rank schemes based on query intent and profile context."""
    close_db = False
    if db is None:
        try:
            from app.database.connection import SessionLocal
            db = SessionLocal()
            close_db = True
        except Exception as e:
            logger.error(f"Cannot open DB session: {e}")
            return []

    try:
        all_schemes = db.query(Scheme).filter(Scheme.is_active == True).all()
        if not all_schemes:
            return []

        q_lower = query.lower()

        # Keywords for intent detection
        scholarship_keywords = [
            'scholarship', 'scholarships', 'fellowship', 'stipend',
            'student', 'studying', 'study', 'education', 'school',
            'college', 'university', 'matric', 'post matric', 'tuition', 'degree'
        ]
        farmer_keywords = ['farmer', 'farmers', 'farming', 'agriculture', 'kisan', 'krishi', 'crop', 'land']
        health_keywords = ['health', 'hospital', 'medical', 'insurance', 'ayushman', 'treatment', 'doctor']
        housing_keywords = ['house', 'housing', 'awas', 'home', 'pucca', 'shelter']
        pension_keywords = ['pension', 'elderly', 'old', 'widow', 'disability', 'disabled', 'divyang', 'madhubabu']
        business_keywords = ['loan', 'credit', 'business', 'mudra', 'svanidhi', 'vendor', 'street vendor', 'shop']
        women_keywords = ['girl', 'women', 'woman', 'beti', 'female', 'daughter', 'sukanya']
        general_scheme_keywords = [
            'scheme', 'schemes', 'yojana', 'yojna', 'program', 'government',
            'sarkari', 'help', 'benefit', 'benefits', 'apply', 'qualify', 'eligible'
        ]

        is_scholarship = any(k in q_lower for k in scholarship_keywords)
        is_farmer = any(k in q_lower for k in farmer_keywords)
        is_health = any(k in q_lower for k in health_keywords)
        is_housing = any(k in q_lower for k in housing_keywords)
        is_pension = any(k in q_lower for k in pension_keywords)
        is_business = any(k in q_lower for k in business_keywords)
        is_women = any(k in q_lower for k in women_keywords)
        is_general = any(k in q_lower for k in general_scheme_keywords)

        profile_student = profile_ctx.get('is_student')
        profile_farmer = profile_ctx.get('is_farmer')
        profile_state = (profile_ctx.get('state') or '').strip().lower()

        # Try vector retriever boost
        vector_ids = []
        try:
            from ai.rag.retriever import retrieve_relevant_schemes, ensure_indexed
            ensure_indexed(db)
            vector_ids = retrieve_relevant_schemes(query, top_k=6, db=db)
        except Exception as e:
            logger.debug(f"Retriever indexing/search skipped: {e}")

        scored: List[tuple[Scheme, float]] = []

        for s in all_schemes:
            score = 0.0
            s_name = s.name.lower()
            s_cat = (s.category or '').lower()
            s_desc = (s.description or '').lower()
            s_benefits = (s.benefits or '').lower()
            s_tags = [t.lower() for t in (s.tags or [])]
            s_state = (s.state or '').strip().lower()

            # Vector similarity position boost
            if s.id in vector_ids:
                rank = vector_ids.index(s.id)
                score += (len(vector_ids) - rank) * 4.0

            # Direct word matching
            query_words = [w for w in re.split(r'\W+', q_lower) if len(w) > 2]
            for w in query_words:
                if w in s_name:
                    score += 10.0
                if w in s_tags:
                    score += 8.0
                if w in s_cat:
                    score += 6.0
                if w in s_desc or w in s_benefits:
                    score += 3.0

            # Scholarship specific boosts
            if is_scholarship or profile_student:
                if 'scholarship' in s_tags or 'scholarship' in s_name:
                    score += 25.0
                if 'education' in s_cat or 'education' in s_tags:
                    score += 15.0
                if 'student' in s_tags:
                    score += 12.0

            # Farmer specific boosts
            if is_farmer or profile_farmer:
                if 'agriculture' in s_cat or 'farmer' in s_tags or 'farmer' in s_name or 'kisan' in s_name:
                    score += 25.0

            # Healthcare specific boosts
            if is_health:
                if 'health' in s_cat or 'health' in s_tags or 'ayushman' in s_name:
                    score += 25.0

            # Housing specific boosts
            if is_housing:
                if 'housing' in s_cat or 'housing' in s_tags or 'awas' in s_name:
                    score += 25.0

            # Pension / Social Security specific boosts
            if is_pension:
                if 'pension' in s_tags or 'social security' in s_cat or 'pension' in s_name or 'disability' in s_tags:
                    score += 25.0

            # Business / Loan boosts
            if is_business:
                if 'business' in s_tags or 'loan' in s_tags or 'mudra' in s_name or 'svanidhi' in s_name:
                    score += 25.0

            # Women / Girl Child boosts
            if is_women:
                if 'women' in s_cat or 'girl child' in s_tags or 'beti' in s_name:
                    score += 20.0

            # State filtering and matching
            if profile_state:
                if s_state == profile_state:
                    score += 10.0
                elif not s_state:
                    score += 4.0  # National scheme
                else:
                    if s_state not in q_lower:
                        score -= 8.0  # From a different state
            if s_state and s_state in q_lower:
                score += 15.0

            if score > 0:
                scored.append((s, score))

        scored.sort(key=lambda x: x[1], reverse=True)

        # If scholarship specifically requested, make sure scholarship schemes come first
        if is_scholarship:
            scholarship_schemes = [
                s for s, _ in scored
                if 'scholarship' in (s.name.lower() + ' ' + ' '.join(s.tags or [])) or (s.category or '').lower() == 'education'
            ]
            if scholarship_schemes:
                return scholarship_schemes[:top_k]

        if scored:
            return [s for s, _ in scored[:top_k]]

        # If general inquiry, return top national schemes across key sectors
        if is_general or profile_student or profile_farmer:
            fallback = [s for s in all_schemes if s.government_level == 'central' or not s.state]
            return fallback[:top_k]

        return []
    finally:
        if close_db and db:
            db.close()


def format_scheme_chat_response(
    schemes: List[Scheme],
    query: str,
    profile_ctx: dict,
    language: str = "en"
) -> str:
    """Generate comprehensive, user-friendly markdown detailing the schemes."""
    lang = (language or "en").lower()
    is_hi = lang in ["hi", "hindi"]
    is_or = lang in ["or", "odia"]

    if not schemes:
        if is_hi:
            return (
                "नमस्ते! मैं SchemeSaathi AI हूँ। मैं आपको सरकारी योजनाओं और छात्रवृत्ति (Scholarships) "
                "की पूरी जानकारी दे सकता हूँ।\n\n"
                "आप मुझसे पूछ सकते हैं:\n"
                "- *'मुझे छात्रवृत्ति (Scholarship) योजनाओं की जानकारी चाहिए'*\n"
                "- *'किसान योजनाओं के बारे में बताएं'*\n"
                "- *'आयुष्मान भारत या आवास योजना की जानकारी'*\n\n"
                "या अपनी उम्र, राज्य और व्यवसाय साझा करें ताकि मैं आपके लिए उपयुक्त योजनाएँ खोज सकूँ।"
            )
        elif is_or:
            return (
                "ନମସ୍କାର! ମୁଁ SchemeSaathi AI। ମୁଁ ଆପଣଙ୍କୁ ସରକାରୀ ଯୋଜନା ଏବଂ ଛାତ୍ରବୃତ୍ତି (Scholarships) "
                "ସମ୍ବନ୍ଧରେ ସଠିକ୍ ସୂଚନା ଦେଇପାରିବି।\n\n"
                "ଆପଣ ପଚାରିପାରିବେ:\n"
                "- *'ମୋତେ ଛାତ୍ରବୃତ୍ତି (Scholarship) ଯୋଜନା ବିଷୟରେ କୁହନ୍ତୁ'*\n"
                "- *'କୃଷକ ଯୋଜନାଗୁଡ଼ିକ କ'ଣ ଅଛି?'*\n\n"
                "କିମ୍ବା ଆପଣଙ୍କ ବୟସ, ରାଜ୍ୟ ଏବଂ ପେଶା ଜଣାନ୍ତୁ ଯାହାଦ୍ୱାରା ଉପଯୁକ୍ତ ଯୋଜନା ମିଳିପାରିବ।"
            )
        else:
            return (
                "Namaste! I am SchemeSaathi AI. I can help you discover verified government schemes and scholarships.\n\n"
                "You can ask me questions like:\n"
                "- *'I need education scholarship help'*\n"
                "- *'Tell me about farmer schemes'*\n"
                "- *'What healthcare or housing schemes are available?'*\n\n"
                "Or simply tell me your age, state, and occupation to see what you qualify for!"
            )

    # Check if this is primarily scholarships
    is_scholarship_list = any(
        'scholarship' in (s.name.lower() + ' ' + ' '.join(s.tags or [])) or (s.category or '').lower() == 'education'
        for s in schemes
    )

    if is_hi:
        header = (
            "यहाँ आपके लिए उपयुक्त सरकारी छात्रवृत्ति एवं शिक्षा योजनाओं (Scholarship Schemes) का पूरा विवरण दिया गया है:\n\n"
            if is_scholarship_list else
            "यहाँ आपके अनुरोध के आधार पर प्रमुख सरकारी योजनाओं का विवरण दिया गया है:\n\n"
        )
    elif is_or:
        header = (
            "ଏଠାରେ ଆପଣଙ୍କ ପାଇଁ ଉପଯୁକ୍ତ ସରକାରୀ ଛାତ୍ରବୃତ୍ତି ଓ ଶିକ୍ଷା ଯୋଜନା (Scholarship Schemes) ର ବିବରଣୀ ଦିଆଗଲା:\n\n"
            if is_scholarship_list else
            "ଏଠାରେ ଆପଣଙ୍କ ପାଇଁ ଗୁରୁତ୍ୱପୂର୍ଣ୍ଣ ସରକାରୀ ଯୋଜନାଗୁଡ଼ିକର ବିବରଣୀ ଦିଆଗଲା:\n\n"
        )
    else:
        header = (
            "Here are the scholarship and education schemes available for you:\n\n"
            if is_scholarship_list else
            "Here are the relevant government schemes matching your request:\n\n"
        )

    parts = [header]

    for idx, s in enumerate(schemes, 1):
        gov_level = (s.government_level or "Central").title()
        if s.state:
            gov_level = f"State: {s.state}"

        icon = "🎓" if ((s.category or '').lower() == 'education' or 'scholarship' in s.name.lower()) else "🏛️"
        
        if is_hi:
            scheme_block = (
                f"### {idx}. {icon} {s.name}\n"
                f"- **श्रेणी (Category)**: {s.category} ({gov_level})\n"
                f"- **वित्तीय लाभ (Benefits)**: {s.benefits or 'सरकारी मानकों के अनुसार वित्तीय सहायता।'}\n"
                f"- **पात्रता (Eligibility)**: {s.eligibility_summary or 'विस्तृत पात्रता नियमों के अधीन।'}\n"
            )
            if s.application_steps:
                first_step = s.application_steps.splitlines()[0] if s.application_steps else ''
                scheme_block += f"- **आवेदन प्रक्रिया (Application)**: {first_step}\n"
            if s.official_application_url:
                scheme_block += f"- **आधिकारिक पोर्टल (Official Portal)**: [{s.official_application_url}]({s.official_application_url})\n"
        elif is_or:
            scheme_block = (
                f"### {idx}. {icon} {s.name}\n"
                f"- **ବିଭାଗ (Category)**: {s.category} ({gov_level})\n"
                f"- **ଆର୍ଥିକ ଲାଭ (Benefits)**: {s.benefits or 'ସରକାରୀ ନିୟମ ଅନୁଯାୟୀ ଆର୍ଥିକ ସହାୟତା।'}\n"
                f"- **ଯୋଗ୍ୟତା (Eligibility)**: {s.eligibility_summary or 'ନିର୍ଦ୍ଧାରିତ ମାନଦଣ୍ଡ ଅନୁସାରେ।'}\n"
            )
            if s.official_application_url:
                scheme_block += f"- **ଅଫିସିଆଲ୍ ପୋର୍ଟାଲ୍ (Official Portal)**: [{s.official_application_url}]({s.official_application_url})\n"
        else:
            scheme_block = (
                f"### {idx}. {icon} {s.name}\n"
                f"- **Category & Level**: {s.category} ({gov_level})\n"
                f"- **Financial Assistance / Benefits**: {s.benefits or 'Financial support per scheme guidelines.'}\n"
                f"- **Who is Eligible**: {s.eligibility_summary or 'Subject to scheme eligibility criteria.'}\n"
            )
            if s.application_steps:
                first_step = s.application_steps.splitlines()[0] if s.application_steps else ''
                scheme_block += f"- **Application Summary**: {first_step}\n"
            if s.official_application_url:
                scheme_block += f"- **Official Application Portal**: [{s.official_application_url}]({s.official_application_url})\n"

        parts.append(scheme_block)

    if is_hi:
        footer = "\nआप नीचे दिए गए कार्ड्स में 'View Details' या 'Check Eligibility' पर क्लिक करके अपनी पात्रता जांच सकते हैं।"
    elif is_or:
        footer = "\nତଳେ ଥିବା କାର୍ଡଗୁଡ଼ିକ ମାଧ୍ୟମରେ ଆପଣ ନିଜର ଯୋଗ୍ୟତା ଏବଂ ଆବଶ୍ୟକୀୟ କାଗଜପତ୍ର ଯାଞ୍ଚ କରିପାରିବେ।"
    else:
        footer = "\nYou can explore the scheme cards below to check your eligibility, review required documents, or proceed to the official application portal."

    parts.append(footer)
    return "\n".join(parts)


def get_mock_response(
    message: str,
    history: list,
    profile_ctx: dict,
    db: Optional[Session] = None,
    language: str = "en"
) -> ChatResponse:
    extracted = extract_profile_from_text(message)

    # Merge context with newly extracted fields for matching
    merged_ctx = {**profile_ctx, **extracted}

    # Search for matching schemes
    schemes = search_schemes_for_chat(db, message, merged_ctx, top_k=3)

    lang = detect_language(message)
    if language and language != "english" and language != "en":
        if language in ["hindi", "hi"]:
            lang = "hi"
        elif language in ["odia", "or"]:
            lang = "or"

    response_text = format_scheme_chat_response(schemes, message, merged_ctx, language=lang)

    ep = ExtractedProfile(**{k: v for k, v in extracted.items() if k in ExtractedProfile.model_fields}) if extracted else None
    scheme_items = [SchemeListItem.model_validate(s) for s in schemes]

    return ChatResponse(
        message=response_text,
        extracted_profile=ep,
        suggested_schemes=[s.id for s in schemes],
        schemes=scheme_items,
        language_detected=lang,
        is_mock=True
    )


def get_bedrock_response(
    message: str,
    history: list,
    profile_ctx: dict,
    language: str = "en",
    db: Optional[Session] = None
) -> ChatResponse:
    settings = get_settings()

    # Search schemes first so Bedrock has official scheme context or fallback can use them
    extracted = extract_profile_from_text(message)
    merged_ctx = {**profile_ctx, **extracted}
    schemes = search_schemes_for_chat(db, message, merged_ctx, top_k=3)

    if settings.use_mock_ai or not settings.is_aws_configured:
        return get_mock_response(message, history, profile_ctx, db=db, language=language)

    try:
        import boto3
        bedrock = boto3.client(
            'bedrock-runtime',
            region_name=settings.aws_region,
            aws_access_key_id=settings.aws_access_key_id or None,
            aws_secret_access_key=settings.aws_secret_access_key or None,
            aws_session_token=settings.aws_session_token or None
        )

        from ai.prompts.system_prompt import build_system_prompt
        lang_code = "en"
        if language in ["hi", "hindi"]:
            lang_code = "hi"
        elif language in ["or", "odia"]:
            lang_code = "or"

        system_prompt = build_system_prompt(lang_code)

        # Append verified scheme data to system prompt
        if schemes:
            scheme_details_txt = "\n\n".join([
                f"Scheme Name: {s.name}\n"
                f"Category: {s.category} ({s.government_level or 'Central'})\n"
                f"State: {s.state or 'National'}\n"
                f"Benefits: {s.benefits}\n"
                f"Eligibility: {s.eligibility_summary}\n"
                f"Application Steps: {s.application_steps}\n"
                f"Official Application URL: {s.official_application_url}"
                for s in schemes
            ])
            system_prompt += f"\n\nVERIFIED GOVERNMENT SCHEME INFORMATION FROM DATABASE:\n{scheme_details_txt}\n\nAlways present these scheme details clearly including their benefits, eligibility, and official URLs."

        messages = []
        for h in history[-10:]:
            messages.append({"role": h.role, "content": h.content})
        messages.append({"role": "user", "content": message})

        body = json.dumps({
            "anthropic_version": "bedrock-2023-05-31",
            "max_tokens": 1024,
            "system": system_prompt,
            "messages": messages
        })

        response = bedrock.invoke_model(
            modelId=settings.aws_bedrock_model_id,
            body=body,
            contentType='application/json',
            accept='application/json'
        )
        result = json.loads(response['body'].read())
        assistant_msg = result['content'][0]['text']

        lang = detect_language(message)
        ep = ExtractedProfile(**{k: v for k, v in extracted.items() if k in ExtractedProfile.model_fields}) if extracted else None
        scheme_items = [SchemeListItem.model_validate(s) for s in schemes]

        return ChatResponse(
            message=assistant_msg,
            extracted_profile=ep,
            suggested_schemes=[s.id for s in schemes],
            schemes=scheme_items,
            language_detected=lang,
            is_mock=False
        )
    except Exception as e:
        logger.error(f"Bedrock call failed: {e}. Falling back to mock scheme generator.")
        return get_mock_response(message, history, profile_ctx, db=db, language=language)
