# 🔧 GovSure Localhost Fixes - November 7, 2024

## Problem
The project was not working on localhost due to the GovSure rebrand and production configuration changes that disabled CORS and configured services for production deployment.

## What Was Fixed

### 1. ✅ CORS Enabled for Local Development
**File**: `backend/app/main.py`
- **Before**: CORS middleware was disabled (commented out) for production Caddy setup
- **After**: CORS middleware is now enabled with support for localhost origins
- **Impact**: Frontend at `localhost:3000` can now communicate with backend at `localhost:8000`

### 2. ✅ Vite Proxy Configuration Updated
**File**: `frontend/vite.config.ts`
- **Before**: Hardcoded to use Docker service name `http://backend:8000`
- **After**: Now uses environment variable with fallback to `http://localhost:8000`
- **Impact**: Frontend dev server can proxy API requests to local backend

### 3. ✅ Local Development Docker Compose
**File**: `docker-compose.local.yml` (NEW)
- **Purpose**: Simplified Docker setup for local development
- **Key Features**:
  - Exposes backend port 8000 to localhost
  - Enables DEBUG mode
  - Enables hot reload for backend
  - No Caddy reverse proxy (not needed for local dev)
- **Impact**: Backend is accessible at `localhost:8000` from your host machine

### 4. ✅ Simple Startup Scripts
**Files**: `start-local.sh` and `stop-local.sh` (NEW)
- One-command startup: `./start-local.sh`
- One-command shutdown: `./stop-local.sh`
- Includes health checks and helpful output

### 5. ✅ Updated Documentation
**File**: `LOCAL_DEVELOPMENT.md` (NEW)
- Complete guide for local development
- Troubleshooting section
- Quick start instructions
- Development tips

## How to Run Now

### Quick Start (3 Steps)

1. **Start the backend services:**
```bash
./start-local.sh
```

2. **Start the frontend (in a new terminal):**
```bash
cd frontend
npm install  # first time only
npm run dev
```

3. **Open your browser:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## What's Running

| Service | Port | URL |
|---------|------|-----|
| Frontend (React) | 3000 | http://localhost:3000 |
| Backend (FastAPI) | 8000 | http://localhost:8000 |
| API Documentation | 8000 | http://localhost:8000/docs |
| PostgreSQL | 5432 | localhost:5432 |
| Redis | 6379 | localhost:6379 |

## Technical Details

### CORS Configuration
The backend now allows requests from:
- `http://localhost:3000` (frontend dev server)
- `http://127.0.0.1:3000`
- `http://localhost:8000` (backend)
- `http://127.0.0.1:8000`
- Production domains (govsureai.com)

### Environment Variables
All configured in `docker-compose.local.yml`:
- `DEBUG=true` - Enables debug mode
- `DATABASE_URL` - PostgreSQL connection
- `REDIS_URL` - Redis connection
- `OPENAI_API_KEY` - From your .env file
- `ANTHROPIC_API_KEY` - From your .env file

### Hot Reload
Both frontend and backend support hot reload:
- **Frontend**: Vite automatically reloads on file changes
- **Backend**: Uvicorn reloads on Python file changes (`--reload` flag)

## Differences from Production

| Feature | Local Development | Production |
|---------|------------------|------------|
| CORS | Enabled in FastAPI | Handled by Caddy |
| Backend Port | Exposed (8000) | Internal only |
| Debug Mode | Enabled | Disabled |
| Hot Reload | Enabled | Disabled |
| SSL/TLS | Not needed | Caddy handles |
| Frontend | Dev server (Vite) | Static build served by Caddy |

## Troubleshooting

### Backend won't start
```bash
# Check if port 8000 is in use
lsof -i :8000

# View backend logs
docker-compose -f docker-compose.local.yml logs -f backend
```

### Frontend can't connect to backend
```bash
# Test backend health
curl http://localhost:8000/health

# Should return: {"status":"healthy","app":"GovSure","version":"1.0.0"}
```

### CORS errors
1. Make sure you're accessing frontend via `http://localhost:3000`
2. Clear browser cache
3. Check backend logs for CORS-related messages

### Database issues
```bash
# Reset database
docker-compose -f docker-compose.local.yml down -v
docker-compose -f docker-compose.local.yml up -d
```

## Files Changed

1. ✅ `backend/app/main.py` - Enabled CORS
2. ✅ `frontend/vite.config.ts` - Updated proxy configuration
3. ✅ `docker-compose.local.yml` - NEW: Local development setup
4. ✅ `start-local.sh` - NEW: Startup script
5. ✅ `stop-local.sh` - NEW: Shutdown script
6. ✅ `LOCAL_DEVELOPMENT.md` - NEW: Development guide
7. ✅ `LOCALHOST_FIXES.md` - NEW: This file

## Next Steps

1. ✅ Start services: `./start-local.sh`
2. ✅ Start frontend: `cd frontend && npm run dev`
3. ✅ Create test users: `./create_test_users_simple.sh`
4. ✅ Open browser: http://localhost:3000
5. 🚀 Start developing!

## Production Deployment

For production deployment (with Caddy), use the original:
```bash
docker-compose up -d
```

This uses `docker-compose.yml` which includes Caddy for SSL/TLS and production optimizations.

---

**Status**: ✅ All issues fixed - Ready for local development!

**Last Updated**: November 7, 2024

