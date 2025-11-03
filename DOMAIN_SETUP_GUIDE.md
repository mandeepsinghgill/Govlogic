# Domain Setup Guide - govsureai.com & api.govsureai.com

## Architecture Overview

You have **two architecture options** for your production deployment:

### Option 1: Same Domain with Path-Based Routing (Current Setup) ✅
```
Frontend:    https://govsureai.com
API:         https://govsureai.com/api/*
```

**Pros:**
- No CORS issues (same origin)
- Simpler DNS setup (only one domain)
- Easier SSL certificate management
- Better for SEO (single domain)

**Cons:**
- API and frontend must be on same server
- All traffic goes through one domain

### Option 2: Subdomain Architecture (Recommended for Scale)
```
Frontend:    https://govsureai.com
API:         https://api.govsureai.com
```

**Pros:**
- Backend and frontend can scale independently
- Can deploy API and frontend to different servers
- Better separation of concerns
- More professional architecture

**Cons:**
- Need to configure CORS properly
- Requires DNS configuration for subdomain
- Two SSL certificates (or wildcard cert)

## Current Configuration Status

✅ **Vite Config**: Updated to support both architectures  
✅ **Caddyfile**: Configured for both govsureai.com AND api.govsureai.com  
✅ **Docker Compose**: Ready to switch between options  

## How to Choose Your Setup

### Use Option 1 (Same Domain) If:
- You're just starting out
- Running everything on one server
- Want simplest setup
- Don't need independent scaling

### Use Option 2 (Subdomain) If:
- Planning to scale independently
- Want modern microservices architecture
- Need to separate frontend/backend hosting
- Want more professional setup

---

## Setup Instructions

### Option 1: Same Domain Setup (govsureai.com with /api)

#### 1. DNS Configuration
```
A Record:  govsureai.com     →  YOUR_SERVER_IP
A Record:  www.govsureai.com →  YOUR_SERVER_IP
```

#### 2. Docker Compose Configuration
Edit `/docker-compose.yml`:
```yaml
web:
  build:
    args:
      VITE_API_URL: ""  # Empty string = relative paths
```

#### 3. Deploy
```bash
cd /path/to/govlogic
docker compose down -v
docker compose build --no-cache web
docker compose up -d
```

#### 4. Test
```bash
# Frontend
curl https://govsureai.com

# API
curl https://govsureai.com/api/v1/health
```

**Frontend API calls will use:** `/api/v1/auth/login` (relative path)

---

### Option 2: Subdomain Setup (api.govsureai.com)

#### 1. DNS Configuration
```
A Record:  govsureai.com     →  YOUR_SERVER_IP
A Record:  www.govsureai.com →  YOUR_SERVER_IP
A Record:  api.govsureai.com →  YOUR_SERVER_IP (or different server)
```

#### 2. Docker Compose Configuration
Edit `/docker-compose.yml`:
```yaml
web:
  build:
    args:
      VITE_API_URL: "https://api.govsureai.com"  # Full API URL
```

#### 3. Update Backend CORS
Edit `/backend/app/core/config.py` or wherever CORS is configured:
```python
CORS_ORIGINS = [
    "https://govsureai.com",
    "https://www.govsureai.com",
    "http://localhost:3000",  # For development
]
```

#### 4. Deploy
```bash
cd /path/to/govlogic
docker compose down -v
docker compose build --no-cache web backend
docker compose up -d
```

#### 5. Test
```bash
# Frontend
curl https://govsureai.com

# API (direct)
curl https://api.govsureai.com/api/v1/health

# API (from frontend)
# Will make requests to https://api.govsureai.com/api/v1/*
```

**Frontend API calls will use:** `https://api.govsureai.com/api/v1/auth/login` (absolute URL)

---

## DNS Configuration Details

### For Cloudflare (Recommended)

1. **Add A Records:**
   ```
   Type    Name    Content           Proxy Status    TTL
   A       @       YOUR_SERVER_IP    Proxied        Auto
   A       www     YOUR_SERVER_IP    Proxied        Auto
   A       api     YOUR_SERVER_IP    Proxied        Auto
   ```

2. **SSL/TLS Settings:**
   - SSL/TLS encryption mode: **Full (strict)**
   - Always Use HTTPS: **On**
   - Automatic HTTPS Rewrites: **On**

3. **Firewall Rules** (Optional but recommended):
   ```
   Allow known good bots
   Block common threats
   Rate limiting for API: 100 requests/minute
   ```

### For Other DNS Providers

Add these records:
```
govsureai.com        A    YOUR_SERVER_IP
www.govsureai.com    A    YOUR_SERVER_IP
api.govsureai.com    A    YOUR_SERVER_IP
```

TTL: 300 seconds (5 minutes) for faster updates during setup

---

## SSL Certificate Setup

### Automatic SSL with Caddy (Recommended)

Caddy automatically obtains and renews SSL certificates from Let's Encrypt!

**For Same Domain Setup:**
```caddy
govsureai.com {
  # Caddy handles HTTPS automatically
}
```

**For Subdomain Setup:**
```caddy
govsureai.com {
  # Frontend
}

api.govsureai.com {
  # Backend API
}
```

Caddy will:
1. Request certificates from Let's Encrypt
2. Configure HTTPS automatically
3. Redirect HTTP to HTTPS
4. Auto-renew before expiration

**No additional configuration needed!** 🎉

### Verify SSL
```bash
# Check certificate
curl -vI https://govsureai.com

# Check API certificate (if using subdomain)
curl -vI https://api.govsureai.com
```

---

## Switching Between Architectures

### From Same Domain → Subdomain

