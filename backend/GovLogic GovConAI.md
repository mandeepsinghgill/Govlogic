# GovLogic GovConAI

**AI-Powered Government Contracting & Grants Management Platform**

> "One command turns any RFP/NOFO into a 100-page, evaluator-ready, submission package—mapped, cited, red-teamed, 508-compliant, and zipped in under 30 min."

## Overview

GovLogic GovConAI is a comprehensive, end-to-end platform that automates the entire government contracting and grants management lifecycle. Built on the **Shipley methodology** (the gold standard in government proposals), it transforms proposal development from a 2-4 week manual process into a **5-minute automated workflow**.

### Key Features

#### 🎯 **Complete BD Lifecycle Management**
- **Opportunity Intelligence** - Pipeline tracking with AI-powered PWin scoring
- **Capture Management** - Shipley-compliant capture plans with win themes and discriminators
- **Proposal Automation** - AI-drafted sections with citations and compliance matrices
- **Color Team Reviews** - Pink/Red/Gold team workflows
- **Program Management** - Milestone tracking, RAID logs, deliverables

#### 🤖 **AI-Powered Automation**
- Multi-LLM support (OpenAI GPT-4, Anthropic Claude, local models)
- Automatic requirement extraction from RFPs/NOFOs
- Compliance matrix generation
- Red team analysis and gap identification
- PWin calculation based on 10 qualification factors

#### 📄 **Document Processing**
- PDF/DOCX RFP parsing
- Shipley-compliant outline generation
- AI-drafted proposal sections with citations
- 508 accessibility compliance validation
- Export to DOCX, PDF, Excel

#### 🏢 **Enterprise-Ready**
- Multi-tenant architecture with organization isolation
- Role-based access control (6 roles)
- FedRAMP/CMMC compliance controls
- Audit logging and security

## Tech Stack

### Backend
- **Framework:** FastAPI (Python 3.12)
- **Database:** PostgreSQL with pgvector for RAG
- **Cache/Queue:** Redis + Celery
- **AI/LLM:** OpenAI, Anthropic
- **Document Processing:** PyMuPDF, python-docx, WeasyPrint, openpyxl

### Frontend
- **Framework:** React 18 + TypeScript
- **Styling:** Tailwind CSS, shadcn/ui components
- **Charts:** Recharts
- **Routing:** React Router

### Infrastructure
- **Development:** Docker Compose
- **Production:** Kubernetes/Helm (ready)

## Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ and pnpm
- Python 3.12+
- PostgreSQL 14+
- Redis 7+

### 1. Clone and Setup

```bash
cd GovSure
```

### 2. Configure Environment

Edit `backend/.env` and add your API keys:

```bash
OPENAI_API_KEY=sk-your-key-here
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

### 3. Start with Docker Compose

```bash
docker-compose up -d
```

This will start:
- PostgreSQL (port 5432)
- Redis (port 6379)
- Backend API (port 8000)
- Celery worker
- Frontend (port 3000)

### 4. Access the Application

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000
- **API Docs:** http://localhost:8000/docs

## Manual Setup (Without Docker)

### Backend

```bash
cd backend

# Create virtual environment
python3.12 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start PostgreSQL and Redis
# (Install separately or use Docker)

# Run migrations
alembic upgrade head

# Start server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend

```bash
cd frontend

# Install dependencies
pnpm install

# Start development server
pnpm run dev
```

## Architecture

### Database Models

The application uses a **four-partition architecture**:

1. **Proposals** - RFP/RFQ response automation
2. **Grants** - NOFO/FOA application management
3. **Compliance** - FAR/DFARS/2CFR200 rules engine
4. **Program** - Milestone tracking and deliverables

### Key Models

- **Organizations** - Multi-tenant isolation
- **Users** - RBAC with 6 roles
- **Opportunities** - Pipeline with 6 stages (Tracking → Qualified → Capture → Bid → Submitted → Won/Lost)
- **Capture Plans** - Shipley methodology (situation analysis, win themes, discriminators)
- **Proposals** - Sections, compliance matrices, red team reviews
- **Knowledge Base** - Past performance, teaming partners, reusable content
- **Competitors** - Win/loss tracking, SWOT analysis
- **Programs** - Milestones, RAID logs, health scores

## API Endpoints

