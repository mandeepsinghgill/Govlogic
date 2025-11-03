# API Subdomain Configuration - Complete ✅

## What Was Updated

All configuration files have been updated to support both architecture options:
1. **Same Domain** (govsureai.com/api) - Current default
2. **Subdomain** (api.govsureai.com) - Professional architecture

---

## Files Updated

### 1. ✅ `frontend/vite.config.ts`
**Changes:**
- Cleaned up CORS configuration for api.govsureai.com support
- Fixed proxy configuration for development
- Added proper build optimization
- Disabled sourcemaps in production for security
- Added vendor code splitting

**Key Features:**
- Development proxy: `/api` → `http://backend:8000`
- CORS support for all domains (govsureai.com, www, api subdomain)
- WebSocket support enabled
- Production-optimized builds

### 2. ✅ `Caddyfile`
**Changes:**
- Added comprehensive configuration for **3 scenarios**:
  1. `govsureai.com` - Main app (frontend)
  2. `api.govsureai.com` - API subdomain (backend)
  3. `:80` - IP fallback for testing

**Key Features:**
- Automatic HTTPS with Let's Encrypt
- Proper CORS headers for subdomain setup
- Security headers (X-Frame-Options, CSP, etc.)
- Preflight OPTIONS request handling
- Smart routing for both architectures

### 3. ✅ `docker-compose.yml`
**Changes:**
- Added comments explaining both options
- VITE_API_URL configured with instructions
- Ready to switch between architectures

**Current Setting:** Same domain (VITE_API_URL: "")

### 4. 📄 New Files Created

**`DOMAIN_SETUP_GUIDE.md`** - Comprehensive guide covering:
- Both architecture options explained
- Pros/cons of each approach
- Step-by-step setup instructions
- DNS configuration examples
- SSL certificate setup
- CORS configuration
- Testing procedures
- Troubleshooting guide
- Production checklist

**`switch_architecture.sh`** - Interactive script to switch between setups:
- Easy menu-driven interface
- Automatically updates docker-compose.yml
- Shows next steps based on choice
- Optional automatic deployment
- Works with both docker-compose v1 and v2

**`production.env.template`** - Environment variables template:
- Clear documentation for each variable
- Both architecture options shown
- Security best practices
- Ready to copy and customize

---

## Architecture Options

### Option 1: Same Domain (Current Default) ✅

```
Frontend:  https://govsureai.com
API:       https://govsureai.com/api/v1/*
```

**DNS Required:**
```
govsureai.com       → YOUR_SERVER_IP
www.govsureai.com   → YOUR_SERVER_IP
```

**Advantages:**
- ✅ No CORS issues (same origin)
- ✅ Simpler DNS setup
- ✅ Single SSL certificate
- ✅ Easier to manage
- ✅ Better for getting started

**Use When:**
- Just starting out
- Running on one server
- Want simplest possible setup

---

### Option 2: API Subdomain (Professional Architecture)

```
Frontend:  https://govsureai.com
API:       https://api.govsureai.com/api/v1/*
```

**DNS Required:**
```
govsureai.com       → YOUR_SERVER_IP
www.govsureai.com   → YOUR_SERVER_IP
api.govsureai.com   → YOUR_SERVER_IP (or different server)
```

**Advantages:**
- ✅ Professional architecture
- ✅ Independent scaling
- ✅ Can deploy to different servers
- ✅ Better separation of concerns
- ✅ Modern microservices approach

**Use When:**
- Ready to scale
- Want professional setup
- Need independent deployments
- Planning microservices architecture

---

## Quick Start

### Current Setup (Same Domain)

Your system is currently configured for **same domain** architecture. This is the recommended starting point.

**To Deploy:**
```bash
# Use the automated deployment script
./deploy_production_fix.sh

# Or manually:
docker compose down -v
docker compose build --no-cache web
docker compose up -d
```

**DNS Setup:**
1. Point `govsureai.com` to your server IP
2. Point `www.govsureai.com` to your server IP
3. Wait for DNS propagation (5-60 minutes)
4. Caddy will automatically get SSL certificates
5. Visit https://govsureai.com

