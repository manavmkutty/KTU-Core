from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import uvicorn
from chat import generate_response
from datastore import load_data_to_chromadb

app = FastAPI(title="KTU-Core Chatbot Microservice")

@app.on_event("startup")
def on_startup():
    print("Starting up: checking and loading ChromaDB data...")
    load_data_to_chromadb()


# In-memory session store
# sessions[session_id] = {"recent_messages": [], "older_summary": ""}
sessions = {}

class ChatRequest(BaseModel):
    session_id: str
    user_message: str

class ChatResponse(BaseModel):
    response: str

@app.post("/chat", response_model=ChatResponse)
def handle_chat(request: ChatRequest):
    session_id = request.session_id
    user_query = request.user_message

    if not user_query.strip():
        raise HTTPException(status_code=400, detail="Empty user message")

    if session_id not in sessions:
        sessions[session_id] = {
            "recent_messages": [],
            "older_summary": ""
        }
    
    session_state = sessions[session_id]
    
    try:
        response_text = generate_response(user_query, session_state)
        return ChatResponse(response=response_text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/chat/session/{session_id}")
def clear_session(session_id: str):
    if session_id in sessions:
        del sessions[session_id]
        return {"status": "success", "message": f"Session {session_id} cleared"}
    return {"status": "not_found", "message": "Session not found"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)
