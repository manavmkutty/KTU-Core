# KTU-Core

> A unified academic platform for students of **APJ Abdul Kalam Technological University (KTU)**.


## 📌 Overview

**KTU-Core** solves one of the most common problems KTU students face — scattered, unreliable academic resources. It brings everything together in one place:

- **Freely access academic resources** — syllabus, notes, and previous year questions (PYQs), all centralized.
- **Estimate Activity Points** — quickly calculate whether you meet KTU's mandatory activity point requirements.
- **Calculate CGPA / SGPA** — built-in calculator with KTU-specific credit and grading logic.
- **Ask an AI Assistant** — a context-aware RAG (Retrieval-Augmented Generation) chatbot powered by LangChain and Groq, trained on KTU materials.

---

## 🚀 Features

| Feature | Description |
|---|---|
| 📚 Resource Repository | Centralized access to syllabus, notes, PYQs, and textbooks filtered by scheme, department, and semester. |
| 🧮 CGPA / SGPA Calculator | Accurate KTU credit-based grade calculation. |
| 🏅 Activity Point Estimator | Estimates your KTU activity point tally. |
| 🤖 AI Chatbot | RAG-based chatbot using LangChain + Groq's Llama 3.3 70B model for context-aware KTU Q&A. |

---

## 🏗️ Architecture

KTU-Core uses a **microservices-inspired** architecture with three distinct, decoupled components:

```
┌─────────────────────────────────────────────────────────────────┐
│  Browser / Client                                               │
│  FRONTEND  (HTML · CSS · JavaScript)          port :3000        │
└────────────────────┬────────────────────────────────────────────┘
                     │  REST API calls (HTTP)
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│  Django Backend Gateway  (Django REST Framework)  port :8000    │
│  - Curriculum & Subject data                                    │
│  - Resource queries (notes / PYQ / textbooks)                  │
│  - Acts as proxy to the Chatbot microservice                    │
└──────────────────────────────┬──────────────────────────────────┘
                               │  Forwards /chat requests (HTTP)
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│  AI Chatbot Microservice  (FastAPI + Uvicorn)   port :8001      │
│  - RAG engine: ChromaDB vector store + SentenceTransformers    │
│  - LLM: Groq Llama 3.3 70B via LangChain                       │
│  - Sliding-window + summary chat memory                        │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
KTU-Core/
├── FRONTEND/                    # Vanilla web app (HTML, CSS, JS)
│   ├── index2.html              # Main page
│   ├── style2.css               # Stylesheet
│   └── script2.js               # All frontend logic & API calls
│
├── BACKEND_DJANGO/              # Django REST API Gateway
│   ├── manage.py
│   ├── requirements.txt
│   ├── db.sqlite3               # SQLite database
│   ├── ktucore_backend/         # Django project settings & root URLs
│   └── core/                   # Main Django app
│       ├── models.py            # ORM models (Curriculum, Subject, Resource…)
│       ├── serializers.py       # DRF serializers
│       ├── views.py             # ViewSets + chat proxy endpoints
│       └── urls.py              # URL routing
│
├── Chatbot/                     # FastAPI AI Microservice
│   ├── api.py                   # FastAPI app, endpoints, startup loader
│   ├── chat.py                  # Core RAG chain, memory management
│   ├── datastore.py             # ChromaDB setup & PDF ingestion
│   ├── main.py                  # Entry point
│   ├── requirements.txt
│   ├── api.env                  # Groq API key (not committed)
│   └── data/                   # Folder for KTU PDF documents
│
├── Guide.md                     # Full step-by-step setup guide
└── README.md                    # This file
```

---

## 🗄️ Database Models (Django — `core/models.py`)

### `Curriculum`
Represents a unique combination of **scheme + department + semester**.
| Field | Type | Notes |
|---|---|---|
| `scheme` | CharField | e.g., `"2019"`, `"2024"` |
| `dept` | CharField | e.g., `"CSE"`, `"ECE"` |
| `semester` | CharField | e.g., `"S3"`, `"S5"` |

Unique constraint: `(scheme, dept, semester)`.

### `Subject`
Linked to a `Curriculum` (many subjects per curriculum).
| Field | Type | Notes |
|---|---|---|
| `curriculum` | ForeignKey | Cascade delete |
| `name` | CharField | Subject name |
| `credit` | IntegerField | Credit value |

### `Resource`
Stores downloadable academic materials with filtering metadata.
| Field | Type | Notes |
|-------|------|-------|
|`title`| CharField | Display name |
|`type` | CharField | `notes` / `pyq` / `textbook` |
|`url`  | URLField | Direct link to file |
|`scheme`| CharField | Scheme filter |
|`dept`| CharField | Department filter |
|`semester`| CharField | Semester filter |
|`subject_name`| CharField | Subject filter |
|`size` | CharField | Optional file size label |

---

## 🌐 API Endpoints

The Django backend is served at `http://localhost:8000/api/`.

