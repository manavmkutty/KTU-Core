from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import uvicorn

# Import data loading
from datastore import load_data_to_chromadb
# Import chat engine functions
from chat import get_chat_response, clear_chat_history

app = FastAPI(title="KTU-Core Chatbot Microservice")

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    response: str

@app.on_event("startup")
async def startup_event():
    # Load data into ChromaDB on startup
    load_data_to_chromadb()

@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(req: ChatRequest):
    if not req.message or not req.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty.")
    
    try:
        response_text = get_chat_response(req.message.strip())
        return ChatResponse(response=response_text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/chat/clear")
async def clear_chat_endpoint():
    try:
        clear_chat_history()
        return {"status": "success", "message": "Chat history cleared."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    return {"status": "ok"}

if __name__ == "__main__":
    uvicorn.run("api:app", host="0.0.0.0", port=8001, reload=True)
