# GovLogic GovConAI - Quick Start Guide

Get the complete AI-powered government contracting platform running in **5 minutes**.

## Prerequisites

- Docker and Docker Compose installed
- 8GB RAM minimum
- 10GB disk space

## Step 1: Extract Project (if from archive)

```bash
tar -xzf govlogic-complete.tar.gz
cd govlogic
```

## Step 2: Configure API Keys

Edit `backend/.env` and add your OpenAI API key:

```bash
# Open the file
nano backend/.env

# Or use your preferred editor
# Add your API key:
OPENAI_API_KEY=sk-your-key-here
```

**Note:** The application will work without API keys, but AI features will be disabled.

## Step 3: Start Everything

```bash
docker-compose up -d
```

This starts:
- PostgreSQL database (port 5432)
- Redis cache (port 6379)
- Backend API (port 8000)
- Celery worker
- Frontend UI (port 3000)

## Step 4: Access the Application

Open your browser to:

- **Frontend:** http://localhost:3000
- **API Documentation:** http://localhost:8000/docs
- **API Health Check:** http://localhost:8000/health

## Step 5: Explore Features

### Dashboard
- View pipeline statistics
- See recent activity
- Monitor proposal progress

### Opportunities
- Create new opportunities
- Drag-and-drop Kanban board
- AI-powered PWin scoring
- Bid/No-Bid decisions

### Proposals
- Upload RFP documents
- AI extracts requirements
- Generate compliance matrices
- Auto-draft sections
- Red team reviews
- Export to DOCX/PDF/Excel

### Capture
- Create Shipley capture plans
- Define win themes
- Identify discriminators
- Plan teaming strategy

### Knowledge Base
- Store past performance
- Manage teaming partners
- Reusable content library

### Programs
- Track milestones
- RAID logs
- Health scores

## Common Commands

### View Logs

```bash
# All services
docker-compose logs -f

# Backend only
docker-compose logs -f backend

# Frontend only
docker-compose logs -f frontend
```

### Stop Services

```bash
docker-compose down
```

### Restart Services

```bash
docker-compose restart
```

### Reset Database

```bash
docker-compose down -v
docker-compose up -d
```

## Testing the Proposal Workflow

### 1. Create an Opportunity

```bash
curl -X POST http://localhost:8000/api/v1/opportunities \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test RFP - Cloud Services",
    "solicitation_number": "TEST-2025-001",
    "opportunity_type": "rfp",
    "agency": "Department of Defense",
    "contract_value": 5000000,
    "organization_id": "test-org-123"
  }'
```

### 2. Calculate PWin

```bash
curl -X POST http://localhost:8000/api/v1/opportunities/{id}/calculate-pwin
```

### 3. Create a Proposal

```bash
curl -X POST http://localhost:8000/api/v1/proposals \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Cloud Services Proposal",
    "solicitation_number": "TEST-2025-001",
    "organization_id": "test-org-123"
  }'
```

### 4. Upload RFP (using the UI)

1. Go to Proposals page
2. Click on your proposal
3. Upload a PDF RFP document
4. Watch AI extract requirements
5. Generate compliance matrix
6. Auto-draft sections
7. Run Red Team review
8. Export final package

## Troubleshooting

### Backend won't start

```bash
# Check if PostgreSQL is running
docker-compose ps postgres

# View backend logs
docker-compose logs backend

# Common fix: restart everything
docker-compose down
docker-compose up -d
```

### Frontend shows "Cannot connect to API"

```bash
# Check if backend is running
curl http://localhost:8000/health

# Should return: {"status":"healthy"}

# If not, check backend logs
docker-compose logs backend
```

### Database connection errors

```bash
# Wait for PostgreSQL to fully start (takes ~10 seconds)
docker-compose logs postgres | grep "ready to accept connections"

# Restart backend after PostgreSQL is ready
docker-compose restart backend
```

### AI features not working

```bash
# Check if API key is set
docker-compose exec backend env | grep OPENAI_API_KEY

# If empty, edit backend/.env and restart
docker-compose restart backend
```

## Manual Setup (Without Docker)

If you prefer to run services manually:

### Backend

```bash
cd backend

# Create virtual environment
python3.12 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start PostgreSQL (separate terminal)
docker run -d --name postgres \
  -e POSTGRES_USER=govlogic \
  -e POSTGRES_PASSWORD=govlogic \
  -e POSTGRES_DB=govlogic \
  -p 5432:5432 \
  ankane/pgvector:latest

# Start Redis (separate terminal)
docker run -d --name redis -p 6379:6379 redis:7-alpine

# Run migrations
alembic upgrade head

# Start backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend

```bash
cd frontend

# Install dependencies
pnpm install

# Start dev server
pnpm run dev

# Access at http://localhost:5173
```

## Next Steps

1. **Read the full documentation:** See `README.md`
2. **Explore the API:** Visit http://localhost:8000/docs
3. **Customize settings:** Edit `backend/.env`
4. **Add your data:** Import past performance, teaming partners
5. **Deploy to production:** See `DEPLOYMENT.md`

## Getting Help

- **Documentation:** `README.md`, `DEPLOYMENT.md`, `PROJECT_SUMMARY.md`
- **API Docs:** http://localhost:8000/docs
- **Issues:** Check logs with `docker-compose logs`

## What You Get

- ✅ Complete BD lifecycle platform
- ✅ AI-powered proposal automation
- ✅ Shipley methodology built-in
- ✅ Multi-tenant architecture
- ✅ Role-based access control
- ✅ Document processing pipeline
- ✅ Professional React UI
- ✅ Production-ready infrastructure

**Transform 2-4 weeks of proposal work into 5 minutes!**

