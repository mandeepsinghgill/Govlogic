# 🔑 How to Get a Real SAM.gov API Key

## 🎯 The Problem

You're getting a **401 Unauthorized** error because the current API key is a demo/placeholder key, not a real SAM.gov API key.

## 📝 Step-by-Step Guide to Get Real API Key

### **Step 1: Go to SAM.gov Developer Portal**
```
https://api.sam.gov/prod/opp/v1/api-key/
```

### **Step 2: Sign In or Create Account**
1. **Sign in** with your existing SAM.gov account
2. **Or create a new account** (free for government contractors)
3. **Verify your email** if creating new account

### **Step 3: Request API Key**
1. **Click "Request API Key"** or similar button
2. **Select "Opportunity Search API"** or "Opportunity API"
3. **Choose your use case:** Government contractor research
4. **Submit the request**

### **Step 4: Get Your API Key**
- **Copy the API key** (long string of characters)
- **Save it securely** - you'll only see it once!
- **Real keys look like:** `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`

## ⚙️ Step 5: Configure in GovLogic

### **Option A: Update .env file (Recommended)**
```bash
# Edit the backend .env file
cd backend
nano .env
```

**Find this line:**
```bash
SAM_GOV_API_KEY=demo_api_key_12345
```

**Replace with your real key:**
```bash
SAM_GOV_API_KEY=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
```

**Save and exit:** Ctrl+X, Y, Enter

### **Option B: Set Environment Variable**
```bash
# Terminal command
export SAM_GOV_API_KEY=your_real_api_key_here

# Then restart backend
docker-compose restart backend
```

## 🚀 Step 6: Test the Integration

### **Start Backend:**
```bash
cd backend
uvicorn app.main:app --reload --port 8000
```

### **Check Logs:**
You should see:
```
✅ SAM.gov API key configured: a1b2c3d4...
🔄 Fetching from SAM.gov: {'api_key': 'a1b2c3d4...', 'q': 'cyber', ...}
✅ SAM.gov returned 15 opportunities
```

### **Test in Browser:**
1. Go to: `http://localhost:3000/opportunities`
2. Type "cyber" (4+ characters)
3. Click "Search SAM.gov"
4. **See real SAM.gov results!** 🎉

## 🔍 Verify Your API Key

### **Test API Key Validity:**
```bash
# Get your token first
TOKEN="your_auth_token"

# Test the API
curl -X POST "http://localhost:8000/api/v1/opportunities/sam-search" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "keyword": "cybersecurity",
    "page": 1,
    "limit": 5
  }'
```

**If working, you'll see:**
```json
{
  "items": [...],
  "total": 150,
  "search_info": {
    "source": "SAM.gov"
  }
}
```

## 🆘 Troubleshooting

### **Still Getting 401 Error:**
1. **Double-check API key** - Make sure you copied it correctly
2. **Check API key status** - Visit SAM.gov and verify it's active
3. **Try regenerating** - Get a new API key if the old one expired

### **Getting Rate Limited (429 Error):**
- SAM.gov allows ~1,000 requests per hour
- Wait a few minutes or get a new API key

### **Other Issues:**
- **Check backend logs:** `docker-compose logs -f backend`
- **Verify .env file:** Make sure the key was saved correctly

## ✅ What You'll Get

### **With Real API Key:**
- ✅ **Live federal opportunities**
- ✅ **Current contract values** ($100K - $50M+)
- ✅ **Real agency information** (DoD, GSA, DHS, etc.)
- ✅ **Actual due dates** and deadlines
- ✅ **Real solicitation numbers**
- ✅ **Professional search results**

### **Without API Key (Current State):**
- ❌ **401 Unauthorized errors**
- ❌ **Mock/demo data only**
- ❌ **No real opportunities**

## 🎯 Next Steps

1. **Get your SAM.gov API key** (10 minutes)
2. **Add to backend/.env** (2 minutes)
3. **Restart backend** (1 minute)
4. **Test search** (immediate results!)

**Once configured, your search will pull real SAM.gov data!** 🇺🇸

---

**📞 Need Help?**
- SAM.gov Support: Check their developer documentation
- API Issues: Visit `https://api.sam.gov/prod/opp/v1/api-key/`
- Rate Limits: SAM.gov allows 1,000 requests/hour per API key
