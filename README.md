# KTU-Core

Welcome to **KTU-Core**, a comprehensive platform designed for students under KTU (APJ Abdul Kalam Technological University). 

One of the most profound issues students face is finding reliable resources for coursework and skill development. KTU-Core solves this by providing a unified website where students can:
- **Freely access academic resources** and curriculum materials.
- **Estimate Activity Points** easily.
- **Calculate CGPA/SGPA** seamlessly.
- **Ask questions to an AI Assistant**, powered by a RAG (Retrieval-Augmented Generation) chatbot.

## 🚀 Features
- **Resource Repository**: Centralised access to syllabus, notes, and previous year questions.
- **Smart Calculators**: Built-in logic for tracking KTU-specific academic requirements like CGPA and Activity Points.
- **AI Chatbot**: A custom-built AI assistant using LangChain and Groq that provides context-aware answers to student queries based on KTU materials.

## 🏗️ Architecture

The project is structured into three main components, adopting a microservices-inspired architecture:

### 1. Frontend (Vanilla Web)
- Built using **HTML, CSS, and JavaScript**.
- Fast, lightweight, and directly communicates with the Django Backend API.
- Can be served via any lightweight HTTP server (like `npx serve` or Python's `http.server`).

### 2. Backend Gateway (Django)
- A **Django REST Framework (DRF)** application.
- Handles core database models for curriculums, subjects, and academic resources.
- Acts as a gateway proxy for chatbot queries, managing request routing and payload formatting before forwarding them to the AI microservice.
- Backed by an SQLite database for ease of local development.

### 3. AI Chatbot Microservice (FastAPI)
- A highly performant **FastAPI** application.
- **RAG Engine**: Utilizes Langchain and ChromaDB for vector storage and retrieval of PDF data.
- **LLM Integration**: Uses Groq's Llama 3 models for fast inference.
- **Embeddings**: SentenceTransformers to accurately match student queries against the syllabus and resources.
- Maintains chat memory and conversational context per session.

## 🛠️ Quick Start & Setup

We have prepared a detailed step-by-step setup guide. 

👉 **[Please refer to Guide.md for full instructions](Guide.md)** on how to install and run the Frontend, Django Backend, and FastAPI Chatbot simultaneously.

### Overview of running everything:
1. **Chatbot Server**: Run via `uvicorn api:app --port 8001` (Needs a Groq API key).
2. **Django Backend**: Run via `python manage.py runserver` on `port 8000`.
3. **Frontend**: Serve the `FRONTEND` folder via `npx serve . -p 3000`.

## 🤝 Contributing
Contributions, issues, and feature requests are welcome! Feel free to check the issues page or submit a pull request.
