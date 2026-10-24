# JanSathiii AI: Complete System Functionality & Backend Architecture Guide

> **Official System & Backend Documentation for JanSathiii AI**  
> *AI-Powered Citizen-Centric Government Scheme Discovery & Eligibility Engine*  
> **Repository**: [https://github.com/Dhruv-Sojitra/JanSathiii.git](https://github.com/Dhruv-Sojitra/JanSathiii.git)

---

## 1. Executive Summary & Core Purpose

In India, hundreds of welfare schemes are launched by Central and State Governments covering education, agriculture, healthcare, housing, pensions, and financial inclusion. However, millions of eligible citizens miss out because:
1. **Information Asymmetry**: Complex eligibility criteria and scattered government circulars.
2. **Language Barriers**: Legalistic English/Hindi terminology confusing non-English speakers.
3. **Application Complexity**: Uncertainty around required documentation and official portal links.
4. **LLM Hallucination Risk**: Generic AI models frequently invent or misstate government qualifications.

### How JanSathiii AI Solves This
**JanSathiii AI** bridges this gap through a **hybrid AI-and-rule architecture**:
- **Deterministic Statutory Rule Engine**: Mathematically verifies age, income, caste, state, and occupation rules to guarantee zero hallucinations on eligibility.
- **Natural Language Conversational Assistant**: Allows citizens to converse in their natural tongue (English, Hindi, Odia, Gujarati, etc.) using AWS Bedrock Claude/Titan or offline fallback.
- **Automated Profile Entity Extraction**: Converts conversational statements (*"I am a 21 year old student from Odisha with family income 1.5 lakh"*) directly into structured profile attributes.
- **Document Readiness & OCR**: Verifies necessary documents (Aadhaar, Income Certificate, Student ID, Bank Passbook) using AWS Textract / heuristic classification.
- **Official Government Redirection**: Provides official portal links, verified application steps, and disclaimers rather than attempting citizen impersonation.

---

## 2. High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                                   CLIENT LAYER (Browser)                                    │
│                                                                                             │
│  React 18 + Vite SPA  ──  TailwindCSS (Light / Dark Mode)  ──  Lucide Icons                 │
│  • Landing Page       • Scheme Explorer & Bookmarks      • Document Center                  │
│  • Citizen Profile    • Interactive AI Chatbot            • Application Tracker             │
└──────────────────────────────────────────────┬──────────────────────────────────────────────┘
                                               │ HTTP / REST (JSON)
                                               ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                                 API GATEWAY LAYER (FastAPI)                                 │
│                                                                                             │
│  backend/app/main.py (Port 8000)                                                            │
│  • CORS Middleware           • Global Exception Handler      • Pydantic Input Validation    │
│  • Startup Indexing Hook     • Session-based State Binding   • Interactive Swagger /docs    │
└──────────────┬───────────────────────────────┬──────────────────────────────┬───────────────┘
               │                               │                              │
               ▼                               ▼                              ▼
┌──────────────────────────────┐ ┌──────────────────────────────┐ ┌───────────────────────────┐
│     API ROUTE CONTROLLERS    │ │    CORE BUSINESS SERVICES    │ │      DATABASE LAYER       │
│                              │ │                              │ │   (SQLite / PostgreSQL)   │
│ • /api/health                │ │ • scheme_service.py          │ │ • CitizenProfile          │
│ • /api/profile               │ │   - Multi-parameter filtering│ │ • Scheme                  │
│ • /api/schemes               │ │   - Search query optimizer   │ │ • EligibilityRule         │
│ • /api/eligibility           │ │ • document_service.py        │ │ • RequiredDocument        │
│ • /api/documents             │ │   - MIME & Size validator    │ │ • UploadedDocument        │
│ • /api/chat                  │ │   - Heuristic doc classifier │ │ • Application             │
│ • /api/applications          │ │   - PII Sanitization         │ │ • ChatMessage             │
└──────────────┬───────────────┘ └──────────────┬───────────────┘ └─────────────┬─────────────┘
               │                                │                               │
               └────────────────────────────────┼───────────────────────────────┘
                                                │
                                                ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                                   INTELLIGENCE & AI LAYER                                   │
│                                                                                             │
│  ai/eligibility/engine.py (Deterministic Statutory Rule Engine)                             │
│  • Evaluates rules: gte, lte, eq, in, contains across age, income, state, caste, etc.       │
│  • Handles beneficiary context: self, child (e.g. Sukanya), family                          │
│  • Generates transparent audit trails: pass (✓), fail (✕), unknown (⚠)                      │
│                                                                                             │
│  ai/rag/retriever.py (Hybrid Semantic Search & Vector Embeddings)                           │
│  • Bedrock Titan Embeddings (Cloud)  OR  256-dim Character N-Gram Cosine Vector (Offline)   │
│  • Fast in-memory semantic indexing of all active schemes                                   │
│                                                                                             │
│  ai/chatbot/bedrock_client.py (Conversational Agent & Entity Extractor)                     │
│  • AWS Bedrock Claude/Titan  OR  Local Multi-turn Reasoning Engine                          │
│  • Regex entity extraction from chat (age, income, state, student, farmer)                  │
│  • Contextual prompt engineering with multilingual persona (English, Hindi, Odia, etc.)     │
└───────────────────────────────────────────────┬─────────────────────────────────────────────┘
                                                │
                                                ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                                  CLOUD INTEGRATIONS / MOCKS                                 │
│                                                                                             │
│  AWS Bedrock (GenAI) ── AWS Textract (OCR) ── AWS S3 (Encrypted Doc Vault)                 │
│  (Seamless zero-cost fallback: works 100% offline with built-in mock services)              │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Frontend vs Backend Responsibilities

| Responsibility Area | Frontend (`frontend/`) | Backend (`backend/` + `ai/`) |
| :--- | :--- | :--- |
| **User Interface** | Responsive React layout, Dark/Light mode theme toggle, accessibility | None (Headless REST API) |
| **Session Tracking** | Generates & stores unique `session_id` in `localStorage` | Associates citizen profiles, chat logs, uploaded docs, and applications to `session_id` |
| **Validation** | Form input masks, instant feedback | Strict Pydantic model validation (`age: 0-120`, allowed MIME types, max file sizes) |
| **Scheme Discovery** | UI filters (Category pills, Search bar, A-Z sort, Bookmarking) | Database query engine with full-text search and rule filtering |
| **Eligibility Assessment** | Visual cards with checkmarks/crosses & percentage badge | **Statutory deterministic rule evaluation** (`ai/eligibility/engine.py`) |
| **AI Conversational Chat** | Chat bubbles, typing indicators, copy response button | Conversation history buffering, prompt injection protection, entity extraction, Bedrock integration |
| **Document Processing** | Drag-and-drop file upload, readiness progress bars | Upload to S3/Mock, MIME security check, Textract OCR parsing, PII redaction |
| **Data Persistence** | Theme preference, cached active profile snapshot | Relational database (SQLite/PostgreSQL) with relational foreign key cascading |

---

## 4. Backend Codebase Directory Map

```
backend/
├── app/
│   ├── config.py                 # Pydantic Settings reading .env (AWS toggles, DB URL, CORS)
│   ├── main.py                   # FastAPI initialization, CORS, global error handling, startup indexing
│   ├── database/
│   │   ├── connection.py         # SQLAlchemy engine, SessionLocal factory, init_db()
│   │   └── models.py             # SQLAlchemy models for all 8 database tables
│   ├── routes/
│   │   ├── health.py             # GET /api/health (Database & AWS status check)
│   │   ├── profile.py            # POST, GET, PUT /api/profile (Citizen demographic management)
│   │   ├── schemes.py            # GET /api/schemes, details, documents, and application guides
│   │   ├── eligibility.py        # POST /api/eligibility/check (Rule engine endpoint)
│   │   ├── documents.py          # POST /api/documents/upload, /analyze, /checklist
│   │   ├── chat.py               # POST /api/chat (Multi-turn AI chat & auto-profile sync)
│   │   └── applications.py       # GET, POST, PUT /api/applications (Status tracking)
│   ├── schemas/
│   │   ├── profile.py            # Pydantic models: ProfileCreate, ProfileUpdate, ProfileResponse
│   │   ├── scheme.py             # Pydantic models: SchemeListItem, SchemeDetailResponse, SearchRequest
│   │   ├── eligibility.py        # Pydantic models: CriterionResult, EligibilityCheckResponse
│   │   ├── document.py           # Pydantic models: DocumentUploadResponse, ChecklistResponse
│   │   └── chat.py               # Pydantic models: ChatRequest, ChatResponse, ExtractedProfile
│   ├── services/
│   │   ├── scheme_service.py     # SQL query building with filters (age, income, state, text search)
│   │   └── document_service.py   # Secure file uploads, Textract OCR, heuristic classifier, PII redaction
│   └── utils/
├── requirements.txt              # Production Python package dependencies
├── seed.py                       # Database seeding script with realistic Indian govt schemes
└── start.sh                      # Production startup shell script (Uvicorn launcher)

ai/
├── chatbot/
│   └── bedrock_client.py         # Bedrock Claude/Titan invocation + regex entity extraction
├── eligibility/
│   └── engine.py                 # Pure deterministic statutory rule evaluator
├── prompts/
│   └── system_prompt.py          # Multilingual system prompt persona (English, Hindi, Odia)
└── rag/
    ├── pipeline.py               # Retrieval-Augmented Generation execution flow
    └── retriever.py              # In-memory vector database with Cosine Similarity search
```

---

## 5. Database Schema & Relational Design

The database uses SQLAlchemy ORM and supports SQLite (for effortless local development) and PostgreSQL (for production).

```
   ┌──────────────────────┐                     ┌────────────────────────┐
   │   CitizenProfile     │ 1                 * │   UploadedDocument     │
   ├──────────────────────┼────────────────────►├────────────────────────┤
   │ id (PK)              │                     │ id (PK)                │
   │ session_id (Unique)  │                     │ profile_id (FK)        │
   │ name, age, gender    │                     │ s3_key, mime_type      │
   │ state, district      │                     │ document_type          │
   │ annual_income        │                     │ classification_conf    │
   │ is_student, is_farmer│                     │ extracted_data (JSON)  │
   │ has_disability       │                     └────────────────────────┘
   │ caste_category       │
   │ is_bpl               │
   │ has_aadhaar          │
   │ education_level      │
   └──────────┬───────────┘
              │ 1
              │                                 ┌────────────────────────┐
              │                               * │   EligibilityRule      │
              │                      ┌─────────►├────────────────────────┤
              │                      │          │ id (PK)                │
              │                      │          │ scheme_id (FK)         │
              │                      │          │ field, operator, value │
              │                      │          │ is_mandatory           │
              │                      │          └────────────────────────┘
              │                      │
              │                      │          ┌────────────────────────┐
              │                      │        * │   RequiredDocument     │
              │                      │   ┌─────►├────────────────────────┤
              │                      │   │      │ id (PK)                │
              │                      │   │      │ scheme_id (FK)         │
              │                      │   │      │ document_type, name    │
              │                      │   │      │ is_mandatory           │
              │                      │   │      └────────────────────────┘
              │                      │   │
              │ *                    │ 1 │ 1    ┌────────────────────────┐
   ┌──────────▼───────────┐        ┌─┴───┴────┐ │   SchemeSource         │
   │     Application      │ *    1 │  Scheme  │*├────────────────────────┤
   ├──────────────────────┼───────►├──────────┼►│ id (PK)                │
   │ id (PK)              │        │ id (PK)  │ │ scheme_id (FK)         │
   │ profile_id (FK)      │        │ name     │ │ source_type, url       │
   │ scheme_id (FK)       │        │ category │ └────────────────────────┘
   │ status (Enum)        │        │ state    │
   │ eligibility_result   │        │ benefits │
   │ documents_ready      │        │ rules    │
   │ documents_missing    │        └──────────┘
   │ reference_number     │
   └──────────────────────┘
```

### Table Details:
1. **`citizen_profiles`**: Holds citizen demographic information keyed to `session_id`. No passwords or sensitive Aadhaar numbers are stored.
2. **`schemes`**: The central catalog of welfare programs with benefit summaries, categories, governing departments, and official application URLs.
3. **`eligibility_rules`**: Discrete eligibility constraints associated with schemes (e.g. `field="annual_income"`, `operator="lte"`, `value="250000"`).
4. **`required_documents`**: Mandatory and optional documents needed for each scheme (e.g. `document_type="income_certificate"`).
5. **`uploaded_documents`**: Metadata for uploaded citizen files, Textract OCR status, classification confidence, and sanitized extracted fields.
6. **`applications`**: Application readiness tracking for a citizen on a specific scheme (`not_started`, `documents_missing`, `ready_to_apply`, `application_started`, `submitted`).
7. **`scheme_sources`**: Traceability records linking each scheme to official government gazettes, press releases, and ministry portals.
8. **`chat_messages`**: Persistent conversational history per session with language tag and auto-extracted profile JSON.

---

## 6. Complete API Endpoint Reference

The backend provides 14 RESTful JSON endpoints grouped into 7 functional domains:

### 1. Health & Infrastructure
- **`GET /api/health`**
  - **Purpose**: System health check verifying database connection, environment mode, and AWS services availability.
  - **Response**: `{ status: "healthy", database: "connected", mock_ai: true, aws_configured: false, version: "1.0.0" }`

### 2. Citizen Profile Management
- **`POST /api/profile`**
  - **Purpose**: Create a new citizen profile linked to a unique `session_id`.
  - **Payload**: `ProfileCreate` (name, age, gender, state, district, income, student/farmer status, etc.)
  - **Status Code**: `201 Created` (returns `409 Conflict` if session already exists).
- **`GET /api/profile/{session_id}`**
  - **Purpose**: Fetch an existing profile by session ID.
- **`PUT /api/profile/{session_id}`**
  - **Purpose**: Partial update of citizen demographics.

### 3. Scheme Catalog & Discovery
- **`GET /api/schemes`**
  - **Query Params**: `query`, `state`, `category`, `government_level`, `is_student`, `is_farmer`, `max_income`, `page`, `page_size`.
  - **Purpose**: Multi-criteria scheme search. Automatically returns national schemes plus schemes specific to the citizen's state.
- **`GET /api/schemes/{scheme_id}`**
  - **Purpose**: Full details of a scheme including eligibility rules, required documents, benefits, and official sources.
- **`GET /api/schemes/{scheme_id}/documents`**
  - **Purpose**: Returns the list of mandatory and optional documents for a scheme.
- **`GET /api/schemes/{scheme_id}/application`**
  - **Purpose**: Official step-by-step application guide, verified portal link, and citizen disclaimer.

### 4. Eligibility Assessment Engine
- **`POST /api/eligibility/check`**
  - **Payload**: `{ profile_session_id: "...", scheme_id: 12 }`
  - **Purpose**: Triggers the deterministic rule engine.
  - **Response**:
    - `status`: `"potentially_eligible"` | `"not_matching_known_criteria"` | `"needs_more_information"`
    - `match_score`: `0.0` to `1.0` (percentage of passed criteria)
    - `passed`: List of criteria satisfied with clear citizen-friendly explanations (`✓ Your age (21) meets...`)
    - `failed`: List of criteria violated (`✕ Your income (450,000) exceeds...`)
    - `unknown`: Missing criteria that citizen has not yet specified (`⚠ Not checked because you haven't provided...`)
    - `missing_documents`: Documents required but not yet uploaded

### 5. Document Center & OCR
- **`POST /api/documents/upload`**
  - **Payload**: `multipart/form-data` with `file` and `session_id`.
  - **Validation**: Enforces allowed MIME types (PDF, PNG, JPG, WEBP) and maximum file size (10 MB).
  - **Processing**: Uploads to encrypted AWS S3 bucket (or local mock), runs classification.
- **`POST /api/documents/analyze/{doc_id}`**
  - **Purpose**: Runs AWS Textract OCR (or offline heuristic classifier) to detect document type, extract sanitized text, and correlate against active scheme requirements.
- **`GET /api/documents/checklist/{session_id}/{scheme_id}`**
  - **Purpose**: Generates a document readiness checklist for a scheme, calculating:
    - `total_required`, `available`, `missing`, and `readiness_percentage` (e.g., 75%).

### 6. Conversational AI Assistant
- **`POST /api/chat`**
  - **Payload**: `{ session_id: "...", message: "...", history: [...], language: "en", profile_context: {...} }`
  - **Processing**:
    1. Stores user message in database.
    2. Enriches context with citizen profile from database.
    3. Invokes Amazon Bedrock or local fallback assistant with custom multilingual prompt persona.
    4. Automatically extracts demographic entities from user's message using regex.
    5. **Auto-updates citizen profile** in the database with newly learned attributes.
    6. Returns assistant response, suggested scheme IDs, and extracted profile.

### 7. Application Tracker
- **`GET /api/applications/{session_id}`**
  - **Purpose**: Returns all schemes the citizen is currently tracking with their statuses.
- **`POST /api/applications/start`**
  - **Query Params**: `session_id`, `scheme_id`
  - **Purpose**: Initializes tracking. Automatically checks eligibility and missing documents:
    - If documents missing ➔ sets status to `documents_missing`.
    - If eligible and documents ready ➔ sets status to `ready_to_apply`.
- **`PUT /api/applications/{app_id}/status`**
  - **Purpose**: Allows updating application stage (`application_started`, `submitted`) and attaching the official government application reference number.

---

## 7. Deep Dive: What the Backend AI Engines Do

### A. The Deterministic Rule Engine (`ai/eligibility/engine.py`)
Unlike generic AI chatbots that guess eligibility, JanSathiii AI uses a **statutory rule engine**:
1. **Mathematical Operators**: Supports `gte` (>=), `lte` (<=), `eq` (==), `neq` (!=), `in` (set inclusion), and `contains`.
2. **Type-Safe Evaluation**:
   - Compares integers for `age`.
   - Compares floating-point values for `annual_income`.
   - Evaluates booleans for `is_student`, `is_farmer`, `has_disability`, `is_bpl`.
   - Performs case-insensitive list matching for `state`, `gender`, and `caste_category`.
3. **Beneficiary Context Guard**:
   - For schemes like *Sukanya Samriddhi Yojana* or *Beti Bachao Beti Padhao*, the beneficiary is the **child**, not the parent.
   - The engine flags parental age/gender as `unknown` with a friendly prompt: *"This criterion applies to your child. Please provide the age/gender of your child."*
4. **Transparent Audit Trail**: Every evaluated rule outputs a human-readable explanation:
   - `✓ Your annual family income (₹1,50,000) meets the published requirement (Annual Family Income <= 250000)`
   - `✕ Your age (32) does not meet the published requirement (Age <= 25)`

### B. Semantic Vector Search & RAG (`ai/rag/retriever.py`)
1. **Embedding Generation**:
   - In cloud mode: Calls AWS Bedrock Titan (`amazon.titan-embed-text-v1`).
   - In offline mode: Computes a 256-dimensional character bigram frequency vector normalized to unit Euclidean length.
2. **Vector Indexing**:
   - Indexes scheme name, description, category, benefits, eligibility summary, and tags.
   - Computes Cosine Similarity between citizen queries and scheme vectors to retrieve top matching schemes in sub-millisecond time.

### C. Natural Language Entity Extraction (`ai/chatbot/bedrock_client.py`)
The chat pipeline continuously analyzes conversation text:
- Matches age patterns: `"22 years old"`, `"age 25"`, `"19 yrs"` ➔ `extracted.age = 22`
- Matches income patterns: `"2.5 lakh"`, `"income is 180000"`, `"Rs 50,000"` ➔ `extracted.annual_income = 250000.0`
- Matches states: All 28 Indian States & 3 Union Territories (e.g. `"living in Gujarat"`, `"Maharashtra"`)
- Matches student/farmer status: `"studying in college"`, `"farmer"`, `"kisan"`, `"farming"`
- **Auto-Sync**: Automatically updates the database profile without forcing the user to leave the chat.

---

## 8. Offline & Cloud Hybrid Architecture

JanSathiii AI was engineered with **dual-mode resilience**:

```
                       ┌────────────────────────────────────────┐
                       │          Config Detection              │
                       │    (AWS credentials & S3 bucket)       │
                       └───────────────────┬────────────────────┘
                                           │
                    ┌──────────────────────┴──────────────────────┐
                    │                                             │
             AWS Configured                              AWS Not Configured
                    │                                             │
                    ▼                                             ▼
       ┌─────────────────────────┐                   ┌─────────────────────────┐
       │     PRODUCTION CLOUD    │                   │   OFFLINE RESILIENT     │
       │                         │                   │                         │
       │ • AWS Bedrock Claude    │                   │ • Local Multi-turn AI   │
       │ • AWS Textract OCR      │                   │ • Heuristic Classifier  │
       │ • Encrypted S3 Buckets  │                   │ • Mock S3 In-Memory     │
       │ • Bedrock Titan Vectors │                   │ • Character N-Gram RAG  │
       └─────────────────────────┘                   └─────────────────────────┘
```

**Why this matters**:
- Anyone can clone the repository and run the full stack immediately on any machine without paying for AWS API keys.
- When deployed to AWS production, toggling `.env` credentials instantly enables enterprise-grade cloud AI.

---

## 9. Security, Privacy & Ethical AI Design

1. **Non-Custodial Design**: JanSathiii AI **never** asks for or stores full Aadhaar numbers, PAN numbers, or banking passwords.
2. **PII Sanitization**: Documents uploaded are inspected only for classification. Document numbers and names are masked/redacted (`[REDACTED]`, `XXXX`).
3. **No Impersonation**: The system explicitly provides direct official government portal links rather than submitting on behalf of citizens.
4. **Clear Disclaimers**: Every eligibility calculation and AI answer contains a clear legal disclaimer:
   > *"This is an AI-assisted assessment based on published criteria. It does not constitute an official eligibility determination by the government."*

---

## 10. How to Run & Verify

### Start the Backend
```bash
# 1. From workspace root, navigate to backend
cd backend

# 2. Activate virtual environment
# Windows:
.\venv\Scripts\Activate.ps1
# Linux/macOS:
source venv/bin/activate

# 3. Start Uvicorn development server
uvicorn app.main:app --reload --port 8000
```

### Start the Frontend
```bash
# 1. Navigate to frontend
cd frontend

# 2. Install dependencies (if needed)
npm install

# 3. Start Vite dev server
npm run dev
```

### Interactive API Documentation
Once running, open your browser:
- **Interactive Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **Alternative ReDoc UI**: [http://localhost:8000/redoc](http://localhost:8000/redoc)
- **Health Verification**: [http://localhost:8000/api/health](http://localhost:8000/api/health)
- **Web App**: [http://localhost:5174/](http://localhost:5174/)

---
*Created for JanSathiii AI by Dhruv-Sojitra. Open-source, citizen-first, resilient.*
