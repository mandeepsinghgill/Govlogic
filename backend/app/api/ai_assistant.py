"""
AI Assistant API - Ollama Integration
Provides AI chat capabilities for proposal writing assistance
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from app.core.database import get_db
from app.core.auth import get_current_user
from app.models.organization import User
import httpx
import os

router = APIRouter()

# Ollama API configuration
OLLAMA_API_URL = os.getenv('OLLAMA_API_URL', 'http://localhost:11434')


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    model: str = "llama2"
    messages: List[ChatMessage]
    stream: bool = False
    temperature: Optional[float] = 0.7
    max_tokens: Optional[int] = 2000


class ChatResponse(BaseModel):
    response: str
    model: str
    done: bool


@router.post("/chat", response_model=ChatResponse)
async def chat_with_ai(
    request: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Chat with AI assistant using Ollama
    Optimized for proposal writing and government contracting
    """
    print(f"🤖 AI Assistant: Received chat request for model: {request.model}")
    print(f"📝 Number of messages: {len(request.messages)}")
    
    try:
        # Prepare the request for Ollama
        ollama_request = {
            "model": request.model,
            "messages": [{"role": msg.role, "content": msg.content} for msg in request.messages],
            "stream": False,
            "options": {
                "temperature": request.temperature or 0.7,
                "num_predict": request.max_tokens or 2000,
            }
        }

        print(f"🌐 Calling Ollama API at: {OLLAMA_API_URL}/api/chat")
        print(f"📤 Request payload: model={request.model}, messages={len(ollama_request['messages'])}")
        
        # Call Ollama API
        async with httpx.AsyncClient(timeout=120.0) as client:
            try:
                response = await client.post(
                    f"{OLLAMA_API_URL}/api/chat",
                    json=ollama_request
                )
                
                print(f"📡 Ollama response status: {response.status_code}")
                
                if response.status_code == 200:
                    data = response.json()
                    print(f"✅ Ollama response received successfully")
                    
                    # Extract the assistant's message content
                    assistant_message = data.get("message", {}).get("content", "")
                    
                    if not assistant_message:
                        print(f"⚠️ Warning: Empty response from Ollama. Full data: {data}")
                        assistant_message = "I apologize, but I received an empty response. Please try again."
                    else:
                        print(f"✅ Response length: {len(assistant_message)} characters")
                        print(f"📝 First 100 chars: {assistant_message[:100]}...")
                    
                    return ChatResponse(
                        response=assistant_message,
                        model=request.model,
                        done=data.get("done", True)
                    )
                else:
                    error_text = response.text
                    print(f"❌ Ollama API error (status {response.status_code}): {error_text}")
                    
                    # Try to parse error message
                    try:
                        error_data = response.json()
                        error_message = error_data.get("error", error_text)
                    except:
                        error_message = error_text
                    
                    # Return user-friendly error
                    return ChatResponse(
                        response=f"I encountered an error: {error_message}. Please check if the model '{request.model}' is available. Try running: ollama list",
                        model=request.model,
                        done=True
                    )
                    
            except httpx.ConnectError as e:
                print(f"❌ Connection Error: Cannot connect to Ollama at {OLLAMA_API_URL}")
                print(f"   Make sure Ollama is running: ollama serve")
                
                # Fallback response if Ollama is not available
                fallback_response = generate_fallback_response(request.messages)
                return ChatResponse(
                    response=fallback_response,
                    model=request.model,
                    done=True
                )
            
            except httpx.TimeoutException as e:
                print(f"⏱️ Timeout Error: Ollama took too long to respond")
                return ChatResponse(
                    response="The AI is taking longer than expected. This might be a complex request. Please try with a shorter message or try again.",
                    model=request.model,
                    done=True
                )
                
    except Exception as e:
        print(f"❌ AI Assistant Error: {str(e)}")
        import traceback
        traceback.print_exc()
        
        # Return a helpful error message
        return ChatResponse(
            response=f"I apologize, but I encountered an error: {str(e)}. Please ensure Ollama is running with 'ollama serve' and try again.",
            model=request.model,
            done=True
        )


