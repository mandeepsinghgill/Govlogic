# ⚡ Quick Start - Development with Hot Reload

## The Problem You're Having

**Docker doesn't auto-update changes** - you need to rebuild every time. This is slow and frustrating! 😫

## The Solution

**Run frontend locally with Vite (hot reload) + backend in Docker**

---

## 🚀 Quick Start (2 Commands!)

### Option 1: Use the Start Script (Easiest)

```bash
cd /Users/mandeepgill/Downloads/govlogic

./start-dev-hot-reload.sh
```

**That's it!** Open http://localhost:3000 and start editing files. Changes appear instantly! 🔥

### Option 2: Manual Start (More Control)

**Terminal 1 - Backend:**
```bash
cd /Users/mandeepgill/Downloads/govlogic
docker-compose up -d postgres redis backend celery
```

**Terminal 2 - Frontend:**
```bash
cd /Users/mandeepgill/Downloads/govlogic/frontend
npm run dev
```

**Browser:**
- Visit: http://localhost:3000
- Edit any file in `frontend/src/`
- See changes **instantly** (no rebuild!)

---

## ✨ What You Get

**Before (Docker frontend):**
- Make change → Save
- Wait 30+ seconds for rebuild 🐌
- Refresh browser
- Repeat...

**After (Local Vite):**
- Make change → Save
- Change appears in <100ms! ⚡
- No refresh needed
- **WAY faster!**

---

## 🎯 Now Edit These Files

All of these update **instantly** with hot reload:

### Branding Changes:
- `frontend/src/App.tsx` - Dashboard header logo
- `frontend/src/components/Navigation.tsx` - Nav bar logo
- `frontend/src/pages/Login.tsx` - Login page
- `frontend/src/pages/Landing.tsx` - Landing page

### Styling:
- Any CSS file - instant color/layout changes
- Tailwind classes - instant updates

### New Features:
- Any `.tsx` or `.ts` file in `frontend/src/`

---

## 🛑 To Stop

### Stop Everything:
```bash
# In the Vite terminal: Press Ctrl+C
# Then stop Docker:
docker-compose down
```

### Keep Backend Running (for later):
```bash
# Just stop Vite: Ctrl+C
# Backend stays running in Docker
# Next time: just run `npm run dev` again
```

---

## 🔧 If Something Goes Wrong

### Port 3000 Already in Use

```bash
# Kill whatever's on port 3000
kill -9 $(lsof -ti:3000)

# Then restart
./start-dev-hot-reload.sh
```

### Can't Connect to Backend

```bash
# Check Docker backend is running
docker-compose ps

# Should show backend as "Up"
# If not:
docker-compose up -d backend

# Test it:
curl http://localhost:8000/api/v1/health
```

### Changes Still Not Showing

1. **Hard refresh:** Ctrl+Shift+R (or Cmd+Shift+R)
2. **Check Vite terminal** - any errors?
3. **Restart Vite:**
   ```bash
   # Press Ctrl+C
   npm run dev
   ```

---

## 📊 Ports

- **Frontend (Vite):** http://localhost:3000 ← Use this for development!
- **Backend (Docker):** http://localhost:8000
- **Postgres (Docker):** localhost:5432
- **Redis (Docker):** localhost:6379

---

## 🏭 Production Build (Later)

When you're ready to test production or deploy:

```bash
cd /Users/mandeepgill/Downloads/govlogic

# Stop dev environment
docker-compose down

# Build and start production
docker-compose build --no-cache
docker-compose up -d

# Visit: http://localhost/
```

---

## 💡 Pro Tips

### Keep 2 Terminals Open

**Terminal 1: Backend Logs**
```bash
docker-compose logs -f backend
```

**Terminal 2: Frontend Dev Server**
```bash
npm run dev
```

### VS Code Integration

If using VS Code, add to `.vscode/settings.json`:

```json
{
  "typescript.tsdk": "frontend/node_modules/typescript/lib",
  "editor.formatOnSave": true
}
```

### Browser Extension

Install **React Developer Tools** for better debugging:
- Chrome: https://chrome.google.com/webstore
- Firefox: https://addons.mozilla.org/firefox

---

## ✅ Summary

### Development (Hot Reload):
```bash
./start-dev-hot-reload.sh
# Opens http://localhost:3000
# Changes appear instantly!
```

### Production (Testing):
```bash
docker-compose build && docker-compose up -d
# Opens http://localhost/
# Tests the actual production build
```

**Use hot reload for development, Docker for production!** 🎉

---

## 🆘 Need Help?

**Still having issues? Check:**

1. Is Docker running? `docker-compose ps`
2. Is port 3000 free? `lsof -ti:3000`
3. Dependencies installed? `cd frontend && npm install`
4. Check the logs: `docker-compose logs backend`

**Read the full guide:** `DEV_HOT_RELOAD_SETUP.md`

