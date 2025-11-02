# 🔑 SAM.gov API Integration Setup Guide

## 🎯 What You Need

To enable **live SAM.gov search** instead of mock data, you need to:

1. **Get a SAM.gov API Key** (Free)
2. **Add it to your environment** 
3. **Restart the backend**

---

## 📝 Step 1: Get Your SAM.gov API Key

### Go to SAM.gov Developer Portal:
```
https://api.sam.gov/prod/opp/v1/api-key/
```

### Steps:
1. **Sign in** with your SAM.gov account (create one if needed)
2. **Request API Key** for "Opportunity Search API"
3. **Copy the API Key** (looks like: `abc123def456...`)
4. **Keep it secure** - never share it publicly

---

## ⚙️ Step 2: Configure Your Environment

### Option A: Update .env file (Recommended)
```bash
# Edit the backend .env file
cd backend
nano .env  # or use your editor
```

**Find and update this line:**
```bash
SAM_GOV_API_KEY=your_sam_gov_api_key_here
```

**Replace with your actual key:**
```bash
SAM_GOV_API_KEY=abc123def4567890...
```

### Option B: Set Environment Variable
```bash
# Terminal command
export SAM_GOV_API_KEY=your_actual_api_key_here

# Then restart backend
cd backend
uvicorn app.main:app --reload --port 8000
```

---

## 🚀 Step 3: Test the Integration

### Start the Backend:
```bash
cd backend
uvicorn app.main:app --reload --port 8000
```

### Check the Logs:
You should see:
```
✅ SAM.gov API key configured: abc123de...
🔄 Fetching from SAM.gov: {'api_key': 'abc123de...', 'limit': 20, ...}
✅ SAM.gov returned 15 opportunities
```

### Test in Browser:
1. Go to: `http://localhost:3000/opportunities`
2. Type "cyber" in search box
3. Click "Search SAM.gov"
4. See **real results** from SAM.gov! 🎉

---

## 🔍 Verify It's Working

### Check API Response:
```bash
# Get your auth token first
curl -X POST "http://localhost:8000/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username": "your_username", "password": "your_password"}'

# Then use the token to test SAM.gov search
curl -X GET "http://localhost:8000/api/v1/opportunities/sam-search?keyword=cybersecurity" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response should show:**
```json
{
  "items": [...],  // Real SAM.gov opportunities
  "total": 150,
  "search_info": {
    "keyword": "cybersecurity",
    "source": "SAM.gov"
  }
}
```

---

## 🆘 Troubleshooting

### Issue: Still showing mock data
**Check:**
```bash
# Backend logs
docker-compose logs -f backend

# Look for:
✅ SAM.gov API key configured: abc123de...
```

**If you see:**
```
⚠️  No SAM.gov API key configured, returning mock data
```

**Fix:** Make sure your API key is in the `.env` file

### Issue: API Key Invalid
**Check:** Visit `https://api.sam.gov/prod/opp/v1/api-key/` and verify your key is active

### Issue: Rate Limiting
**SAM.gov limits:** 1,000 requests per hour
**If hit limit:** Wait or get a new API key

---

## 📊 What Changes When You Add the API Key

### Before (Mock Data):
- ❌ Static/fake opportunities
- ❌ Same results every time
- ❌ No real contract values
- ❌ Generic descriptions

### After (Live SAM.gov):
- ✅ **Real federal opportunities**
- ✅ **Current contract values**
- ✅ **Actual due dates**
- ✅ **Real agency information**
- ✅ **Live PWin scoring**
- ✅ **Actual solicitation numbers**

---

## 🎯 Test Keywords to Try

Once configured, search for:
- `cybersecurity`
- `IT modernization`
- `cloud services`
- `artificial intelligence`
- `data analytics`
- `professional services`

---

## ✅ Next Steps

1. **Add your SAM.gov API key** to `.env`
2. **Restart backend:** `docker-compose restart backend`
3. **Test search:** Type "cyber" → Click "Search SAM.gov"
4. **Verify results** are real SAM.gov opportunities

**Your search will now pull from live SAM.gov data!** 🎉