def generate_fallback_response(messages: List[ChatMessage]) -> str:
    """
    Generate a helpful fallback response when Ollama is not available
    """
    last_message = messages[-1].content.lower() if messages else ""
    
    # Provide contextual fallback responses
    if "executive summary" in last_message:
        return """I can help you write an executive summary! Here's a structure to follow:

**Executive Summary Structure (Shipley Standards)**:

1. **Opening Hook** (2-3 sentences): Start with the client's challenge/opportunity
2. **Your Solution** (3-4 sentences): Briefly describe your approach and why it's superior
3. **Key Benefits** (3-5 bullets): Highlight quantifiable benefits and value proposition
4. **Why You** (2-3 sentences): Your unique qualifications and past performance
5. **Call to Action** (1-2 sentences): Request for award with confidence

**Tips**:
- Keep it to 1 page maximum
- Focus on customer benefits, not your features
- Use active voice and strong action verbs
- Include 2-3 key metrics or achievements
- Address evaluation criteria

Would you like me to draft a specific section?

*Note: For full AI-powered assistance, please ensure Ollama is running.*"""
    
    elif "win theme" in last_message or "discriminator" in last_message:
        return """Let me help you develop winning themes and discriminators!

**Win Theme Development Process**:

1. **Customer Hot Buttons**: What keeps them awake at night?
2. **Your Strengths**: What do you do better than competitors?
3. **Proof Points**: Evidence, metrics, past performance

**Strong Win Theme Formula**:
"[Your Capability] + [Customer Benefit] + [Proof Point]"

**Example Win Themes**:
- ✅ "Our proven agile methodology reduces delivery time by 40%, as demonstrated on 5 similar projects"
- ✅ "Local presence with 24/7 support ensures 99.9% uptime, exceeding SLA requirements"
- ✅ "Small business partner brings specialized expertise while maintaining cost competitiveness"

**Discriminators** (What makes you unique):
- Technical approach innovations
- Team qualifications/certifications
- Tools and methodologies
- Past performance on similar work
- Strategic teaming arrangements

Would you like help developing specific themes for your opportunity?

*Note: For full AI-powered assistance, please ensure Ollama is running.*"""
    
    elif "rfp" in last_message or "requirement" in last_message or "compliance" in last_message:
        return """I can help you analyze RFP requirements and ensure compliance!

**RFP Analysis Approach**:

1. **Extract Requirements**:
   - Shalls/Musts (mandatory)
   - Shoulds/Mays (desired)
   - Evaluation criteria

2. **Create Compliance Matrix**:
   - Requirement ID
   - Requirement text
   - Compliance approach
   - Location in proposal

3. **Identify Hot Buttons**:
   - Repeated themes
   - Evaluation criteria emphasis
   - Problem statements

4. **Risk Assessment**:
   - Requirements you can't meet
   - Areas needing clarification
   - Competitive challenges

**Best Practices**:
- Color-code requirements (Red/Yellow/Green)
- Cross-reference with proposal sections
- Document assumptions
- Track clarification questions

Would you like me to analyze a specific RFP section?

*Note: For full AI-powered assistance, please ensure Ollama is running.*"""
    
    elif "improve" in last_message or "edit" in last_message or "review" in last_message:
        return """I can help improve your proposal content! Here's what to check:

**Proposal Editing Checklist**:

**Clarity**:
- ✅ Is the message clear and direct?
- ✅ Are technical terms explained?
- ✅ Is the text easy to scan?

**Compliance**:
- ✅ Does it address the requirement?
- ✅ Are all "shalls" answered?
- ✅ Is proof/evidence provided?

**Persuasiveness**:
- ✅ Does it lead with benefits?
- ✅ Are win themes integrated?
- ✅ Is there proof of capability?

**Action Items**:
1. Remove passive voice
2. Add specific metrics/numbers
3. Lead with customer benefits
4. Include relevant past performance
5. Add visual aids (tables, figures)

**Writing Tips**:
- Use action verbs
- Quantify everything possible
- Show, don't just tell
- Focus on "you" not "we"

Paste your section and I'll provide specific feedback!

*Note: For full AI-powered assistance, please ensure Ollama is running.*"""
    
    else:
        return """I'm your AI Assistant for proposal writing! I can help you with:

**Proposal Development**:
✨ Executive summaries and introductions
📊 Technical approach and methodology
📝 Past performance narratives
🎯 Management plans and resumes

**Strategy & Planning**:
🏆 Win themes and discriminators
💡 Competitive analysis
📋 Go/No-Go decisions
🎨 Proposal storyboarding

**Compliance & Quality**:
✅ RFP requirements analysis
📑 Compliance matrices
🔍 Proposal reviews and red teams
📊 Evaluation criteria mapping

**Research & Analysis**:
🔎 Market research
🏢 Customer intelligence
💼 Teaming partner evaluation
📈 Pricing strategies

**How to Use Me**:
1. Ask specific questions
2. Paste RFP sections for analysis
3. Share proposal text for improvement
4. Request templates and examples

**Note**: For full AI-powered responses with Ollama, please ensure:
- Ollama is installed and running
- Model is downloaded: `ollama pull llama2`
- API is accessible at http://localhost:11434

How can I help with your proposal today?"""
    
    return "I'm here to help! Please ask me about proposal writing, RFP analysis, or win strategy."


@router.get("/models")
async def list_available_models(
    current_user: User = Depends(get_current_user)
):
    """
    List available Ollama models
    """
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(f"{OLLAMA_API_URL}/api/tags")
            if response.status_code == 200:
                data = response.json()
                return {"models": data.get("models", [])}
            else:
                return {"models": []}
    except:
        # Return default models if Ollama is not available
        return {
            "models": [
                {"name": "llama2", "size": "3.8GB"},
                {"name": "mistral", "size": "4.1GB"},
                {"name": "codellama", "size": "3.8GB"},
                {"name": "neural-chat", "size": "4.1GB"},
            ]
        }


@router.get("/status")
async def check_ollama_status(
    current_user: User = Depends(get_current_user)
):
    """
    Check if Ollama is running and available
    """
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get(f"{OLLAMA_API_URL}/api/tags")
            if response.status_code == 200:
                return {
                    "status": "online",
                    "message": "Ollama is running and available",
                    "api_url": OLLAMA_API_URL
                }
    except:
        pass
    
    return {
        "status": "offline",
        "message": "Ollama is not running. Please start Ollama to use AI features.",
        "api_url": OLLAMA_API_URL,
        "setup_instructions": [
            "1. Install Ollama: https://ollama.ai/download",
            "2. Pull a model: ollama pull llama2",
            "3. Start Ollama: ollama serve",
            "4. Verify: curl http://localhost:11434/api/tags"
        ]
    }