### Curriculum Endpoints
| Method | URL | Description |
|---|---|---|
| `GET` | `/api/curriculum/` | List all curriculums |
| `GET` | `/api/curriculum/schemes/` | List all distinct schemes |
| `GET` | `/api/curriculum/{scheme}/{dept}/{semester}/` | Get subjects for a specific curriculum |

### Resource Endpoints
| Method | URL | Description |
|---|---|---|
| `GET` | `/api/resources/` | List all resources (supports query filters) |
| `GET` | `/api/resources/?scheme=2019&dept=CSE&semester=S3&subject_name=DSA` | Filtered resources |

### Chat Proxy Endpoints
| Method | URL | Description |
|---|---|---|
| `POST` | `/api/chat/` | Send a message — Django proxies to FastAPI chatbot |
| `POST` | `/api/chat/clear/` | Clear chat session history |

**Chat request payload:**
```json
{ "message": "What is the syllabus for System Software?" }
```

**Chat response:**
```json
{ "response": "The System Software syllabus covers..." }
```

---

## 🤖 AI Chatbot Microservice Details

The FastAPI server runs at `http://localhost:8001`. Swagger docs available at `http://localhost:8001/docs`.

### FastAPI Endpoints
| Method | URL | Description |
|---|---|---|
| `POST` | `/chat` | Accept a message, return an AI response |
| `POST` | `/chat/clear` | Clear the in-memory chat history |
| `GET` | `/health` | Health check — returns `{"status": "ok"}` |

### RAG Pipeline (inside `chat.py` + `datastore.py`)

1. **PDF Ingestion** (`datastore.py`): On startup, all PDFs in the `data/` folder are loaded using `PyPDFLoader`, split into chunks **(size: 800, overlap: 300)**, embedded with `SentenceTransformers`, and stored in a **persistent ChromaDB** vector store using **cosine similarity**.

2. **Query Retrieval** (`chat.py → _retrieve_context`): The user's query is embedded with the same SentenceTransformer model and the **top-5 most similar chunks** are retrieved from ChromaDB.

3. **LLM Inference**: Retrieved context is injected into a structured prompt sent to **Groq's `llama-3.3-70b-versatile`** model (temperature `0.2`, max tokens `1024`).

### Chat Memory Management

KTU-Core uses a **sliding-window + rolling summary** memory system:

| Component | Details |
|---|---|
| **Recent window** | Keeps the last **5 user + AI message pairs** verbatim (70% weightage) |
| **Older summary** | When the window is full, the oldest pair is evicted and **summarized** into a rolling summary using a second LLM call (30% weightage) |
| **Summarization LLM** | `llama-3.3-70b-versatile`, temperature `0.1`, max tokens `512` |
| **Session reset** | Chat history is cleared in-memory when `/chat/clear` is called |

### Dependencies (Chatbot)

| Package | Role |
|---|---|
| `fastapi` + `uvicorn` | API server |
| `langchain`, `langchain-core`, `langchain-community` | Orchestration |
| `langchain-groq` | Groq LLM integration |
| `langchain-text-splitters` | PDF chunking |
| `groq` | Groq SDK |
| `chromadb==0.6.3` | Persistent vector store |
| `sentence-transformers==2.5.1` | Embedding model |
| `pypdf` | PDF loading |
| `python-dotenv` | API key loading from `api.env` |

### Dependencies (Django Backend)

| Package | Role |
|---|---|
| `django` | Web framework |
| `djangorestframework` | REST API toolkit |
| `django-cors-headers` | CORS support for frontend |
| `requests` | Proxying calls to FastAPI chatbot |
| `python-dotenv` | Environment variable management |

---

## 🛠️ Quick Start & Setup

For the complete step-by-step guide, refer to **[Guide.md](Guide.md)**.

### Prerequisites
- Python **3.9+**
- pip
- Node.js (for `npx serve`, optional)
- A **Groq API Key** — free at [console.groq.com](https://console.groq.com)

### 1. Chatbot Microservice (Port 8001)
```bash
cd Chatbot
python -m venv .venv
.venv\Scripts\activate          # Windows
pip install -r requirements.txt

# Create api.env with your key:
# GROQ_API_KEY=your_actual_api_key_here

uvicorn api:app --host 0.0.0.0 --port 8001 --reload
```

### 2. Django Backend (Port 8000)
```bash
cd BACKEND_DJANGO
python -m venv .venv
.venv\Scripts\activate          # Windows
pip install -r requirements.txt
python manage.py makemigrations
python manage.py migrate
python manage.py runserver
```

### 3. Frontend (Port 3000)
```bash
cd FRONTEND
npx serve . -p 3000
# Open http://localhost:3000/index2.html
```

> **Note:** Ensure `API_BASE_URL` in `FRONTEND/script2.js` points to `http://localhost:8000/api`.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!  
Feel free to check the [issues page](../../issues) or submit a pull request.

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m "feat: add your feature"`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a Pull Request.

---

## 📄 License

This project is open source. See the repository for license details.
