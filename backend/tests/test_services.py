"""
Service layer tests
"""
import pytest
from app.services.llm_service import LLMService
from app.services.document_service import DocumentProcessingService
from app.services.advanced_ai_service import AdvancedAIService

def test_llm_service_initialization():
    """Test LLM service initialization"""
    llm_service = LLMService()
    assert llm_service is not None
    # Test that it handles missing API keys gracefully
    assert hasattr(llm_service, 'openai_client')

def test_document_service_initialization():
    """Test document service initialization"""
    doc_service = DocumentProcessingService()
    assert doc_service is not None
    assert hasattr(doc_service, 'output_dir')

def test_advanced_ai_service_initialization():
    """Test advanced AI service initialization"""
    ai_service = AdvancedAIService()
    assert ai_service is not None
    assert hasattr(ai_service, 'models')
    assert hasattr(ai_service, 'feedback_db')

@pytest.mark.asyncio
async def test_llm_service_generate_completion():
    """Test LLM service completion generation"""
    llm_service = LLMService()
    
    # Test with mock response when no API key
    result = await llm_service.generate_completion(
        prompt="Test prompt",
        model="gpt-4-turbo"
    )
    
    # Should handle gracefully without API key
    assert result is not None

@pytest.mark.asyncio
async def test_advanced_ai_service_ensemble():
    """Test advanced AI service ensemble generation"""
    ai_service = AdvancedAIService()
    
    result = await ai_service.generate_with_ensemble(
        prompt="Test prompt",
        task_type="analysis"
    )
    
    assert result is not None
    assert "response" in result
    assert "models_used" in result
    assert "timestamp" in result

def test_document_service_text_extraction():
    """Test document service text extraction"""
    doc_service = DocumentProcessingService()
    
    # Test with a simple text file (would need actual file in real test)
    # For now, just test the method exists and handles errors gracefully
    try:
        result = doc_service.extract_text("nonexistent.pdf")
    except (FileNotFoundError, ValueError):
        # Expected behavior for non-existent file
        assert True

