# GovLogic GovConAI - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Prerequisites
- Python 3.9+
- Node.js 16+
- PostgreSQL running (or use Docker)
- Git

---

## Step 1: Clone & Setup Environment

```bash
cd /Users/mandeepgill/Downloads/GovSure

# Backend setup
cd backend
cp .env.example .env

# Edit .env and add your API keys
# Required: SAM_GOV_API_KEY (get from https://api.sam.gov)
# Optional: OPENAI_API_KEY or ANTHROPIC_API_KEY for real AI generation
```

---

## Step 2: Install Dependencies

```bash
# Backend
cd backend
pip install -r requirements.txt

# Frontend (in new terminal)
cd frontend
npm install
```

---

## Step 3: Start the Application

```bash
# Terminal 1: Backend
cd backend
uvicorn app.main:app --reload --port 8000

# Terminal 2: Frontend
cd frontend
npm run dev
```

---

## Step 4: Login & Test

1. Open browser: `http://localhost:3000`
2. Login with test credentials:
   - Email: `testuser@GovSure.com`
   - Password: `TestPass123!`

3. Verify features:
   - ✅ Dashboard loads with stats
   - ✅ Top Opportunities displayed (may be mock data if no SAM_GOV_API_KEY)
   - ✅ Active Proposals section visible
   - ✅ Navigate to `/opportunities`
   - ✅ Navigate to `/proposals`
   - ✅ Click "New Proposal" and test AI generation

---

## 📋 What's Implemented

### Backend APIs (Python/FastAPI)
- ✅ `GET /api/v1/opportunities/top` - Top SAM.gov opportunities
- ✅ `GET /api/v1/opportunities/search` - Search with filters & pagination
- ✅ `GET /api/v1/opportunities/stats` - Dashboard statistics
- ✅ `GET /api/v1/proposals/mine` - User-scoped proposals
- ✅ `POST /api/v1/proposals` - Create proposal
- ✅ `POST /api/v1/proposals/generate` - AI content generation
- ✅ `GET /api/v1/dashboard/stats` - Comprehensive dashboard data

### Frontend Pages (React/TypeScript)
- ✅ Dashboard with live stats & components
- ✅ Opportunities page with pagination
- ✅ Proposals list (user-scoped)
- ✅ New Proposal page with AI generation

### Features
- ✅ SAM.gov integration (with mock fallback)
- ✅ User-scoped proposals (creator-only access)
- ✅ AI-powered proposal generation (with mock fallback)
- ✅ Pagination & filtering
- ✅ Loading states & error handling
- ✅ Mock data when APIs unavailable

---

## 🔑 Environment Variables

### Required for Real Data:
```bash
SAM_GOV_API_KEY=your-key-here
```
Get your key at: https://api.sam.gov/

### Optional (for AI generation):
```bash
OPENAI_API_KEY=sk-...
# OR
ANTHROPIC_API_KEY=sk-ant-...
```

### System Works Without These:
- Without `SAM_GOV_API_KEY`: Shows mock opportunities
- Without AI keys: Returns mock-generated content
- All features remain functional with fallbacks

---

## 🧪 Testing the Implementation

### Test Checklist:
1. **Dashboard**
   - [ ] Stats load correctly
   - [ ] Top Opportunities widget shows 5 items
   - [ ] Active Proposals widget shows items or "no proposals" message
   - [ ] "View All" buttons navigate correctly

2. **Opportunities Page**
   - [ ] Loads with pagination
   - [ ] Summary stats displayed
   - [ ] Search box functional
   - [ ] SAM.gov links work
   - [ ] PWin scores displayed

3. **Proposals Page**
   - [ ] Lists only user's proposals
   - [ ] Pagination works
   - [ ] Status filter works
   - [ ] "New Proposal" button works

4. **New Proposal**
   - [ ] Form validates
   - [ ] AI generation button works
   - [ ] Generated content displays
   - [ ] Save creates proposal
   - [ ] Redirects to proposal view

5. **Permissions**
   - [ ] Can only see own proposals
   - [ ] Cannot access other users' proposals (403)

---

## 📂 Project Structure

```
GovSure/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── dashboard.py          ← NEW
│   │   │   ├── opportunities.py      ← UPDATED
│   │   │   └── proposals.py          ← UPDATED
│   │   ├── services/
│   │   │   └── samgov_service.py     ← NEW
│   │   ├── models/
│   │   │   └── proposal.py           ← Existing (has schema)
│   │   └── main.py                   ← UPDATED (added dashboard router)
│   └── .env.example                  ← NEW
│
└── frontend/
    └── src/
        ├── components/
        │   ├── TopOpportunities.tsx   ← NEW
        │   └── ActiveProposals.tsx    ← NEW
        ├── pages/
        │   ├── Dashboard.jsx          ← UPDATED
        │   ├── OpportunitiesNew.tsx   ← NEW
        │   ├── ProposalsNew.tsx       ← NEW
        │   └── NewProposal.tsx        ← NEW
```

---

## 🐛 Troubleshooting

### Backend won't start?
```bash
# Check Python version
python --version  # Should be 3.9+

# Reinstall dependencies
pip install -r requirements.txt

# Check database connection
psql -U GovSure -d GovSure
```

### Frontend won't start?
```bash
# Check Node version
node --version  # Should be 16+

# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### "No opportunities showing"?
- This is normal if `SAM_GOV_API_KEY` not set
- System will show mock opportunities
- Add API key to `.env` for real data

### "AI generation not working"?
- This is normal if AI keys not set
- System will return mock-generated content
- Add `OPENAI_API_KEY` to `.env` for real AI

### "Authentication failed"?
- Use test credentials: `testuser@GovSure.com` / `TestPass123!`
- Check backend is running on port 8000
- Verify CORS settings in backend config

---

## 📚 API Documentation

Access interactive API docs at:
- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc

---

## 🎯 Next Steps

### After Initial Setup:
1. Configure SAM_GOV_API_KEY for real opportunities
2. Configure AI keys for real content generation
3. Create your first proposal
4. Explore opportunities from SAM.gov
5. Test AI proposal generation

### For Production:
1. Set up proper database (PostgreSQL)
2. Configure Redis for caching
3. Set up proper secrets management
4. Enable Sentry for error tracking
5. Set up CI/CD pipeline
6. Configure domain and SSL

---

## 💡 Tips

- **Mock Data:** System automatically uses mock data when APIs unavailable
- **User Scope:** Proposals are private (only creator can see)
- **Caching:** SAM.gov results cached for 1 hour
- **Pagination:** All lists support pagination
- **Filters:** Use NAICS codes, keywords, and date ranges

---

## 📞 Need Help?

Check these files:
- `IMPLEMENTATION_SUMMARY.md` - Detailed implementation docs
- `backend/app/main.py` - See all available routes
- `backend/.env.example` - All environment variables explained

API Examples:
```bash
# Test backend health
curl http://localhost:8000/health

# Test opportunities (requires auth token)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8000/api/v1/opportunities/top

# Test dashboard stats
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8000/api/v1/dashboard/stats
```

---

## ✅ Success Criteria

You'll know everything is working when:
- ✅ Dashboard loads without errors
- ✅ Top Opportunities section shows data
- ✅ Active Proposals section shows data or "no proposals" message
- ✅ You can navigate to /opportunities and see items
- ✅ You can create a new proposal
- ✅ AI generation returns content (mock or real)
- ✅ Only your proposals are visible in /proposals

---

*Last Updated: 2025-01-24*
*Version: 1.0.0*