---

### Switch to Subdomain Architecture

**Use the interactive script:**
```bash
./switch_architecture.sh
```

This script will:
1. Ask which architecture you want
2. Update docker-compose.yml automatically
3. Show DNS setup instructions
4. Optionally deploy immediately
5. Provide testing commands

**Or manually:**
```bash
# Edit docker-compose.yml
# Change: VITE_API_URL: ""
# To:     VITE_API_URL: "https://api.govsureai.com"

# Deploy
docker compose down -v
docker compose build --no-cache web backend
docker compose up -d
```

**Additional DNS Setup:**
```
api.govsureai.com → YOUR_SERVER_IP
```

**Update Backend CORS** in `backend/app/core/config.py`:
```python
CORS_ORIGINS = [
    "https://govsureai.com",
    "https://www.govsureai.com",
]
CORS_ALLOW_CREDENTIALS = True
```

---

## How It Works

### Development (Local)
```
Browser → http://localhost:3000
    ↓
Vite Dev Server
    ↓ (proxy /api → backend:8000)
Backend Container
```

Vite's proxy handles routing `/api` requests to backend automatically.

### Production - Same Domain
```
Browser → https://govsureai.com
    ↓
Caddy Container
    ├─→ / (frontend) → serves static files
    └─→ /api/* (backend) → reverse proxy to backend:8000
```

Frontend uses relative paths, Caddy routes everything.

### Production - Subdomain
```
Browser → https://govsureai.com
    ↓
Caddy Container → serves static files

Browser → https://api.govsureai.com/api/v1/*
    ↓
Caddy Container → reverse proxy to backend:8000
    (with CORS headers)
```

Frontend uses full URLs, Caddy handles CORS at api subdomain.

---

## Testing Your Setup

### 1. Test DNS
```bash
nslookup govsureai.com
# Should return your server IP
```

### 2. Test Frontend
```bash
curl -I https://govsureai.com
# Should return: HTTP/2 200
```

### 3. Test API

**Same Domain:**
```bash
curl https://govsureai.com/api/v1/health
```

**Subdomain:**
```bash
curl https://api.govsureai.com/api/v1/health
```

### 4. Test in Browser
1. Open https://govsureai.com
2. F12 → Network tab
3. Try logging in
4. Check API requests:
   - Same domain: `/api/v1/auth/login`
   - Subdomain: `https://api.govsureai.com/api/v1/auth/login`

### 5. Test CORS (Subdomain Only)
```bash
curl -H "Origin: https://govsureai.com" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     https://api.govsureai.com/api/v1/auth/login
```

Should return CORS headers if configured correctly.

---

## Security Features Included

### In Caddyfile

✅ **Automatic HTTPS** - Let's Encrypt certificates  
✅ **HTTP → HTTPS redirect** - Automatic  
✅ **HSTS headers** - Enforces HTTPS  
✅ **X-Content-Type-Options** - Prevents MIME sniffing  
✅ **X-Frame-Options** - Prevents clickjacking  
✅ **X-XSS-Protection** - Browser XSS protection  
✅ **Referrer-Policy** - Controls referrer information  
✅ **CORS headers** - Properly configured for subdomain  

### In Vite Config

✅ **No sourcemaps in production** - Hides source code  
✅ **Minification** - Using Terser  
✅ **Code splitting** - Vendor chunks separated  
✅ **Credentials support** - For auth cookies  

---

## Troubleshooting

### DNS Not Resolving
```bash
# Check if DNS has propagated
nslookup govsureai.com

# If not, wait or use hosts file for testing:
echo "YOUR_SERVER_IP govsureai.com" | sudo tee -a /etc/hosts
```

### CORS Errors (Subdomain Setup)
```bash
# Check backend CORS config
docker compose logs backend | grep -i cors

# Verify Caddyfile has CORS headers for api subdomain
docker compose exec caddy cat /etc/caddy/Caddyfile | grep -A 10 "api.govsureai"
```

