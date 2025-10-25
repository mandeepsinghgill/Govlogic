# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

GovLogic GovConAI is an enterprise-grade, AI-powered platform for government contracting and grants management. The platform helps users discover opportunities, generate proposals, manage compliance, and track awards through AI-assisted workflows.

**Tech Stack:**
- **Backend:** Python 3.11, FastAPI, SQLAlchemy, PostgreSQL with pgvector, Redis, Celery
- **Frontend:** React, TypeScript, Vite, Tailwind CSS, shadcn/ui components
- **Infrastructure:** Docker, Kubernetes, CI/CD via GitHub Actions
- **AI:** OpenAI GPT-4, Anthropic Claude (configurable)

## Development Commands

### Docker Compose (Recommended for Development)

```bash
# Start all services (backend, frontend, postgres, redis, celery)
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Rebuild containers after changes
docker-compose up -d --build
```

**Access Points:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs
- Database: localhost:5432
- Redis: localhost:6379

### Backend Commands

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Run development server with hot reload
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

# Run tests
pytest

# Run tests with coverage
pytest --cov=app --cov-report=html

# Run specific test file
pytest tests/test_auth.py

# Run tests with markers
pytest -m unit          # Run only unit tests
pytest -m integration   # Run only integration tests

# Database migrations
alembic upgrade head    # Apply migrations
alembic revision --autogenerate -m "description"  # Create new migration

# Run Celery worker (for background tasks)
celery -A app.celery_app worker --loglevel=info

# Code quality
black .                 # Format code
isort .                 # Sort imports
flake8                  # Lint code
mypy .                  # Type checking
```

### Frontend Commands

```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm test

# Run tests in watch mode
npm test:watch

# Run tests with coverage
npm test:coverage

# Lint code
npm run lint

