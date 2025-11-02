# 🚀 AI Assistant - Quick Setup Guide

## ⚡ 5-Minute Setup

Get your AI Assistant running in just 5 minutes!

---

## Step 1: Install Ollama (2 minutes)

### macOS/Linux:
```bash
curl https://ollama.ai/install.sh | sh
```

### Windows:
Download from: https://ollama.ai/download

### Verify Installation:
```bash
ollama --version
```

---

## Step 2: Pull AI Model (3 minutes)

Choose one model to start:

### Llama 2 (Recommended for beginners):
```bash
ollama pull llama2
```

### Or Mistral (Faster, more accurate):
```bash
ollama pull mistral
```

### Check Downloaded Models:
```bash
ollama list
```

---

## Step 3: Start Ollama

### Start the Ollama service:
```bash
ollama serve
```

**Keep this terminal open!** Ollama needs to run in the background.

### Verify it's running:
```bash
curl http://localhost:11434/api/tags
```

You should see a JSON response with your models.

---

## Step 4: Use AI Assistant

1. Open your browser: `http://localhost:3000`
2. Look at the sidebar
3. Click **"✨ AI Assistant"**
4. Start chatting!

---

## 🎯 Quick Test

Try one of these:

1. **Click a Quick Prompt** button
2. **Or type**: "Help me write an executive summary"
3. **Press Enter**
4. **Wait 5-10 seconds** for response

---

## 🎨 Visual Guide

### Sidebar (Expanded):
```
┌─────────────────────┐
│ Dashboard           │
│ Opportunities       │
│ Pipeline Manager    │
│ Proposals           │
│ Grants              │
│ Capture             │
│ Knowledge Base      │
│ Programs            │
│ Reports & Analytics │
│                     │
│ ─────────────────── │
│ ✨ AI Assistant     │ ← NEW!
│ ─────────────────── │
│                     │
│ BID WORKSPACE       │
│ Pricing Analysis    │
│ ...                 │
└─────────────────────┘
```

### Sidebar (Collapsed):
```
┌───┐
│ 🏠 │
│ 🎯 │
│ 📊 │
│ 📝 │
│ 💰 │
│ 💼 │
│ 📚 │
│ 📁 │
│ 📈 │
│    │
│ ── │
│ ✨ │ ← Just icon!
│ ── │
│    │
│ 💵 │
│ ...│
└───┘
```

---

## 🔍 Troubleshooting

### Problem: "Ollama is not running"

**Solution**:
```bash
# Terminal 1: Start Ollama
ollama serve

# Terminal 2: Check status
curl http://localhost:11434/api/tags
```

### Problem: "No models found"

**Solution**:
```bash
# Pull a model first
ollama pull llama2

# Verify
ollama list
```

### Problem: "Response is slow"

**Reasons**:
- First run is slower (model loading)
- Large models need more RAM
- Complex questions take longer

**Solutions**:
- Wait 10-15 seconds for first response
- Try a smaller/faster model (mistral)
- Ensure you have 8GB+ RAM

### Problem: "Can't see AI Assistant in sidebar"

**Solution**:
```bash
# Frontend might need restart
cd frontend
npm run dev

# Check browser console for errors
# Open DevTools (F12) → Console tab
```

---

## 📊 Model Comparison

| Model | Size | Speed | Quality | Best For |
|-------|------|-------|---------|----------|
| **Llama 2** | 3.8GB | Medium | Good | General proposals |
| **Mistral** | 4.1GB | Fast | Excellent | Analysis, research |
| **Code Llama** | 3.8GB | Medium | Good | Technical proposals |
| **Neural Chat** | 4.1GB | Fast | Good | Conversational |

**Recommendation**: Start with **Llama 2**, upgrade to **Mistral** later.

---

## 💡 Example Conversations

### Example 1: Executive Summary
```
You: Write an executive summary for a DOD cybersecurity proposal

AI: Here's a Shipley-standard executive summary structure:

1. Opening Hook:
"The Department of Defense faces increasingly sophisticated 
cyber threats requiring advanced, adaptive security solutions..."

2. Your Solution:
"Our team brings proven expertise in federal cybersecurity, 
combining..."

[... detailed response ...]
```

### Example 2: Win Themes
```
You: Generate win themes for a cloud migration project

AI: Here are 5 strong win themes:

1. "Proven cloud expertise: 15+ federal migrations, 98% on-time 
   delivery"
2. "Security-first approach: FedRAMP High authorized, zero 
   breaches"
3. "Cost savings: Average 35% reduction vs. current infrastructure"
...
```

