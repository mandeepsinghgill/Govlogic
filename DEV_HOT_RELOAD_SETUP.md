# 🔥 Development Setup with Hot Reload

## The Problem

Docker is building the frontend **statically** (like production), so changes require rebuilding. No auto-update!

## The Solution

Run frontend **locally** with Vite dev server (hot reload) + backend in Docker.

---

## Setup (Do This Once)

### Step 1: Keep Backend in Docker

```bash
cd /Users/mandeepgill/Downloads/govlogic

# Start only backend services (no frontend/caddy)
docker-compose up -d postgres redis backend celery
```

**Check it's running:**
```bash
docker-compose ps
# Should show: postgres, redis, backend, celery (all running)
```

### Step 2: Run Frontend Locally

Open a **NEW terminal** and run:

```bash
cd /Users/mandeepgill/Downloads/govlogic/frontend

# Install dependencies (if needed)
npm install

# Start Vite dev server with HOT RELOAD 🔥
npm run dev
```

**You should see:**
```
VITE v7.x.x ready in XXX ms

➜  Local:   http://localhost:3000/
➜  Network: http://192.168.x.x:3000/
```

### Step 3: Open in Browser

Visit: **http://localhost:3000/**

**NOW you have hot reload!** ✨
- Edit any file in `frontend/src/`
- Browser updates **instantly** (no rebuild!)
- Backend API calls go to Docker backend (port 8000)

---

## How It Works

```
Browser (localhost:3000)
    ↓
Vite Dev Server (hot reload)
    ↓
Proxy /api requests → Docker Backend (localhost:8000)
    ↓
Docker: postgres, redis, celery
```

**Benefits:**
- ⚡ **Instant updates** - edit and see changes immediately
- 🔄 **Hot Module Replacement** - no page refresh needed
- 🐛 **Better debugging** - clear error messages
- 🚀 **Faster development** - no Docker rebuild wait

---

## Daily Development Workflow

### Starting Work

**Terminal 1 - Backend (Docker):**
```bash
cd /Users/mandeepgill/Downloads/govlogic
docker-compose up -d postgres redis backend celery
```

**Terminal 2 - Frontend (Local):**
```bash
cd /Users/mandeepgill/Downloads/govlogic/frontend
npm run dev
```

**Browser:**
- Open: http://localhost:3000/
- Edit files in `frontend/src/`
- See changes **instantly**!

### Stopping Work

**Terminal 1:**
```bash
docker-compose down
```

**Terminal 2:**
```bash
# Press Ctrl+C to stop Vite
```

---

## Configuration

The Vite config is already set up for this! (vite.config.ts)

```typescript
export default defineConfig({
  server: {
    port: 3000,
    host: '0.0.0.0',
    // ... CORS and watch settings
    proxy: {
      '/api': {
        target: 'http://localhost:8000', // Docker backend
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
```

**What this does:**
- Vite runs on port **3000** (frontend)
- Docker backend on port **8000** 
- All `/api/*` requests automatically forwarded to backend
- Hot reload works perfectly!

---

## Testing Production Build

When you want to test the production build:

**Terminal 1 - Build & Serve:**
```bash
cd /Users/mandeepgill/Downloads/govlogic/frontend

# Build for production
npm run build

# Serve the built files (for testing)
npx serve dist -p 3000
```

**Or use Docker (full production simulation):**
```bash
cd /Users/mandeepgill/Downloads/govlogic

# Rebuild everything
docker-compose build --no-cache
docker-compose up -d

# Visit: http://localhost/
```

---

## Troubleshooting

### Port 3000 Already in Use

```bash
# Find what's using port 3000
lsof -ti:3000

# Kill it
kill -9 $(lsof -ti:3000)

# Or use a different port in vite.config.ts
```

### Backend Connection Errors

```bash
# Make sure Docker backend is running
docker-compose ps

# Check backend logs
docker-compose logs backend -f

# Test backend directly
curl http://localhost:8000/api/v1/health
```

### Changes Not Showing

1. **Hard refresh:** Ctrl+Shift+R (or Cmd+Shift+R)
2. **Clear cache:** Browser Dev Tools → Network → Disable cache
3. **Restart Vite:**
   ```bash
   # In frontend terminal:
   Ctrl+C
   npm run dev
   ```

### "Module not found" Errors

```bash
cd frontend
rm -rf node_modules
npm install
npm run dev
```

---

## Why Not Docker for Frontend Dev?

**Docker Frontend (Current):**
- ❌ No hot reload
- ❌ Slow rebuilds (30+ seconds)
- ❌ Hard to debug
- ❌ Complex logs

**Local Vite (Recommended):**
- ✅ Instant hot reload (<100ms)
- ✅ Clear error messages
- ✅ Fast refresh
- ✅ Better dev experience

**Use Docker for:**
- ✅ Production builds
- ✅ CI/CD pipelines
- ✅ Final testing before deployment
- ✅ Backend services (always)

---

## Quick Reference

### Start Development

```bash
# Terminal 1 - Backend
cd /Users/mandeepgill/Downloads/govlogic
docker-compose up -d postgres redis backend celery

# Terminal 2 - Frontend  
cd /Users/mandeepgill/Downloads/govlogic/frontend
npm run dev

# Browser
open http://localhost:3000
```

### Build for Production

```bash
cd /Users/mandeepgill/Downloads/govlogic

# Method 1: Full Docker
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# Method 2: Local build only
cd frontend
npm run build
# Files in frontend/dist/
```

### Deploy to Production

```bash
# Your existing process works fine!
# The production docker-compose.yml is already correct
```

---

## 🎉 Now You Have Hot Reload!

**Edit these files and see instant updates:**
- ✅ `frontend/src/App.tsx` - Dashboard layout
- ✅ `frontend/src/pages/*.tsx` - Any page
- ✅ `frontend/src/components/*.tsx` - Components
- ✅ `frontend/src/hooks/*.ts` - Hooks
- ✅ CSS files - Styles update instantly

**Changes appear in ~100ms with NO rebuild!** 🚀

---

## Alternative: Full Docker Dev Setup (Advanced)

If you **must** use Docker for frontend dev:

Create `docker-compose.dev.yml`:

```yaml
services:
  frontend-dev:
    build:
      context: ./frontend
      dockerfile: Dockerfile.dev
    ports:
      - "3000:3000"
    volumes:
      - ./frontend:/app
      - /app/node_modules  # Anonymous volume for node_modules
    environment:
      - VITE_API_URL=http://localhost:8000
    command: npm run dev -- --host 0.0.0.0
```

Then run:
```bash
docker-compose -f docker-compose.dev.yml up
```

**But this is more complex and slower than local Vite!**

---

## Recommendation

**For development:**
- 🎯 **Use local Vite** (npm run dev) - best experience!
- 🐳 Keep backend in Docker

**For production:**
- 🐳 Use full Docker setup (already configured)
- Works perfectly for deployment

This gives you the **best of both worlds**! 🌟