# Type checking
npm run type-check
```

## Architecture

### Backend Structure

The backend follows a layered architecture with clear separation of concerns:

```
backend/app/
├── api/              # 25+ API route handlers (auth, opportunities, proposals, grants, etc.)
├── models/           # SQLAlchemy models (User, Organization, Opportunity, Proposal, etc.)
├── services/         # Business logic layer (25+ service files)
├── middleware/       # Enterprise security, monitoring, performance optimization
├── core/             # Core utilities (database, auth, config)
├── main.py           # FastAPI application entry point
└── config.py         # Configuration management
```

**Key Patterns:**
- **Models:** SQLAlchemy ORM models in `app/models/` define database schema
- **API Routes:** FastAPI routers in `app/api/` handle HTTP requests
- **Services:** Business logic in `app/services/` is called by API routes
- **Middleware:** Security, monitoring, and performance middleware applied globally
- **Dependencies:** Use FastAPI's dependency injection for database sessions and auth

**Important Services:**
- `auth_service.py`: JWT authentication, password hashing, user management
- `ai_service.py`: OpenAI/Anthropic integration for AI features
- `opportunity_service.py`: 6-factor AI matching algorithm for opportunities
- `proposal_service.py`: Shipley-compliant proposal generation
- `compliance_service.py`: FAR/DFARS/NIST/CMMC compliance checking

### Frontend Structure

The frontend uses React with TypeScript and follows a component-based architecture:

```
frontend/src/
├── pages/            # 14+ page components (Dashboard, Opportunities, Proposals, etc.)
├── components/       # Reusable UI components
├── services/         # API client services (axios-based)
├── hooks/            # Custom React hooks
├── lib/              # Utility functions
├── types/            # TypeScript type definitions
└── App.tsx           # Main application with routing
```

**Key Patterns:**
- **Authentication:** JWT tokens stored in localStorage, checked in ProtectedRoute component
- **API Communication:** Centralized API client in `services/api.ts`
- **State Management:** Local state with hooks (no global state library currently used)
- **Routing:** React Router v6 with protected routes
- **UI Components:** shadcn/ui components with Tailwind CSS styling

### Database Architecture

**Core Models:**
- `User`: Users with role-based access (ADMIN, MEMBER, VIEWER)
- `Organization`: Multi-tenant organizations with subscription tiers
- `Opportunity`: Government opportunities from SAM.gov with AI matching scores
- `Proposal`: Proposals with versioning, collaboration, and compliance tracking
- `Grant`: Grant applications with SF-424 forms and budget narratives
- `Knowledge`: Document embeddings stored in pgvector for AI retrieval

**Relationships:**
- Organizations have many Users
- Organizations have many Opportunities, Proposals, Grants
- Users create Proposals and Grants
- Opportunities can be converted to Proposals

### AI Integration

The platform integrates multiple AI providers for various features:

**Supported Providers:**
- OpenAI (GPT-4, GPT-3.5-turbo)
- Anthropic (Claude-3-opus, Claude-3-sonnet)
- Local models (optional, via LOCAL_LLM flag)

**AI Features:**
- **Opportunity Matching:** 6-factor algorithm (capabilities, experience, past performance, team, pricing, compliance)
- **Proposal Generation:** Shipley-compliant sections, win themes, compliance matrices
- **Grant Writing:** SF-424 forms, budget narratives, impact statements
- **Compliance Checking:** FAR/DFARS/NIST/CMMC compliance validation
- **Document Processing:** PDF/DOCX parsing and embedding generation

## Configuration

### Environment Variables

Required environment variables (see `.env.example`):

**Database:**
- `DATABASE_URL`: PostgreSQL connection string
- `REDIS_URL`: Redis connection string

**Security:**
- `SECRET_KEY`: JWT secret key (generate with `openssl rand -hex 32`)
- `ALGORITHM`: JWT algorithm (HS256)
- `ACCESS_TOKEN_EXPIRE_MINUTES`: Token expiration (30)

**AI/LLM:**
- `OPENAI_API_KEY`: OpenAI API key (required for AI features)
- `ANTHROPIC_API_KEY`: Anthropic API key (optional)
- `DEFAULT_LLM_PROVIDER`: Provider to use (openai, anthropic, local)
- `DEFAULT_LLM_MODEL`: Model to use (gpt-4, claude-3-opus, etc.)

**Feature Flags:**
- `GRANTS_MODE`: Enable grants features (true/false)
- `VOICE_MODE`: Enable voice features (true/false)
- `LOCAL_LLM`: Use local LLM instead of API (true/false)
- `FEDRAMP`: Enable FedRAMP compliance mode (true/false)
- `DEBUG`: Enable debug mode (true/false, set to false in production)

**External Services (Optional):**
- `SAM_GOV_API_KEY`: SAM.gov API for opportunity data
- `SENDGRID_API_KEY`: SendGrid for email notifications
- `STRIPE_PUBLIC_KEY` / `STRIPE_SECRET_KEY`: Stripe for payments
- `DOCUSIGN_INTEGRATION_KEY`: DocuSign for document signing

### Test Accounts

Default test credentials (see START_HERE.md):
- **Email:** testuser@govlogic.com
- **Password:** TestPass123!

## Testing

### Backend Testing

**Test Framework:** pytest with pytest-asyncio for async tests

**Test Structure:**
- `backend/tests/conftest.py`: Shared fixtures (test database, test client, test user)
- `backend/tests/test_auth.py`: Authentication tests
- `backend/tests/test_opportunities.py`: Opportunity API tests
- `backend/tests/test_services.py`: Service layer tests

**Test Database:** SQLite in-memory database for fast testing

**Coverage Target:** 80%+ (enforced in pytest.ini)

**Common Fixtures:**
- `db_session`: Test database session
- `client`: FastAPI test client
- `test_user`: Authenticated test user
- `test_organization`: Test organization
- `auth_headers`: Authentication headers for requests

### Frontend Testing

**Test Framework:** Jest with React Testing Library

**Test Files:** Located in `frontend/src/__tests__/`

**Running Tests:**
- `npm test`: Run tests
- `npm test:watch`: Watch mode
- `npm test:coverage`: Coverage report

## Common Workflows

### Adding a New API Endpoint

1. **Create Model** (if needed): Add SQLAlchemy model in `backend/app/models/`
2. **Create Service**: Add business logic in `backend/app/services/`
3. **Create Router**: Add API routes in `backend/app/api/`
4. **Register Router**: Import and include router in `backend/app/main.py`
5. **Add Tests**: Create tests in `backend/tests/`
6. **Update Frontend**: Add API client method in `frontend/src/services/`

### Adding a New Frontend Page

1. **Create Page Component**: Add component in `frontend/src/pages/`
2. **Add Route**: Register route in `frontend/src/App.tsx`
3. **Add Navigation**: Update sidebar navigation in AppLayout component
4. **Add API Integration**: Create service methods in `frontend/src/services/`
5. **Add Tests**: Create tests in `frontend/src/__tests__/`

### Working with AI Features

**AI Service:** All AI functionality goes through `backend/app/services/ai_service.py`

**Key Methods:**
- `generate_completion()`: Generate text completion
- `generate_embeddings()`: Generate vector embeddings for documents
- `analyze_rfp()`: Analyze RFP documents for requirements
- `generate_proposal_section()`: Generate proposal content

**Best Practices:**
- Always handle API errors (rate limits, invalid keys, etc.)
- Use caching for expensive AI operations
- Implement retries with exponential backoff
- Monitor token usage and costs

### Database Migrations

When modifying models:

1. Make changes to SQLAlchemy models in `backend/app/models/`
2. Generate migration: `alembic revision --autogenerate -m "description"`
3. Review generated migration in `backend/alembic/versions/`
4. Apply migration: `alembic upgrade head`
5. Test rollback: `alembic downgrade -1`

## Deployment

### Docker Deployment

```bash
# Build and deploy with docker-compose
docker-compose -f docker-compose.yml up -d --build