### Opportunities
- `GET /api/v1/opportunities` - List opportunities
- `POST /api/v1/opportunities` - Create opportunity
- `POST /api/v1/opportunities/{id}/calculate-pwin` - Calculate PWin score
- `POST /api/v1/opportunities/{id}/qualify` - Bid/No-Bid decision

### Proposals
- `GET /api/v1/proposals` - List proposals
- `POST /api/v1/proposals` - Create proposal
- `POST /api/v1/proposals/{id}/upload-rfp` - Upload RFP document
- `POST /api/v1/proposals/{id}/extract-requirements` - Extract requirements
- `POST /api/v1/proposals/{id}/generate-outline` - Generate Shipley outline
- `POST /api/v1/proposals/{id}/generate-section/{section}` - AI-generate section
- `POST /api/v1/proposals/{id}/red-team-review` - Red team analysis
- `POST /api/v1/proposals/{id}/export` - Export to DOCX/PDF/Excel

### Capture
- `POST /api/v1/capture` - Create capture plan
- `POST /api/v1/capture/{id}/generate` - AI-generate capture plan

## Typical Workflow

### 1. Opportunity Discovery
1. Create opportunity from SAM.gov or manual entry
2. AI calculates PWin score based on 10 factors
3. Make Bid/No-Bid decision

### 2. Capture Phase
1. Move to capture stage
2. Generate Shipley capture plan with AI
3. Define win themes and discriminators
4. Plan customer engagement

### 3. Proposal Development
1. Create proposal linked to opportunity
2. Upload RFP PDF
3. AI extracts requirements (30 sec)
4. Generate compliance matrix (1 min)
5. Create Shipley outline (instant)
6. AI drafts all sections with citations (3 min)
7. Red team review identifies gaps (30 sec)
8. Export DOCX/PDF/Excel package (instant)

**Total: ~5 minutes vs. 2-4 weeks manually**

## Feature Flags

Enable/disable features in `.env`:

```bash
GRANTS_MODE=true          # Enable grants/NOFO features
VOICE_MODE=false          # Voice-to-text for SME interviews
LOCAL_LLM=false           # Use local LLM instead of API
FEDRAMP=false             # FedRAMP compliance mode
```

## Development

### Database Migrations

```bash
cd backend

# Create migration
alembic revision --autogenerate -m "Description"

# Apply migrations
alembic upgrade head

# Rollback
alembic downgrade -1
```

### Running Tests

```bash
cd backend
pytest tests/
```

### Code Style

```bash
# Backend
black app/
flake8 app/

# Frontend
cd frontend
pnpm run lint
```

## Deployment

### Production Checklist

1. **Security**
   - Change `SECRET_KEY` in `.env`
   - Use strong database passwords
   - Enable HTTPS/TLS
   - Configure firewall rules

2. **Database**
   - Set up PostgreSQL with pgvector extension
   - Configure backups
   - Enable connection pooling

3. **Scaling**
   - Use Kubernetes for orchestration
   - Scale Celery workers based on load
   - Configure Redis cluster for high availability

4. **Monitoring**
   - Set up Prometheus metrics
   - Configure logging (ELK stack)
   - Enable error tracking (Sentry)

## Roadmap

### Phase 1: Core Features (✅ Complete)
- Opportunity pipeline
- Proposal automation
- Capture management
- Knowledge base
- Program management

### Phase 2: Advanced Features (🚧 In Progress)
- SAM.gov API integration
- Real-time collaboration
- Mobile app
- Advanced analytics
- Teaming partner matching

### Phase 3: Enterprise (📋 Planned)
- FedRAMP certification
- Government customer portal
- Advanced pricing/cost modeling
- Protest decision support
- Lessons learned AI

## Support

For questions, issues, or feature requests:
- **Documentation:** https://docs.GovSure.ai
- **Email:** support@GovSure.ai
- **GitHub Issues:** https://github.com/GovSure/govconai/issues

## License

Proprietary - All Rights Reserved

Copyright © 2025 GovLogic Inc.

## Credits

Built with:
- **Shipley Methodology** - Industry standard for government proposals
- **OpenAI GPT-4** - AI-powered content generation
- **FastAPI** - Modern Python web framework
- **React** - UI framework
- **PostgreSQL** - Database with vector search

---

**GovLogic GovConAI** - Transforming government contracting from artisan craft to automated science.

