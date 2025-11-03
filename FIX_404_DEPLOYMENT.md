# Fix 404 Error - Caddy Not Serving Files ✅

## Problem Identified

The 404 error was caused by a critical architecture issue:

### The Problem
```yaml
# ❌ BEFORE: Trying to mount ./frontend/dist from HOST
caddy:
  volumes:
    - ./frontend/dist:/usr/share/caddy  # This directory doesn't exist on host!
```

**Why it failed:**
1. The `web` container builds the frontend and stores files in `/usr/share/caddy` **inside the container**
2. The `caddy` container tried to mount `./frontend/dist` from the **host filesystem**
3. But `./frontend/dist` doesn't exist on the host - the files are trapped inside the web container!
4. Result: Caddy serves an empty directory → 404 error

## Solution Implemented

### Use a Shared Docker Volume
```yaml
# ✅ AFTER: Using a shared volume between containers
web:
  volumes:
    - frontend_dist:/usr/share/caddy  # Web container writes here

caddy:
  volumes:
    - frontend_dist:/usr/share/caddy:ro  # Caddy reads from same volume

volumes:
  frontend_dist:  # Shared volume persists between containers
```

### Updated Caddyfile
Also added fallback configuration for when DNS isn't configured:
- `govsureai.com` - Main domain
- `www.govsureai.com` - WWW subdomain
- `:80` - Fallback for IP access

## Files Changed

1. ✅ `/docker-compose.yml`
   - Changed from bind mount to shared volume
   - Added `frontend_dist` volume
   - Web container now properly shares files with Caddy

2. ✅ `/Caddyfile`
   - Added `www.govsureai.com` support
   - Added `:80` fallback for direct IP access
   - Better error handling

## Deployment Instructions

### On Your Production Server

```bash
# 1. Navigate to project directory
cd /path/to/govlogic

# 2. Stop all containers
docker compose down

# 3. Remove old volumes (important!)
docker compose down -v

# 4. Rebuild with new configuration
docker compose build --no-cache web

# 5. Start all services
docker compose up -d

# 6. Check status
docker compose ps

# 7. Check Caddy logs
docker compose logs -f caddy
```

### Quick One-Liner Deploy

```bash
cd /path/to/govlogic && docker compose down -v && docker compose build --no-cache web && docker compose up -d
```

## Verification Steps

### 1. Check Caddy Can See Files
```bash
# This should list your built frontend files (index.html, assets/, etc.)
docker compose exec caddy ls -la /usr/share/caddy
```

Expected output:
```
total 8
drwxr-xr-x    3 root     root          4096 Nov  3 12:00 .
drwxr-xr-x    1 root     root          4096 Nov  3 12:00 ..
drwxr-xr-x    2 root     root          4096 Nov  3 12:00 assets
-rw-r--r--    1 root     root           500 Nov  3 12:00 index.html
-rw-r--r--    1 root     root          1024 Nov  3 12:00 vite.svg
```

### 2. Test Direct Access
```bash
# From your production server:
curl -I http://localhost

# Should return:
# HTTP/1.1 200 OK
```

### 3. Check from Browser
1. Visit `http://your-server-ip`
2. Visit `http://govsureai.com` (if DNS configured)
3. Should see the GovSureAI login page
4. No more 404 errors!

### 4. Check API Proxying
```bash
# Test that API requests are being proxied to backend
curl http://localhost/api/v1/health

# Or from browser DevTools after site loads:
fetch('/api/v1/health').then(r => r.json()).then(console.log)
```

## Troubleshooting

### If Still Getting 404

**1. Verify frontend files exist in volume:**
```bash
docker compose exec caddy ls -la /usr/share/caddy
```

If empty or missing index.html:
```bash
# Rebuild frontend completely
docker compose down -v
docker compose build --no-cache web
docker compose up -d
```

**2. Check Caddy configuration:**
```bash
# Verify Caddyfile is loaded correctly
docker compose exec caddy cat /etc/caddy/Caddyfile

# Check Caddy can validate config
docker compose exec caddy caddy validate --config /etc/caddy/Caddyfile
```

**3. Check Caddy logs for errors:**
```bash
docker compose logs caddy | grep -i error
```

**4. Verify containers are running:**
```bash
docker compose ps

# All should show "Up" status:
# - postgres
# - redis
# - backend
# - celery
# - web
# - caddy
```

### If DNS Issues

If `govsureai.com` doesn't work but `http://server-ip` does:
1. Check DNS A record points to your server IP
2. Wait for DNS propagation (can take 5-60 minutes)
3. Meanwhile, use the IP address directly

To test without DNS:
```bash
# Add to your local /etc/hosts for testing
echo "YOUR_SERVER_IP govsureai.com" | sudo tee -a /etc/hosts
```

## Architecture Flow (After Fix)

```
┌─────────────────────────────────────────────────────────────┐
│ docker-compose up                                            │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 1. Build Stage (web container)                              │
│    - npm run build                                          │
│    - Creates /usr/share/caddy/index.html                    │
│    - Creates /usr/share/caddy/assets/*                      │
│    - Stores in SHARED VOLUME: frontend_dist                 │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. Caddy Container Starts                                   │
│    - Mounts SAME VOLUME: frontend_dist (read-only)          │
│    - Can now see all the built files!                       │
│    - Serves files from /usr/share/caddy                     │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. User Request Flow                                        │
│                                                             │
│  Browser → http://govsureai.com                            │
│      ↓                                                      │
│  Caddy Container (port 80)                                 │
│      ├─→ / or /login → serves index.html from volume       │
│      └─→ /api/* → reverse proxy to backend:8000           │
└─────────────────────────────────────────────────────────────┘
```

## Technical Details

### Why Shared Volumes Work

Docker volumes persist data between container lifecycles:

1. **web** container (build stage):
   - Builds frontend with Vite
   - Copies files to `/usr/share/caddy` (inside container)
   - This path is mounted to volume `frontend_dist`
   - Container can exit, files remain in volume

2. **caddy** container (runtime):
   - Mounts same volume `frontend_dist` at `/usr/share/caddy`
   - Sees all files that web container created
   - Serves them to users
   - Volume is read-only (`:ro`) for security

### Volume vs Bind Mount

**Bind Mount** (what we had before - ❌ didn't work):
```yaml
volumes:
  - ./frontend/dist:/usr/share/caddy  # Mounts HOST path
```
- Requires path to exist on host machine
- Our files were in container, not host
- Result: Empty directory → 404

**Volume** (what we have now - ✅ works):
```yaml
volumes:
  - frontend_dist:/usr/share/caddy  # Docker-managed volume
```
- Docker manages the storage
- Shared between containers
- Persists independently of containers
- Result: Files accessible → Success!

## Success Criteria

✅ Site loads at `http://govsureai.com`  
✅ Site loads at `http://your-server-ip`  
✅ Login page displays correctly  
✅ No 404 errors in browser console  
✅ API calls to `/api/*` work  
✅ Static assets (CSS, JS) load properly  

## Next Steps After This Works

1. **Set up HTTPS**: Caddy handles this automatically!
   ```caddy
   # Caddyfile - just use domain name, Caddy auto-enables HTTPS
   govsureai.com {
     # ... rest of config
   }
   ```

2. **Monitor logs**:
   ```bash
   docker compose logs -f
   ```

3. **Set up backups** for important volumes:
   ```bash
   docker compose exec postgres pg_dump -U GovSure GovSure > backup.sql
   ```

---

**Status**: ✅ Architecture fixed - Shared volumes enable proper file sharing  
**Date**: November 3, 2025  
**Critical Fix**: Changed from bind mount to Docker volume

