# KTU-Core Guide

Welcome to the KTU-Core project. This guide provides detailed instructions on how to set up and run both the Django Backend and the FastAPI Chatbot microservice.

---

## 1. Prerequisites
- Python 3.9+
- Pip (Python Package Installer)
- Git

## 2. Project Structure
- `BACKEND_DJANGO/`: Contains the Django REST Framework application handling curriculums, subjects, and resources.
- `Chatbot/`: Contains the LangChain/Groq based RAG Chatbot, served via FastAPI.

---

## 3. Setting Up the Chatbot Microservice

1. **Navigate to the Chatbot directory**:
   ```bash
   cd Chatbot
   ```

2. **Create and activate a virtual environment**:
   - Windows: `python -m venv .venv` and `.\.venv\Scripts\activate`
   - Mac/Linux: `python3 -m venv .venv` and `source .venv/bin/activate`

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Environment Variables**:
   You need a Groq API key to run the chatbot inference.
   Create an `api.env` file in the `Chatbot` directory with the following content:
   ```env
   GROQ_API_KEY=your_actual_api_key_here
   ```

5. **Run the Chatbot**:
   Start the FastAPI server using Uvicorn:
   ```bash
   uvicorn api:app --host 0.0.0.0 --port 8001 --reload
   ```
   The chatbot will be available at `http://localhost:8001`.
   *(You can verify it by visiting `http://localhost:8001/docs` in your browser).*

---

## 4. Setting Up the Django Backend

1. **Open a new terminal** and navigate to the Backend directory:
   ```bash
   cd BACKEND_DJANGO
   ```

2. **Create and activate a virtual environment**:
   - Windows: `python -m venv .venv` and `.\.venv\Scripts\activate`
   - Mac/Linux: `python3 -m venv .venv` and `source .venv/bin/activate`

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Database Migrations** (if not already applied):
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

5. **Run the Django Server**:
   ```bash
   python manage.py runserver
   ```
   The backend API root will be accessible at `http://localhost:8000/api/`.

---

## 5. Integrating and Testing

Once both servers are running:
- The frontend (or your REST client) can send a POST request to the Django backend at `http://localhost:8000/api/chat/`.
- payload format: `{"message": "What is the syllabus for CS?"}`
- The Django server will automatically forward this query to your FastAPI Chatbot microservice (`http://localhost:8001/chat`), and return the response to you seamlessly.

---

## 6. Running the Frontend

The `FRONTEND` directory contains plain HTML, CSS, and JavaScript. 

1. **Verify the API Connection**:
   In `FRONTEND/script2.js`, the `API_BASE_URL` is mapped to `http://localhost:8000/api`. Ensure your Django server is running on that port.

2. **Serve the Frontend**:
   Because it uses vanilla web technologies, you can run it using any simple HTTP server to avoid CORS issues. 
   
   Open a new terminal inside the `FRONTEND` folder and run:
   ```bash
   python -m http.server 3000
   ```
   Now, navigate to `http://localhost:3000/index2.html` in your web browser. 
   *(Alternatively, use the VSCode "Live Server" extension to open the file).*
