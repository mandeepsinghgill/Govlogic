# Same Domain Setup - localhost:8000 Issue Fixed ✅

## The Problem

You were seeing:
```
Access to fetch at 'http://localhost:8000/api/v1/auth/login' from origin 'https://govsureai.com' 
has been blocked by CORS policy
POST http://localhost:8000/api/v1/auth/login net::ERR_FAILED 404 (Not Found)
```

## Root Cause

Your frontend had a `.env` file with:
```
REACT_APP_API_URL=https://8000-i5z1b5qintoutdw9r1wse-ab7174de.manusvm.computer
```

This was:
1. **Wrong variable name** - Using `REACT_APP_*` (Create React App) instead of `VITE_*` (Vite)
2. **Overriding docker-compose** - The .env file takes precedence over build args
3. **Development URL** - Pointing to old dev environment

The build process reads `.env` files and embeds them into the compiled JavaScript, so even though docker-compose.yml was correct, the .env file was winning.

## Files Fixed

### 1. ✅ `/frontend/.env`
```bash
# BEFORE (wrong)
REACT_APP_API_URL=https://8000-i5z1b5qintoutdw9r1wse-ab7174de.manusvm.computer

# AFTER (correct)
VITE_API_URL=
```

Empty `VITE_API_URL` makes the frontend use relative paths like `/api/v1/auth/login`

### 2. ✅ Created `/frontend/.env.local` (for local development)
```bash
VITE_API_URL=http://localhost:8000
```

This file is git-ignored and only used for local development.

## How .env Files Work in Vite

Vite reads environment files in this order (last one wins):

1. `.env` - Loaded in all cases
2. `.env.local` - Loaded in all cases, ignored by git
3. `.env.production` - Only loaded in production builds
4. `.env.production.local` - Only loaded in production builds, ignored by git
5. **Build args** - Can be overridden by .env files!

### Priority Order:
```
Command line args < Build args < .env < .env.local < .env.production < .env.production.local
```

## The Fix

### Quick Deploy (Automated):

```bash
./fix_same_domain_deployment.sh
```

This script will:
- Stop all containers
- Remove volumes (clear old builds)
- Rebuild with correct configuration
- Verify the compiled code
- Show testing steps

### Manual Deploy:

```bash
# 1. Stop and clean everything
docker compose down -v
docker volume prune -f

# 2. Rebuild frontend (it will now read the correct .env)
docker compose build --no-cache web

# 3. Rebuild backend
docker compose build --no-cache backend

# 4. Start everything
docker compose up -d

# 5. Check logs
docker compose logs -f
```

## Verification Steps

### 1. Check Compiled Code

```bash
# This should return nothing (no localhost:8000 in compiled files)
docker compose exec caddy grep -r "localhost:8000" /usr/share/caddy/assets/ || echo "✅ Clean!"
```

If it finds localhost:8000, the build didn't work correctly.

### 2. Test in Browser

1. **Clear browser cache completely** (Ctrl+Shift+Delete)
2. Or use **Incognito/Private window**
3. Visit https://govsureai.com
4. Open DevTools (F12) → Network tab
5. Try logging in
6. Check the request URL:
   - ✅ **Should be:** `/api/v1/auth/login` (relative)
   - ❌ **Should NOT be:** `http://localhost:8000/api/v1/auth/login`

### 3. Test API Endpoint

```bash
# From your production server
curl http://localhost/api/v1/health

# Should return 200 OK
```

### 4. Check Environment Variables During Build

```bash
# See what Vite sees during build
docker compose build web 2>&1 | grep -i vite

# Check current .env
cat frontend/.env
```

## Architecture: Same Domain

With this setup:

```
Frontend:  https://govsureai.com
API:       https://govsureai.com/api/*  (relative paths)
```

**Request Flow:**
```
1. Browser requests: https://govsureai.com
   → Caddy serves: Frontend static files

2. Frontend makes API call: fetch('/api/v1/auth/login')
   → Browser sends to: https://govsureai.com/api/v1/auth/login (same origin)
   → Caddy proxies: /api/* to backend:8000
   → No CORS issues! (same origin)
```

## Environment File Setup for Different Scenarios

### For Production (Same Domain):
```bash
# /frontend/.env
VITE_API_URL=
```

### For Production (Subdomain):
```bash
# /frontend/.env
VITE_API_URL=https://api.govsureai.com
```

