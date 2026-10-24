# 🇮🇳 JanSathiii AI

### AI-Powered Government Scheme Discovery & Application Assistant

> **Empowering Indian citizens to discover government schemes they may be eligible for, understand eligibility requirements, prepare the required documents, and apply through verified official channels.**

<p align="center">

[![Live Demo](https://img.shields.io/badge/Live%20Demo-JanSathiii-brightgreen?style=for-the-badge&logo=github)](https://Dhruv-Sojitra.github.io/JanSathiii/)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-black?style=for-the-badge&logo=github)](https://github.com/Dhruv-Sojitra/JanSathiii)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](#-license)

</p>

---

## 📌 Problem

India has thousands of central and state government welfare schemes, but many citizens struggle to:

* Find schemes relevant to their situation
* Understand complex eligibility criteria
* Determine whether a scheme applies to themselves or a family member
* Identify the documents required for application
* Understand the application process
* Find the correct official government portal

This creates an information gap between **government schemes and the citizens they are designed to support**.

---

## 💡 Our Solution

**JanSathiii AI** is an intelligent citizen-assistance platform that simplifies government scheme discovery.

Instead of manually searching through multiple government websites, users can provide basic information about themselves or their family through a conversational interface or structured profile.

JanSathiii then helps users:

**Understand → Discover → Check Eligibility → Prepare Documents → Apply**

The platform is designed to provide transparent information and direct users to **official government application channels**.

---

# ✨ Key Features

### 🎯 1. Intelligent Eligibility Engine
Evaluates scheme eligibility using the applicant's profile and scheme-specific criteria:
* Applicant applying for themselves
* Parent applying for a child (e.g. Sukanya Samriddhi)
* Family-based eligibility & annual income limits
* Age requirements & education level
* Gender-specific & women empowerment schemes
* Farmer, student, BPL, & Divyangjan (disability) criteria
* State and location-specific welfare programs

---

### 🌙 2. Dark Mode ("Dork Mode") & Rich Aesthetics
* **Theme Toggle**: Seamless light/dark mode switch with animated Sun/Moon icons in both desktop and mobile navigation.
* **Persistent Preferences**: Remembers citizen theme preference via `localStorage` with fallback to operating system settings.
* **Curated Dark Palette**: High-contrast, deep slate backgrounds (`slate-950` / `slate-850`), tricolor accents, and readable typography.

---

### 🔖 3. Scheme Bookmarking & Citizen Dashboard
* **1-Click Bookmark**: Save any scheme from recommendation cards or scheme detail pages.
* **Dynamic Badge Counter**: Live bookmark counter in the navigation bar.
* **Dedicated Dashboard Section**: View, manage, and remove saved schemes directly from the citizen dashboard alongside active application guides.

---

### 🤖 4. AI Assistant
* **Conversational Discovery**: Citizens can chat in English or Hindi to explain their situation in natural language.
* **Auto-Profile Extraction**: The AI extracts parameters (age, state, income, occupation) directly from conversation and surfaces matching schemes in real-time.
* **Suggested Starter Prompts**: Quick prompt chips for farmer schemes, education scholarships, and healthcare assistance.
* **1-Click Response Copy**: Easily copy scheme information and eligibility criteria to clipboard.

---

### 🔎 5. Personalized Scheme Discovery & Quick Filters
* **Quick Category Pills**: 1-tap category discovery (*Agriculture*, *Education*, *Healthcare*, *Women*, *Housing*, *Pension*).
* **Profile-Driven Personalization**: Toggle personalized matching to filter schemes by state, income, student, and farmer status.
* **Sorting Options**: Sort schemes by Name (A-Z), Category, or Match Score.
* **Full Search**: Instant search by scheme name, keyword, or central/state jurisdiction.

---

### 📋 6. Transparent Eligibility Breakdown
Instead of a simple pass/fail, JanSathiii provides criterion-by-criterion reasoning:
```text
✅ Age Requirement
You satisfy the required age criteria.

✅ Income Requirement
Your reported annual income is within the specified limit.

❌ State Requirement
This scheme is currently available only in selected states.
```

---

### 📁 7. Document Readiness Checklist
Check your required documentation before applying:
```text
☑ Aadhaar Card
☑ Income Certificate
☑ Bank Account Details
☐ Land Record / RoR
☐ Residence Certificate
```

---

### 🗺️ 8. Step-by-Step Application Guide & Official Portals
* Clear roadmap from document digitization to final submission.
* Direct, verified government portal links (`.gov.in` / `.nic.in`) — **zero middlemen or commission agents**.
* **1-Click Share**: Share schemes with family and community members via Web Share API or direct link copy.

---

# 🏗️ System Architecture

```text
                    ┌─────────────────────────┐
                    │        Citizen          │
                    │  Web / Mobile Browser   │
                    └────────────┬────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │  React 18 + Vite (SPA)  │
                    │  Tailwind CSS (Dark)    │
                    │  Theme & Bookmark Store │
                    └────────────┬────────────┘
                                 │
                         REST API Requests
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │      FastAPI Backend    │
                    │                         │
                    │  Profile Management     │
                    │  Scheme Search & Filter │
                    │  Eligibility Engine     │
                    │  RAG Embedding Search   │
                    │  Bedrock AI Assistant   │
                    └────────────┬────────────┘
                                 │
               ┌──────────────────┼──────────────────┐
               │                  │                  │
               ▼                  ▼                  ▼
       ┌──────────────┐   ┌──────────────┐   ┌──────────────┐
       │ SQLite /     │   │ Eligibility  │   │ Bedrock /    │
       │ PostgreSQL   │   │ Rule Engine  │   │ Titan RAG    │
       └──────────────┘   └──────────────┘   └──────────────┘
               │                  │                  │
               └──────────────────┼──────────────────┘
                                  ▼
                     ┌─────────────────────────┐
                     │ Official Scheme Links  │
                     │ & Application Portals  │
                     └─────────────────────────┘
```

---

# 🛠️ Technology Stack

## Frontend
| Technology | Purpose |
| ---------- | ------- |
| **React 18** | Component-based interactive UI |
| **Vite 5** | High-performance build tool & dev server |
| **Tailwind CSS 3** | Utility-first styling with Class-based Dark Mode |
| **Lucide Icons** | Modern iconography & UI symbols |
| **Axios** | HTTP client with automatic retry on cold starts |

## Backend
| Technology | Purpose |
| ---------- | ------- |
| **Python 3.10+** | Backend runtime |
| **FastAPI** | High-performance asynchronous REST API |
| **SQLAlchemy 2.0** | SQL database ORM & connection management |
| **Pydantic 2** | Strict data validation & schema contracts |
| **Uvicorn** | High-throughput ASGI server |
| **SQLite / PostgreSQL** | Local dev SQLite & production PostgreSQL |

## AI & Cloud Services
| Component | Purpose |
| --------- | ------- |
| **Amazon Bedrock (Claude 3 Haiku)** | Conversational scheme assistant & NLP extraction |
| **Amazon Titan Embeddings** | Vector embeddings for RAG scheme retrieval |
| **Amazon S3 & Textract** | Cloud document storage & automated OCR checklist verification |
| **Built-in Mock AI Mode** | Full offline / mock capability when AWS credentials are not set |

---

# 📂 Project Structure

```text
schemesaathi-ai/
│
├── backend/
│   ├── app/
│   │   ├── config.py           # Application settings & environment parsing
│   │   ├── main.py             # FastAPI entrypoint & router initialization
│   │   ├── database/           # Models, connection, & SQLite/Postgres handlers
│   │   ├── routes/             # REST routes (chat, schemes, profile, eligibility, docs)
│   │   ├── schemas/            # Pydantic input/output validation models
│   │   ├── services/           # Business logic & application services
│   │   └── utils/              # Text processing & helpers
│   ├── requirements.txt        # Backend dependencies
│   ├── seed.py                 # Initial database seeding script
│   └── start.sh                # Production startup script
│
├── frontend/
│   ├── public/
│   │   ├── logo.svg            # Custom JanSathiii vector emblem
│   │   └── favicon.svg         # Browser favicon
│   ├── src/
│   │   ├── components/         # Navbar, SchemeCard, DarkModeToggle, Logo, ChatBubble
│   │   ├── context/            # ThemeContext (Dark Mode) & SessionContext (Bookmarks)
│   │   ├── pages/              # LandingPage, AIAssistant, SchemeRecommendations, Dashboard
│   │   ├── services/           # Axios API service with auto-retry
│   │   ├── App.jsx             # Root React component & routing
│   │   └── index.css           # Global Tailwind utilities & dark mode styling
│   ├── package.json
│   ├── tailwind.config.js      # Tailwind configuration with darkMode: 'class'
│   └── vite.config.js          # Vite config & API reverse proxy
│
├── ai/
│   ├── chatbot/                # Bedrock client & profile extraction logic
│   ├── eligibility/            # Rule-based eligibility evaluation engine
│   ├── prompts/                # Multilingual system prompts (EN, HI, OR)
│   └── rag/                    # Vector retriever & RAG scheme indexing
│
├── requirements.txt            # Root-level requirements reference
├── render.yaml                 # Render cloud deployment blueprint
├── README.md                   # Project documentation
└── LICENSE                     # Open source license
```

---

# 🚀 Live Demo

* **Frontend Application**: [https://Dhruv-Sojitra.github.io/JanSathiii/](https://Dhruv-Sojitra.github.io/JanSathiii/)
* **GitHub Repository**: [https://github.com/Dhruv-Sojitra/JanSathiii](https://github.com/Dhruv-Sojitra/JanSathiii)

---

# ⚡ Quick Start

## 1. Clone the Repository

```bash
git clone https://github.com/Dhruv-Sojitra/JanSathiii.git
cd JanSathiii
```

---

## 2. Backend Setup

Navigate to the `backend` directory:
```bash
cd backend
```

Create and activate a virtual environment:

### Windows
```bash
python -m venv venv
venv\Scripts\activate
```

### macOS / Linux
```bash
python3 -m venv venv
source venv/bin/activate
```

Install backend dependencies:
```bash
pip install -r requirements.txt
```

Seed the database with central & state schemes:
```bash
python seed.py
```

Start the FastAPI development server:
```bash
uvicorn app.main:app --reload --port 8000
```

* API Endpoint: `http://localhost:8000`
* Interactive API Docs (Swagger): `http://localhost:8000/docs`
* Health Check: `http://localhost:8000/api/health`

---

## 3. Frontend Setup

Open a new terminal:
```bash
cd frontend
```

Install dependencies:
```bash
npm install
```

Start the Vite development server:
```bash
npm run dev
```

The frontend will be available at: `http://localhost:5173` (or `http://localhost:5174`).

---

# 🚀 Deployment

### GitHub Pages (Frontend)
The React application builds automatically using GitHub Actions:
```bash
npm run build
```
Generates production assets in `dist/` with fallback `404.html` routing.

### Render (Backend)
Configured via [render.yaml](file:///d:/new/schemesaathi-ai/render.yaml):
* **Build Command**: `pip install -r requirements.txt`
* **Start Command**: `bash start.sh`

---

# 🔐 Security & Citizen Trust

* 🔒 **Data Privacy**: No Aadhaar numbers or personal identifiers are stored on servers without explicit user consent.
* 🛡️ **Zero Commission / Middlemen**: Direct links to verified `.gov.in` and `.nic.in` government portals only.
* 📌 **Clear Transparency**: AI assessments are presented as informational readiness guides rather than official government determinations.

---

# 🎯 Target Beneficiaries

* 🌾 **Farmers & Agricultural Workers** (PM-KISAN, Kisan Credit Card)
* 🎓 **Students & Youth** (Post-Matric Scholarships, Pre-Matric, Higher Education Grants)
* 👩 **Women & Girls** (Sukanya Samriddhi, PMMVY, Stand-Up India)
* 🏥 **Patients & Families** (Ayushman Bharat / PM-JAY)
* 🏠 **Rural & Urban Families** (PM Awas Yojana Housing)
* 👴 **Senior Citizens & Divyangjan** (Atal Pension, NSAP, Disability Assistance)

---

# 📜 License

This project is licensed under the **MIT License**. See the `LICENSE` file for details.

---

## 🇮🇳 JanSathiii AI
**Apka Digital Saathi for Government Schemes.**

> *Technology should not make citizens search harder. It should make government services accessible to everyone.*
