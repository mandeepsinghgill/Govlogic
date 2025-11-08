# 🔧 CORS Issue Fixed - Production Deployment Guide

## The Problem

You were experiencing duplicate CORS headers:
```
Access-Control-Allow-Origin: 'https://govsureai.com, https://govsureai.com'
```

This happened because **both** Caddy and the FastAPI backend were adding CORS headers simultaneously.

## The Root Cause

Your setup has two environments:

### Local Development (DEBUG=true)
- Backend adds CORS headers (for direct API access)
- Caddy doesn't interfere with CORS

### Production (DEBUG=false)
- Backend should NOT add CORS headers
- Caddy handles all CORS headers
- **BUT**: Your docker-compose.yml had `DEBUG: "true"` for both!

## The Fix

### What Was Changed

#### 1. Created `docker-compose.prod.yml`
- Sets `DEBUG: "false"` for production
- Backend CORS middleware is disabled
- Caddy handles all CORS headers
- Proper production settings (4 workers, restart policies)

#### 2. Fixed `Caddyfile`
- Uses `handle` blocks to prevent duplicate headers
- `header_down` ensures headers are only added once
- Proper OPTIONS preflight handling
- Separated CORS logic from security headers

#### 3. Created `deploy_production.sh`
- Automated production deployment
- Forces frontend rebuild (clears cache)
- Uses production docker-compose file
- Validates configuration

## How to Deploy to Production

### Option 1: Automated Deployment (Recommended)

```bash
cd /Users/mandeepgill/Downloads/govlogic
./deploy_production.sh
```

This script will:
1. ✅ Stop all services
2. ✅ Remove frontend volume (force rebuild)
3. ✅ Build with production settings
4. ✅ Start services with DEBUG=false
5. ✅ Reload Caddy configuration
6. ✅ Verify CORS settings

### Option 2: Manual Deployment

```bash
# Stop everything
docker compose -f docker-compose.prod.yml down

# Remove frontend volume to force rebuild
docker volume rm govlogic_frontend_dist

# Build everything fresh
docker compose -f docker-compose.prod.yml build --no-cache

# Start production services
docker compose -f docker-compose.prod.yml up -d

# Reload Caddy
docker compose -f docker-compose.prod.yml exec caddy caddy reload --config /etc/caddy/Caddyfile
```

## Verification

### 1. Check Backend DEBUG Status

```bash
docker compose -f docker-compose.prod.yml logs backend | grep CORS
```

You should see:
```
🔒 CORS disabled - handled by Caddy reverse proxy (production)
```

### 2. Check CORS Headers

```bash
curl -I -H "Origin: https://govsureai.com" https://api.govsureai.com/api/v1/health
```

You should see **ONLY ONE** of each header:
```
Access-Control-Allow-Origin: https://govsureai.com
Access-Control-Allow-Credentials: true
```

### 3. Test in Browser

1. Open DevTools (F12)
2. Go to Network tab
3. Visit https://govsureai.com
4. Try to login
5. Check the request to `https://api.govsureai.com/api/v1/auth/login`
6. Headers should show single CORS values (no duplicates)

### 4. Clear Browser Cache

Even after deploying, browsers cache aggressively:

- **Chrome/Firefox (Windows/Linux)**: `Ctrl + Shift + R`
- **Chrome/Firefox (Mac)**: `Cmd + Shift + R`
- **Safari**: `Cmd + Option + R`

Or use DevTools → Right-click Refresh → "Empty Cache and Hard Reload"

## Understanding the Architecture

### Development (docker-compose.yml)
```
┌─────────────┐
│  Browser    │
│ localhost   │
└──────┬──────┘
       │
       ├──── Frontend: http://localhost:80 (Caddy)
       │     └─ Built with VITE_API_URL=http://localhost:80
       │
       └──── Backend: http://localhost:8000 (Direct)
             └─ DEBUG=true, CORS enabled in FastAPI
```

### Production (docker-compose.prod.yml)
```
┌─────────────────────┐
│      Browser        │
│  govsureai.com      │
└──────┬──────────────┘
       │
       ├──── Frontend: https://govsureai.com (Caddy)
       │     └─ Built with VITE_API_URL=https://api.govsureai.com
       │
       └──── API: https://api.govsureai.com (Caddy → Backend)
             ├─ Caddy handles CORS headers
             └─ Backend: DEBUG=false, CORS disabled
```

## File Comparison

### docker-compose.yml (Local Development)
- `DEBUG: "true"` → Backend adds CORS
- `VITE_API_URL: "http://localhost:80"` → Same domain
- Exposed ports for debugging
- Single worker for fast restarts

### docker-compose.prod.yml (Production)
- `DEBUG: "false"` → Backend CORS disabled
- `VITE_API_URL: "https://api.govsureai.com"` → API subdomain
- No exposed ports (security)
- 4 workers for performance
- Restart policies for reliability

## Troubleshooting

### Issue: Still seeing duplicate CORS headers

**Solution:**
```bash
# Check which docker-compose file is running
docker compose ps

# If using wrong file, switch to production
docker compose down
docker compose -f docker-compose.prod.yml up -d
```

### Issue: Old frontend still showing

**Solution:**
```bash
# Force complete rebuild
docker compose -f docker-compose.prod.yml down
docker volume rm govlogic_frontend_dist
docker compose -f docker-compose.prod.yml build --no-cache web
docker compose -f docker-compose.prod.yml up -d
```

### Issue: Browser still caching

**Solution:**
1. Open DevTools (F12)
2. Go to Application → Storage → Clear site data
3. Or use incognito/private window
4. Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

### Issue: API requests failing

**Solution:**
```bash
# Check backend logs
docker compose -f docker-compose.prod.yml logs backend --tail=50

# Check Caddy logs
docker compose -f docker-compose.prod.yml logs caddy --tail=50

# Test API directly
curl https://api.govsureai.com/api/v1/health
```

## Environment Files

### For Production

Create `.env.production`:
```bash
# Database
POSTGRES_PASSWORD=your_secure_password_here

# API Keys
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
SAM_API_KEY=your_sam_api_key
```

Load it before deploying:
```bash
source .env.production
./deploy_production.sh
```

## Quick Commands Reference

```bash
# Start production
docker compose -f docker-compose.prod.yml up -d

# Stop production
docker compose -f docker-compose.prod.yml down

# View logs
docker compose -f docker-compose.prod.yml logs -f

# Rebuild frontend only
docker compose -f docker-compose.prod.yml build web
docker compose -f docker-compose.prod.yml up -d caddy

# Reload Caddy config
docker compose -f docker-compose.prod.yml exec caddy caddy reload --config /etc/caddy/Caddyfile

# Check service status
docker compose -f docker-compose.prod.yml ps
```

## Summary

✅ **Fixed**: Duplicate CORS headers  
✅ **Created**: Production docker-compose file with DEBUG=false  
✅ **Updated**: Caddyfile to prevent header duplication  
✅ **Created**: Automated deployment script  
✅ **Ensured**: Proper API URL configuration for production  

Your production deployment should now work perfectly without CORS issues! 🎉