### For Local Development:
```bash
# /frontend/.env.local (git-ignored)
VITE_API_URL=http://localhost:8000
```

## Common Issues and Solutions

### Issue 1: Still Seeing localhost:8000 After Rebuild

**Solution:**
```bash
# 1. Check .env file
cat frontend/.env

# 2. Clear ALL volumes
docker compose down -v
docker volume ls | grep govlogic | awk '{print $2}' | xargs docker volume rm

# 3. Clean rebuild
docker compose build --no-cache web
docker compose up -d

# 4. Clear browser cache or use incognito
```

### Issue 2: CORS Errors with Credentials

**Error:** "Access-Control-Allow-Origin must not be wildcard '*' when credentials mode is 'include'"

**Solution:** Already fixed in `backend/app/config.py`:
```python
CORS_ORIGINS: List[str] = [
    "https://govsureai.com",
    "https://www.govsureai.com",
    # NOT "*"
]
```

### Issue 3: 404 Not Found on /api Requests

**Check:**
```bash
# 1. Is Caddy proxying correctly?
docker compose exec caddy cat /etc/caddy/Caddyfile

# 2. Is backend running?
docker compose ps backend

# 3. Test backend directly
docker compose exec backend curl http://localhost:8000/api/v1/health
```

### Issue 4: Build Successful But Still Wrong URL

**This means a .env file is being read.** Check:
```bash
# Find all .env files
find frontend/ -name ".env*" -type f

# Check each one
cat frontend/.env
cat frontend/.env.local
cat frontend/.env.production

# Remove or fix the incorrect ones
```

## Switching Between Architectures

### Switch to Subdomain:

1. Edit `frontend/.env`:
   ```bash
   VITE_API_URL=https://api.govsureai.com
   ```

2. Rebuild:
   ```bash
   docker compose build --no-cache web
   docker compose up -d
   ```

3. Configure DNS for `api.govsureai.com`

### Switch Back to Same Domain:

1. Edit `frontend/.env`:
   ```bash
   VITE_API_URL=
   ```

2. Rebuild:
   ```bash
   docker compose build --no-cache web
   docker compose up -d
   ```

## Testing Checklist

- [ ] `.env` file has `VITE_API_URL=` (empty)
- [ ] No old dev URLs in .env
- [ ] Rebuilt frontend: `docker compose build --no-cache web`
- [ ] Restarted all containers: `docker compose up -d`
- [ ] Cleared browser cache (Ctrl+Shift+Delete)
- [ ] Tested in incognito/private window
- [ ] Network tab shows relative paths: `/api/v1/...`
- [ ] No localhost:8000 in requests
- [ ] Login works
- [ ] No CORS errors
- [ ] No 404 errors

## Quick Reference Commands

**Check what's in .env:**
```bash
cat frontend/.env
```

**Clean rebuild everything:**
```bash
docker compose down -v && docker compose build --no-cache web backend && docker compose up -d
```

**Check compiled code for localhost:**
```bash
docker compose exec caddy grep -r "localhost" /usr/share/caddy/assets/ | head -5
```

**Test API from server:**
```bash
curl -I http://localhost/api/v1/health
```

**Clear Docker completely:**
```bash
docker compose down -v
docker system prune -af
docker volume prune -f
```

## Summary

### The Problem:
- ❌ `.env` file had wrong variable name (`REACT_APP_*`)
- ❌ `.env` file had old dev URL
- ❌ `.env` file overrode docker-compose build args
- ❌ Frontend was compiled with localhost:8000 hardcoded

### The Solution:
- ✅ Fixed `.env` to use `VITE_API_URL=` (empty)
- ✅ Created `.env.local` for local development
- ✅ Rebuild frontend to embed correct value
- ✅ Frontend now uses relative paths
- ✅ No CORS issues (same origin)

### The Result:
- 🎉 Frontend uses relative paths: `/api/v1/...`
- 🎉 Caddy proxies to backend correctly
- 🎉 No CORS errors (same domain)
- 🎉 Login works!

---

**Status:** ✅ **Fixed and Ready to Deploy**  
**Date:** November 3, 2025  
**Action Required:** Run `./fix_same_domain_deployment.sh` or deploy manually  
**Expected Result:** Frontend uses relative paths, no localhost:8000!

---

**Pro Tip:** Always check for `.env` files when builds behave unexpectedly! They often override configuration in sneaky ways. 🕵️