### Example 3: RFP Analysis
```
You: Analyze this requirement: "The contractor shall provide 
24/7 support with 2-hour response time for critical incidents"

AI: Analysis:

Compliance Requirements:
✅ 24/7 availability (staffing/coverage plan needed)
✅ 2-hour response SLA (define "critical incident")
✅ Support infrastructure (help desk, ticketing)

Evaluation Considerations:
- Demonstrate past performance meeting similar SLAs
- Describe escalation procedures
- Show staffing model with redundancy
...
```

---

## 🎯 Quick Prompts Reference

### 1. Executive Summary (📝)
```
Help me write a compelling executive summary for a government 
proposal. The opportunity is about [YOUR TOPIC]. Please create 
a concise, persuasive executive summary following Shipley 
standards.
```

### 2. Win Themes (💡)
```
Help me develop 3-5 strong win themes for my proposal. The 
client is [AGENCY] and they need [REQUIREMENT]. What are our 
key competitive advantages?
```

### 3. Requirements Analysis (🔍)
```
Analyze this RFP section and extract all compliance 
requirements: [PASTE RFP TEXT]
```

### 4. Content Improvement (📚)
```
Review and improve this proposal section: [PASTE YOUR TEXT]
Make it more compelling and ensure it addresses evaluation 
criteria.
```

---

## ⚙️ Advanced Configuration

### Change Ollama Port:

**Backend** (`/backend/app/api/ai_assistant.py`):
```python
OLLAMA_API_URL = os.getenv('OLLAMA_API_URL', 'http://localhost:11434')
```

Set environment variable:
```bash
export OLLAMA_API_URL=http://localhost:11434
```

### Multiple Models:

Download several models:
```bash
ollama pull llama2
ollama pull mistral
ollama pull codellama
```

Switch in the UI using the dropdown!

---

## 🔐 Security Notes

1. **Local Only**: Ollama runs locally, no data sent to cloud
2. **Private**: Your conversations stay on your machine
3. **Secure**: No API keys needed
4. **Fast**: No network latency

---

## 📈 Performance Tips

### For Best Performance:

1. **RAM**: 8GB minimum, 16GB recommended
2. **Storage**: 10GB free for models
3. **CPU**: Modern multi-core processor
4. **First Run**: Allow 30 seconds for model loading

### Speed Improvements:

```bash
# Use smaller models for faster responses
ollama pull mistral  # Faster than llama2

# Or use quantized versions (if available)
ollama pull llama2:7b-q4  # Smaller, faster
```

---

## 🆘 Getting Help

### Check Status:
```bash
# Is Ollama running?
curl http://localhost:11434/api/tags

# Backend AI endpoint
curl http://localhost:8000/api/v1/ai/status \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### View Logs:

**Ollama logs**:
```bash
# Terminal where you ran: ollama serve
# Check for errors
```

**Backend logs**:
```bash
# Terminal where backend is running
# Look for "AI Assistant Error:" messages
```

**Frontend logs**:
```bash
# Browser DevTools (F12)
# Console tab → Look for errors
```

---

## ✅ Success Checklist

- [ ] Ollama installed
- [ ] At least one model downloaded
- [ ] Ollama serve running in terminal
- [ ] Backend running (port 8000)
- [ ] Frontend running (port 3000)
- [ ] Can see AI Assistant in sidebar
- [ ] Can open AI Assistant page
- [ ] Quick prompts visible
- [ ] Can send message
- [ ] Receive response

**All checked?** You're ready! 🎉

---

## 🎓 Learning Resources

### Ollama Documentation:
- https://ollama.ai/
- https://github.com/ollama/ollama

### Shipley Proposal Standards:
- https://shipley.com/
- Proposal Management books

### Government Contracting:
- FAR (Federal Acquisition Regulation)
- SAM.gov for opportunities

---

## 🚀 Next Steps

Once working:

1. **Try all quick prompts**
2. **Paste real RFP sections**
3. **Ask for win themes**
4. **Get proposal feedback**
5. **Explore different models**
6. **Use for real proposals!**

---

## 📞 Support

**Issues?**
- Check troubleshooting section above
- Verify Ollama is running
- Check browser console
- Restart both backend and frontend

**Working?**
Start winning more government contracts! 💪

---

## 🎉 You're All Set!

Navigate to: `http://localhost:3000/ai-assistant`

Your intelligent proposal writing companion is ready to help! ✨