# Check service health
docker-compose ps
docker-compose logs -f backend
```

### Kubernetes Deployment

```bash
# Deploy to Kubernetes
kubectl apply -f k8s/enterprise-deployment.yaml

# Check deployment status
kubectl get pods -n govlogic
kubectl logs -f deployment/govlogic-backend -n govlogic

# Scale services
kubectl scale deployment govlogic-backend --replicas=5
```

### CI/CD

GitHub Actions workflows in `.github/workflows/`:
- `ci-cd.yml`: Main CI/CD pipeline (test, build, deploy)
- `enterprise-deployment.yml`: Enterprise deployment pipeline

**Pipeline Steps:**
1. Run backend tests
2. Run frontend tests
3. Build Docker images
4. Push to container registry
5. Deploy to Kubernetes

## Code Style and Conventions

### Backend (Python)

- **Formatting:** Black with default settings
- **Import Sorting:** isort
- **Linting:** flake8
- **Type Checking:** mypy
- **Docstrings:** Google style docstrings
- **Naming:**
  - Functions/methods: `snake_case`
  - Classes: `PascalCase`
  - Constants: `UPPER_SNAKE_CASE`

### Frontend (TypeScript/React)

- **Formatting:** ESLint with TypeScript plugin
- **Component Style:** Functional components with hooks
- **File Naming:** PascalCase for components, camelCase for utilities
- **Props:** Use TypeScript interfaces for prop types
- **State:** Prefer hooks over class components

## Security Considerations

- **Authentication:** JWT tokens with secure secret keys
- **Authorization:** Role-based access control (RBAC)
- **Input Validation:** Pydantic models validate all API inputs
- **SQL Injection:** SQLAlchemy ORM prevents SQL injection
- **XSS Protection:** React escapes by default
- **CORS:** Configured in backend config.py
- **Secrets:** Never commit secrets; use environment variables
- **API Keys:** Store in environment variables, never in code

## Performance Optimization

- **Caching:** Redis caching for expensive operations
- **Database:** Connection pooling and query optimization
- **Frontend:** Code splitting and lazy loading
- **AI:** Batch requests and cache embeddings
- **Monitoring:** Prometheus metrics at `/metrics` endpoint

## Troubleshooting

### Backend Issues

**"Insufficient credits" error:**
- OpenAI API key needs credits
- Set a valid `OPENAI_API_KEY` in `.env`

**Database connection errors:**
- Ensure PostgreSQL is running: `docker-compose ps`
- Check `DATABASE_URL` in `.env`

**Import errors:**
- Install dependencies: `pip install -r requirements.txt`
- Ensure virtual environment is activated

### Frontend Issues

**"Cannot find module" errors:**
- Install dependencies: `npm install`
- Clear cache: `rm -rf node_modules && npm install`

**API connection errors:**
- Check backend is running: http://localhost:8000/health
- Verify `VITE_API_URL` in frontend `.env`

**Authentication issues:**
- Clear localStorage: `localStorage.clear()`
- Check JWT token expiration
