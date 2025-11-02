#!/usr/bin/env python3
"""
Standalone AI Assistant Server
This is a lightweight server that only handles AI chat requests.
No database required!
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import httpx
import uvicorn

app = FastAPI(title="AI Assistant Server")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

OLLAMA_HOST = "http://localhost:11434"

class Message(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    model: str
    messages: List[Message]

class ChatResponse(BaseModel):
    response: str
    model: str
    done: bool

SYSTEM_PROMPT = """
You are GovLogicAI, an expert AI assistant specializing in government contracting and grant writing.
Your purpose is to help users craft winning proposals and grant applications.
You have deep expertise in:
- Federal Acquisition Regulations (FAR) and agency-specific regulations (DFARS, HHSAR, etc.)
- Shipley Associates proposal methodology (e.g., Executive Summary, Win Themes, Value Proposition, Technical Approach, Management Plan, Past Performance)
- Compliance matrix development and RFP shredding
- Understanding and responding to Statements of Work (SOW), Performance Work Statements (PWS), and Broad Agency Announcements (BAA)
- Identifying customer hot buttons and developing compelling solutions
- Crafting clear, concise, and persuasive language
- Grant application requirements (e.g., SF-424 forms, NOFO analysis, budget narratives)
- 508 compliance for accessibility

When responding, always:
1. Be professional, precise, and helpful.
2. Reference relevant best practices or regulations where applicable.
3. Break down complex tasks into actionable steps.
4. Ask clarifying questions if the request is ambiguous.
5. Focus on actionable advice and content generation for proposals/grants.
6. Maintain a positive and encouraging tone.

Examples of how you can help:
- "Draft an executive summary for an IT modernization proposal."
- "What are the key elements of a strong win theme?"
- "Analyze this RFP section for compliance requirements."
- "Suggest improvements for my past performance narrative."
- "Explain the difference between a BAA and an RFP."
- "Help me structure a budget narrative for an NIH grant."

Let's work together to win more contracts and grants!
"""

@app.get("/")
async def root():
    return {"message": "AI Assistant Server is running!", "status": "ok"}

@app.get("/api/v1/ai/status")
async def check_ollama_status():
    """Check if Ollama is running"""
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get(f"{OLLAMA_HOST}/api/tags")
            if response.status_code == 200:
                data = response.json()
                models = [m["name"] for m in data.get("models", [])]
                return {"status": "online", "models": models}
            else:
                return {"status": "offline", "error": "Ollama not responding"}
    except Exception as e:
        return {"status": "offline", "error": str(e)}

@app.post("/api/v1/ai/chat", response_model=ChatResponse)
async def chat_with_ai(request: ChatRequest):
    """
    Chat with AI using Ollama
    """
    print(f"📨 Received chat request with model: {request.model}")
    print(f"📝 Messages count: {len(request.messages)}")
    
    try:
        # Prepend system prompt
        full_messages = [
            {"role": "system", "content": SYSTEM_PROMPT}
        ] + [{"role": m.role, "content": m.content} for m in request.messages]
        
        print(f"🌐 Calling Ollama API at: {OLLAMA_HOST}/api/chat")
        
        async with httpx.AsyncClient(timeout=120.0) as client:
            ollama_response = await client.post(
                f"{OLLAMA_HOST}/api/chat",
                json={
                    "model": request.model,
                    "messages": full_messages,
                    "stream": False
                }
            )
            
            print(f"📡 Ollama response status: {ollama_response.status_code}")
            
            if ollama_response.status_code == 200:
                data = ollama_response.json()
                assistant_message = data.get("message", {}).get("content", "")
                
                if not assistant_message:
                    print(f"⚠️ Empty response from Ollama")
                    assistant_message = "I apologize, but I received an empty response. Please try again."
                else:
                    print(f"✅ Response received: {len(assistant_message)} characters")
                
                return ChatResponse(
                    response=assistant_message,
                    model=request.model,
                    done=data.get("done", True)
                )
            else:
                error_msg = f"Ollama error (status {ollama_response.status_code}): {ollama_response.text}"
                print(f"❌ {error_msg}")
                raise HTTPException(status_code=500, detail=error_msg)
                
    except httpx.ConnectError:
        error_msg = ("Ollama is not running. Please start Ollama with 'ollama serve' "
                    "and make sure you have downloaded a model like 'ollama pull qwen3:8b'")
        print(f"❌ Connection error: {error_msg}")
        raise HTTPException(status_code=503, detail=error_msg)
    except httpx.TimeoutException:
        error_msg = "Request to Ollama timed out. The model might be too slow or overloaded."
        print(f"❌ Timeout: {error_msg}")
        raise HTTPException(status_code=504, detail=error_msg)
    except Exception as e:
        error_msg = f"Unexpected error: {str(e)}"
        print(f"❌ {error_msg}")
        raise HTTPException(status_code=500, detail=error_msg)

if __name__ == "__main__":
    print("=" * 60)
    print("🚀 Starting AI Assistant Server")
    print("=" * 60)
    print("📍 Server will run on: http://localhost:8000")
    print("📖 API Docs: http://localhost:8000/docs")
    print("🤖 Ollama: " + OLLAMA_HOST)
    print("=" * 60)
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")

