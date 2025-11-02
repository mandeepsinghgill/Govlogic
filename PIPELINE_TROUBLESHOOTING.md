# 🔧 PIPELINE TROUBLESHOOTING GUIDE

## Error: "Failed to add to pipeline"

### ✅ FIXED Issues:
1. ✅ Added backend URL (`http://localhost:8000`)
2. ✅ Added authentication headers
3. ✅ Improved error messages

---

## 🚨 Common Issues & Solutions

### Issue 1: Backend Not Running
**Error:** `Failed to add to pipeline` or network error

**Solution:**
```bash
# Start the backend on port 8000
cd backend
uvicorn app.main:app --reload --port 8000

# Check if it's running:
curl http://localhost:8000/health
```

---

### Issue 2: Not Logged In
**Error:** 401 Unauthorized or "Failed to add to pipeline"

**Solution:**
1. Make sure you're logged in
2. Check if `access_token` exists in localStorage:
   ```javascript
   // Open browser console (F12)
   console.log(localStorage.getItem('access_token'));
   ```
3. If no token, log in again at `/login`

---

### Issue 3: CORS Issues
**Error:** CORS policy error in browser console

**Solution:**
Backend should already have CORS configured in `main.py`:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

If issue persists, add to `backend/app/config.py`:
```python
CORS_ORIGINS = ["http://localhost:3000", "http://localhost:5173"]
```

---

### Issue 4: User Not Found
**Error:** 401 or "User not authenticated"

**Solution:**
The backend API requires a valid user. Make sure:
1. You have an account (sign up if needed)
2. You're logged in with valid credentials
3. The JWT token hasn't expired

To create a test account:
```bash
cd backend
python create_test_account.py
```

---

## 🧪 Testing the Fix

### 1. Check Backend:
```bash
# Terminal 1: Start backend
cd backend
uvicorn app.main:app --reload --port 8000

# Should see:
# ✅ GovLogic GovConAI v1.0.0 started
# 📊 Database: configured
```

### 2. Check Frontend:
```bash
# Terminal 2: Start frontend
cd frontend
npm run dev

# Should see:
# ➜  Local:   http://localhost:3000/
```

### 3. Test Login:
1. Go to `http://localhost:3000/login`
2. Log in with your credentials
3. Check localStorage for `access_token`

### 4. Test Pipeline:
1. Navigate to dashboard
2. See "Top Opportunities" section
3. Click "Add to Pipeline" on any opportunity
4. Should see success message
5. Item appears in "Active Proposals"

---

## 🔍 Debug Mode

### Enable detailed logging:

**Frontend (browser console):**
```javascript
// Add to TopOpportunities.tsx handleAddToPipeline
console.log('Adding to pipeline:', opp);
console.log('Token exists:', !!localStorage.getItem('access_token'));
```

**Backend (terminal):**
```python
# Add to pipeline.py
import logging
logging.basicConfig(level=logging.DEBUG)
```

---

## 📊 Verify API Endpoint

Test the API directly:

```bash
# Get your token from localStorage
TOKEN="your_access_token_here"

# Test add to pipeline
curl -X POST http://localhost:8000/api/v1/pipeline/items \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "opportunity_id": "test123",
    "title": "Test Opportunity",
    "agency": "Test Agency",
    "description": "Test description",
    "contract_value": 1000000,
    "pwin_score": 75
  }'

# Should return the created item with status 200
```

---

## ⚡ Quick Fix Checklist

- [ ] Backend is running on port 8000
- [ ] Frontend is running on port 3000
- [ ] User is logged in
- [ ] `access_token` exists in localStorage
- [ ] No CORS errors in browser console
- [ ] Backend shows no errors in terminal
- [ ] Health endpoint works: `curl http://localhost:8000/health`

---

## 🎯 If Still Not Working

### Option 1: Check Browser Console
1. Open DevTools (F12)
2. Go to Console tab
3. Look for error details
4. Check Network tab for failed requests

### Option 2: Check Backend Logs
1. Look at the terminal running the backend
2. Check for error messages
3. Verify the API is receiving requests

### Option 3: Restart Everything
```bash
# Kill all processes
# Ctrl+C in both terminals

# Start fresh
cd backend
uvicorn app.main:app --reload --port 8000

# New terminal
cd frontend
npm run dev

# Log in again
# Try adding to pipeline
```

---

## 💡 Success Indicators

You know it's working when:
1. ✅ Click "Add to Pipeline" button
2. ✅ Button shows "Adding..." with spinner
3. ✅ Alert shows "Successfully added to pipeline!"
4. ✅ Item appears in "Active Proposals" section below
5. ✅ No errors in browser console
6. ✅ No errors in backend terminal

---

## 📞 Still Having Issues?

Check these files for the latest code:
- `frontend/src/store/pipelineSlice.ts` - Redux logic
- `backend/app/api/pipeline.py` - API endpoints
- `frontend/src/components/TopOpportunities.tsx` - UI component

All API calls now include:
- ✅ Full backend URL
- ✅ Authorization header
- ✅ Better error messages
- ✅ Proper error handling

---

**Last Updated:** October 27, 2025  
**Status:** ✅ All fixes applied

