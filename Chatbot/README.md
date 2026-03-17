# KTU Academics RAG Chatbot

An AI-based chatbot built using **Retrieval-Augmented Generation (RAG)** that enables KTU (Kerala Technological University) students to ask questions about their academic subjects. The chatbot embeds user queries, retrieves the most relevant document chunks from a ChromaDB vector store, and generates a contextual answer via **Groq's LLaMA 3.3 70B** model — all orchestrated through **LangChain LCEL chains**.

---

## Features

| Feature | Details |
|---|---|
| **Document Ingestion** | Loads all PDFs from `data/`, chunks them (800 chars, 150 overlap) |
| **Embeddings** | `all-MiniLM-L6-v2` via `sentence-transformers` |
| **Vector Store** | ChromaDB (cosine similarity, persisted to `data/chromadb_data/`) |
| **Retrieval** | Top-5 most similar chunks retrieved per query |
| **LLM** | Groq — `llama-3.3-70b-versatile`, temp 0.2 |
| **Memory** | Last 5 conversations passed verbatim (70% weight); older messages rolled into a running **LLM-generated summary** (30% weight) |
| **Chain** | LangChain LCEL — `ChatPromptTemplate \| ChatGroq \| StrOutputParser` |

---

## Project Structure

```
Chatbot/
├── data/                   # Place your PDF files here
│   └── chromadb_data/      # Auto-generated ChromaDB vector store
├── datastore.py            # PDF loading, chunking, embedding & ChromaDB indexing
├── chat.py                 # RAG query loop with LangChain chains & memory management
├── main.py                 # Entry point — runs datastore build then starts chat
├── api.env                 # Stores GROQ_API_KEY (not committed to git)
├── requirements.txt        # Python dependencies
└── README.md
```

---

## Setup Instructions

### Prerequisites
- Python **3.11.x** (ChromaDB is not compatible with Python 3.12+)
- A [Groq API key](https://console.groq.com/)

### Installation

1. **Create and activate a virtual environment:**
   ```bash
   python -m venv .venv
   # Windows:
   .venv\Scripts\activate
   # macOS / Linux:
   source .venv/bin/activate
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Set your Groq API key** — create `api.env` in the project root:
   ```
   GROQ_API_KEY="your_groq_api_key_here"
   ```

4. **Add PDF files** to the `data/` folder (Notes, PYQs, etc.).

5. **Run the chatbot:**
   ```bash
   python main.py
   ```

---

## How It Works

```
User Query
    │
    ▼
[SentenceTransformer] ──embed──► [ChromaDB] ──top-5 docs──►┐
                                                             │
[Chat History]                                              ▼
  ├─ Last 5 pairs ──────────────────────────────────► [LangChain LCEL Chain]
  └─ Older pairs ──[Summary LLM]──► summary ─────────► (ChatPromptTemplate
                                                          | ChatGroq
                                                          | StrOutputParser)
                                                             │
                                                             ▼
                                                       Final Answer
```

### Memory Architecture
- **Recent window:** The last 5 user/assistant conversation pairs are passed directly to the prompt as `MessagesPlaceholder` (70% weightage instruction).
- **Summarization:** When a 6th conversation occurs, the oldest pair is evicted from the window and fed to a **separate summarization LLM chain**. Its output is merged into a rolling `older_summary` string that is also passed in the prompt (30% weightage instruction).
- **Session scope:** All history is in-memory and is cleared when the program exits.

---

## Technologies Used

| Library | Purpose |
|---|---|
| `langchain`, `langchain-core`, `langchain-groq` | LCEL chain construction & Groq LLM integration |
| `langchain-community`, `langchain-text-splitters` | PDF loading & text splitting |
| `sentence-transformers` | `all-MiniLM-L6-v2` embedding model |
| `chromadb` | Persistent vector store |
| `pypdf` | PDF parsing backend |
| `groq` | Groq SDK |
| `python-dotenv` | `.env` / `api.env` loading |