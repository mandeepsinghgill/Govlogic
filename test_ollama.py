#!/usr/bin/env python3
"""
Test script to verify Ollama integration
Run this to check if Ollama is working correctly
"""
import requests
import json

OLLAMA_URL = "http://localhost:11434"

def test_ollama_connection():
    """Test if Ollama is running"""
    print("🔍 Testing Ollama connection...")
    try:
        response = requests.get(f"{OLLAMA_URL}/api/tags", timeout=5)
        if response.status_code == 200:
            print("✅ Ollama is running!")
            data = response.json()
            models = data.get('models', [])
            print(f"\n📦 Available models ({len(models)}):")
            for model in models:
                print(f"   - {model['name']} ({model.get('size', 'unknown size')})")
            return True, models
        else:
            print(f"❌ Ollama responded with status {response.status_code}")
            return False, []
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to Ollama!")
        print("   Make sure Ollama is running: ollama serve")
        return False, []
    except Exception as e:
        print(f"❌ Error: {e}")
        return False, []

def test_chat(model_name="llama"):
    """Test chat endpoint"""
    print(f"\n🤖 Testing chat with model: {model_name}")
    
    try:
        payload = {
            "model": model_name,
            "messages": [
                {
                    "role": "system",
                    "content": "You are a helpful AI assistant."
                },
                {
                    "role": "user",
                    "content": "Say hello in one sentence."
                }
            ],
            "stream": False
        }
        
        print(f"📤 Sending request to {OLLAMA_URL}/api/chat")
        response = requests.post(
            f"{OLLAMA_URL}/api/chat",
            json=payload,
            timeout=30
        )
        
        if response.status_code == 200:
            print("✅ Chat request successful!")
            data = response.json()
            assistant_message = data.get('message', {}).get('content', '')
            print(f"\n💬 AI Response:\n{assistant_message}\n")
            return True
        else:
            print(f"❌ Chat failed with status {response.status_code}")
            print(f"   Error: {response.text}")
            return False
            
    except requests.exceptions.Timeout:
        print("⏱️ Request timed out (this is normal for first request)")
        print("   The model might be loading. Try again in a few seconds.")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_backend_api():
    """Test our backend API"""
    print("\n🔌 Testing backend API...")
    
    try:
        response = requests.get("http://localhost:8000/health", timeout=5)
        if response.status_code == 200:
            print("✅ Backend API is running!")
            return True
        else:
            print(f"⚠️ Backend returned status {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to backend!")
        print("   Make sure the backend is running on port 8000")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def main():
    """Run all tests"""
    print("=" * 60)
    print("🧪 Ollama Integration Test")
    print("=" * 60)
    
    # Test 1: Ollama connection
    ollama_running, models = test_ollama_connection()
    
    # Test 2: Backend API
    backend_running = test_backend_api()
    
    # Test 3: Chat with Ollama
    if ollama_running and models:
        # Use the first available model
        model_to_test = models[0]['name'] if models else 'llama'
        test_chat(model_to_test)
    
    # Summary
    print("\n" + "=" * 60)
    print("📊 Test Summary")
    print("=" * 60)
    print(f"Ollama Running:    {'✅' if ollama_running else '❌'}")
    print(f"Backend Running:   {'✅' if backend_running else '❌'}")
    print(f"Models Available:  {len(models) if models else 0}")
    
    if ollama_running and backend_running and models:
        print("\n🎉 Everything looks good! You can use the AI Assistant.")
        print("\n📝 Next steps:")
        print("   1. Open http://localhost:3000/ai-assistant")
        print("   2. Select your model from dropdown")
        print("   3. Start chatting!")
    else:
        print("\n⚠️ Setup needed:")
        if not ollama_running:
            print("   1. Start Ollama: ollama serve")
            print("   2. Pull a model: ollama pull llama")
        if not backend_running:
            print("   3. Start backend: cd backend && python -m app.main")
        print("\n   Then run this test again!")
    
    print("=" * 60)

if __name__ == "__main__":
    main()