1. **Add DNS record** for api.govsureai.com
2. **Update docker-compose.yml:**
   ```yaml
   VITE_API_URL: "https://api.govsureai.com"
   ```
3. **Update backend CORS** to allow govsureai.com
4. **Rebuild and deploy:**
   ```bash
   docker compose down -v
   docker compose build --no-cache web backend
   docker compose up -d
   ```

### From Subdomain → Same Domain

1. **Update docker-compose.yml:**
   ```yaml
   VITE_API_URL: ""
   ```
2. **Rebuild and deploy:**
   ```bash
   docker compose down -v
   docker compose build --no-cache web
   docker compose up -d
   ```

---

## Backend CORS Configuration

### For Same Domain Setup
```python
# backend/app/core/config.py
CORS_ORIGINS = [
    "https://govsureai.com",
    "https://www.govsureai.com",
    "http://localhost:3000",  # Development
]
```

### For Subdomain Setup
```python
# backend/app/core/config.py
CORS_ORIGINS = [
    "https://govsureai.com",
    "https://www.govsureai.com",
    "http://localhost:3000",  # Development
]

# Allow credentials for cross-origin requests
CORS_ALLOW_CREDENTIALS = True
```

The Caddyfile already includes proper CORS headers for the subdomain setup!

---

## Testing Your Setup

### 1. Test DNS Resolution
```bash
# Should return your server IP
nslookup govsureai.com
nslookup www.govsureai.com
nslookup api.govsureai.com  # If using subdomain
```

### 2. Test HTTPS
```bash
# Should return 200 OK with valid certificate
curl -I https://govsureai.com
```

### 3. Test API Endpoint
```bash
# Same domain setup:
curl https://govsureai.com/api/v1/health

# Subdomain setup:
curl https://api.govsureai.com/api/v1/health
```

### 4. Test from Browser
1. Open https://govsureai.com
2. Open DevTools (F12) → Network tab
3. Try logging in
4. Check where API requests are going:
   - Same domain: `/api/v1/auth/login`
   - Subdomain: `https://api.govsureai.com/api/v1/auth/login`

### 5. Test CORS (for subdomain setup)
```bash
curl -H "Origin: https://govsureai.com" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     https://api.govsureai.com/api/v1/auth/login

# Should return CORS headers
```

---

## Troubleshooting

### Issue: CORS Errors (Subdomain Setup)

**Symptoms:** Console shows "blocked by CORS policy"

**Fix:**
1. Verify backend CORS origins include your frontend domain
2. Check Caddyfile has proper CORS headers for api.govsureai.com
3. Ensure credentials are allowed if using cookies/auth

**Test:**
```bash
docker compose logs backend | grep -i cors
```

### Issue: 404 Not Found

**Symptoms:** Site shows 404 error

**Fix:**
1. Check files exist in Caddy:
   ```bash
   docker compose exec caddy ls -la /usr/share/caddy
   ```
2. Verify Caddyfile:
   ```bash
   docker compose exec caddy cat /etc/caddy/Caddyfile
   ```
3. Rebuild if needed:
   ```bash
   docker compose down -v
   docker compose build --no-cache web
   docker compose up -d
   ```

### Issue: API Not Working

**Symptoms:** API calls fail or timeout

**Fix:**
1. Check backend is running:
   ```bash
   docker compose ps backend
   ```
2. Test backend directly:
   ```bash
   docker compose exec backend curl localhost:8000/api/v1/health
   ```
3. Check backend logs:
   ```bash
   docker compose logs backend
   ```

### Issue: SSL Certificate Errors

**Symptoms:** "Your connection is not private" in browser

**Fix:**
1. Wait for Caddy to obtain certificate (can take 1-2 minutes)
2. Check Caddy logs:
   ```bash
   docker compose logs caddy | grep -i certificate
   ```
3. Verify DNS is pointing to correct IP
4. Ensure ports 80 and 443 are open on firewall

---

## Production Checklist

Before going live:

- [ ] DNS records configured and propagated
- [ ] SSL certificates obtained and valid
- [ ] Frontend loads at https://govsureai.com
- [ ] API accessible (via /api or subdomain)
- [ ] Login/signup works
- [ ] No CORS errors in console
- [ ] All API calls succeed
- [ ] Backend logs show no errors
- [ ] Database connected properly
- [ ] Environment variables set correctly
- [ ] Firewall rules configured
- [ ] Backups configured

---

## Recommended Setup

For most production deployments, we recommend:

1. **Start with Option 1** (same domain)
   - Simpler setup
   - Faster to deploy
   - No CORS issues

2. **Later migrate to Option 2** (subdomain) when:
   - You need independent scaling
   - You want to separate services
   - You're ready for microservices architecture

---

## Files Reference

- `/frontend/vite.config.ts` - Development proxy configuration
- `/docker-compose.yml` - Production build configuration (VITE_API_URL)
- `/Caddyfile` - Reverse proxy and SSL configuration
- `/backend/app/core/config.py` - CORS and API configuration

---

## Quick Deploy Commands

**Same Domain Setup:**
```bash
cd /path/to/govlogic
sed -i 's|VITE_API_URL: ".*"|VITE_API_URL: ""|' docker-compose.yml
docker compose down -v && docker compose build --no-cache web && docker compose up -d
```

**Subdomain Setup:**
```bash
cd /path/to/govlogic
sed -i 's|VITE_API_URL: ".*"|VITE_API_URL: "https://api.govsureai.com"|' docker-compose.yml
docker compose down -v && docker compose build --no-cache web backend && docker compose up -d
```

---

**Current Status:** ✅ Ready for either architecture  
**Recommendation:** Start with same domain, migrate to subdomain later  
**Next Step:** Configure DNS and deploy!