### 404 Errors
```bash
# Verify files exist
docker compose exec caddy ls -la /usr/share/caddy

# If empty, rebuild:
docker compose down -v
docker compose build --no-cache web
docker compose up -d
```

### SSL Certificate Issues
```bash
# Check Caddy logs
docker compose logs caddy | grep -i certificate

# Verify DNS points to correct IP
# Ensure ports 80 and 443 are open
```

---

## Production Checklist

Before going live:

### DNS Configuration
- [ ] `govsureai.com` A record → server IP
- [ ] `www.govsureai.com` A record → server IP
- [ ] `api.govsureai.com` A record → server IP (if using subdomain)
- [ ] DNS propagated (check with nslookup)

### SSL/HTTPS
- [ ] Ports 80 and 443 open on firewall
- [ ] Caddy obtained SSL certificates
- [ ] HTTPS working for all domains
- [ ] HTTP redirects to HTTPS

### Application
- [ ] Frontend loads at https://govsureai.com
- [ ] No 404 errors
- [ ] Login/signup works
- [ ] API calls succeed
- [ ] No CORS errors in console

### Backend
- [ ] Database connected
- [ ] Redis connected
- [ ] Backend logs show no errors
- [ ] Health endpoint responds
- [ ] CORS configured correctly (if subdomain)

### Security
- [ ] Security headers present (check in browser DevTools)
- [ ] Environment variables set
- [ ] Database passwords changed from defaults
- [ ] SECRET_KEY changed from default
- [ ] Sourcemaps disabled

### Monitoring
- [ ] Can view logs: `docker compose logs -f`
- [ ] All containers running: `docker compose ps`
- [ ] Backups configured

---

## Quick Reference Commands

**View logs:**
```bash
docker compose logs -f caddy      # Caddy logs
docker compose logs -f backend    # Backend logs
docker compose logs -f            # All logs
```

**Check status:**
```bash
docker compose ps                 # Container status
docker compose exec caddy ls -la /usr/share/caddy  # Files
```

**Test endpoints:**
```bash
curl -I https://govsureai.com                      # Frontend
curl https://govsureai.com/api/v1/health          # API (same domain)
curl https://api.govsureai.com/api/v1/health      # API (subdomain)
```

**Rebuild:**
```bash
docker compose down -v
docker compose build --no-cache web
docker compose up -d
```

---

## Next Steps

1. **Configure DNS** - Point your domains to server IP
2. **Choose Architecture** - Run `./switch_architecture.sh` if needed
3. **Deploy** - Run `./deploy_production_fix.sh`
4. **Test** - Verify everything works
5. **Monitor** - Check logs and status
6. **Secure** - Change default passwords
7. **Backup** - Set up database backups

---

## Documentation Files

- 📖 **DOMAIN_SETUP_GUIDE.md** - Comprehensive setup guide
- 📖 **FIX_404_DEPLOYMENT.md** - Troubleshooting 404 errors
- 📖 **PRODUCTION_FIX_COMPLETE.md** - CORS and API fixes
- 📖 **production.env.template** - Environment variables
- 🔧 **switch_architecture.sh** - Architecture switcher
- 🚀 **deploy_production_fix.sh** - Deployment script

---

## Summary

✅ **Vite Config** - Updated for both architectures  
✅ **Caddyfile** - Supports govsureai.com AND api.govsureai.com  
✅ **Docker Compose** - Ready to switch configurations  
✅ **Documentation** - Complete guides created  
✅ **Scripts** - Automated deployment and switching  
✅ **Security** - Headers and HTTPS configured  
✅ **CORS** - Properly handled for subdomain setup  

**Current Configuration:** Same domain (recommended for getting started)  
**Ready to Deploy:** Yes! Run `./deploy_production_fix.sh`  
**Switch Anytime:** Use `./switch_architecture.sh`  

---

**Status:** ✅ **Production Ready**  
**Date:** November 3, 2025  
**Architecture:** Flexible (supports both options)  
**Next:** Configure DNS and deploy! 🚀

