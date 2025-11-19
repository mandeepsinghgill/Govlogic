"""
AI Assistant API - OpenAI Integration
Provides AI chat capabilities for proposal writing assistance
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from app.core.database import get_db
from app.core.auth import get_current_user
from app.models.organization import User
from app.services.llm_service import llm_service
import os

router = APIRouter()


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
    Chat with AI assistant using OpenAI
    Optimized for proposal writing and government contracting
    Returns formatted responses with markdown support
    """
    print(f"🤖 AI Assistant: Received chat request")
    print(f"📝 Number of messages: {len(request.messages)}")
    
    try:
        # Check for OpenAI API key
        openai_key = os.getenv("OPENAI_API_KEY")
        if not openai_key:
            raise HTTPException(
                status_code=400,
                detail="OPENAI_API_KEY not configured. Please set your OpenAI API key in environment variables."
            )
        
        # Extract system prompt and conversation messages
        system_prompt = None
        conversation_messages = []
        
        for msg in request.messages:
            if msg.role == 'system':
                system_prompt = msg.content
            else:
                # Ensure role is valid (user or assistant)
                role = msg.role if msg.role in ['user', 'assistant'] else 'user'
                conversation_messages.append({
                    "role": role,
                    "content": msg.content
                })
        
        print(f"🌐 Calling OpenAI API")
        print(f"📤 Messages: {len(conversation_messages)}, temperature={request.temperature or 0.7}")
        
        # Use OpenAI Chat Completions API directly for proper conversation handling
        from openai import OpenAI
        openai_key = os.getenv("OPENAI_API_KEY")
        if not openai_key:
            raise HTTPException(
                status_code=400,
                detail="OPENAI_API_KEY not configured"
            )
        
        client = OpenAI(api_key=openai_key)
        
        # Prepare messages for OpenAI (include system prompt if provided)
        openai_messages = []
        if system_prompt:
            openai_messages.append({"role": "system", "content": system_prompt})
        openai_messages.extend(conversation_messages)
        
        # Use the model from request or default to gpt-4o
        model = request.model if request.model in ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo'] else 'gpt-4o'
        
        # Call OpenAI Chat Completions API
        completion = client.chat.completions.create(
            model=model,
            messages=openai_messages,
            temperature=request.temperature or 0.7,
            max_tokens=request.max_tokens or 2000,
        )
        
        response = completion.choices[0].message.content
        
        if not response:
            response = "I apologize, but I received an empty response. Please try again."
        
        print(f"✅ OpenAI response received: {len(response)} characters")
        print(f"📝 First 200 chars: {response[:200]}...")
        
        return ChatResponse(
            response=response,
            model=model,
            done=True
        )
                
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ AI Assistant Error: {str(e)}")
        import traceback
        traceback.print_exc()
        
        # Return a helpful error message
        error_msg = f"I apologize, but I encountered an error: {str(e)}. "
        if "OPENAI_API_KEY" in str(e):
            error_msg += "Please ensure your OpenAI API key is configured."
        else:
            error_msg += "Please try again or contact support."
        
        # Use requested model or default
        model = request.model if request.model in ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo'] else 'gpt-4o'
        
        return ChatResponse(
            response=error_msg,
            model=model,
            done=True
        )


def generate_fallback_response(messages: List[ChatMessage]) -> str:
    """
    Generate a helpful fallback response when OpenAI is not available
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

*Note: For full AI-powered assistance, please ensure OpenAI API key is configured.*"""
    
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

*Note: For full AI-powered assistance, please ensure OpenAI API key is configured.*"""
    
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

*Note: For full AI-powered assistance, please ensure OpenAI API key is configured.*"""
    
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

*Note: For full AI-powered assistance, please ensure OpenAI API key is configured.*"""
    
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

**Note**: For full AI-powered responses with OpenAI, please ensure:
- OpenAI API key is set in backend environment variables (OPENAI_API_KEY)
- Backend server has been restarted after setting the key
- You have sufficient OpenAI API credits

How can I help with your proposal today?"""
    
    return "I'm here to help! Please ask me about proposal writing, RFP analysis, or win strategy."


@router.get("/models")
async def list_available_models(
    current_user: User = Depends(get_current_user)
):
    """
    List available OpenAI models
    """
    return {
        "models": [
            {"name": "gpt-4o", "description": "GPT-4o (Recommended - Best quality)"},
            {"name": "gpt-4o-mini", "description": "GPT-4o Mini (Faster, cost-effective)"},
            {"name": "gpt-4-turbo", "description": "GPT-4 Turbo (High quality)"},
        ]
    }


@router.get("/status")
async def check_ai_status(
    current_user: User = Depends(get_current_user)
):
    """
    Check if OpenAI is configured and available
    """
    openai_key = os.getenv("OPENAI_API_KEY")
    
    if openai_key:
        return {
            "status": "online",
            "message": "OpenAI is configured and available",
            "provider": "openai",
            "model": "gpt-4o"
        }
    else:
        return {
            "status": "offline",
            "message": "OpenAI API key is not configured. Please set OPENAI_API_KEY environment variable.",
            "provider": "openai",
            "setup_instructions": [
                "1. Get your OpenAI API key from https://platform.openai.com/api-keys",
                "2. Set environment variable: export OPENAI_API_KEY='your-key-here'",
                "3. Restart the backend server"
            ]
        }

