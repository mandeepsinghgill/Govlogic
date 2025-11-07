# 🚀 GovSure - Local Development Setup

This guide will help you run GovSure on your local machine for development.

## Prerequisites

- Docker and Docker Compose installed
- Node.js 18+ and npm installed
- Git

## Quick Start (Recommended)

### 1. Start Backend Services with Docker

```bash
# From the project root directory
docker-compose -f docker-compose.local.yml up -d
```

This will start:
- PostgreSQL database (port 5432)
- Redis (port 6379)
- FastAPI backend (port 8000)
- Celery worker

### 2. Start Frontend Development Server

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies (first time only)
npm install

# Start development server
npm run dev
```

The frontend will be available at: **http://localhost:3000**

The backend API will be available at: **http://localhost:8000**

## API Documentation

Once the backend is running, you can access:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **Health Check**: http://localhost:8000/health

## Environment Variables

### Backend (.env in project root)

Create a `.env` file in the project root with:

```bash
# Optional - AI API Keys (for AI features)
OPENAI_API_KEY=your-openai-key-here
ANTHROPIC_API_KEY=your-anthropic-key-here

# Optional - External Services
SAM_GOV_API_KEY=your-sam-gov-key
SENDGRID_API_KEY=your-sendgrid-key
STRIPE_SECRET_KEY=your-stripe-key
```

### Frontend (already configured)

The frontend uses Vite proxy to forward API requests to `http://localhost:8000`.

## Stopping the Services

```bash
# Stop all Docker services
docker-compose -f docker-compose.local.yml down

# Stop frontend (Ctrl+C in the terminal where it's running)
```

## Useful Commands

### Backend

```bash
# View backend logs
docker-compose -f docker-compose.local.yml logs -f backend

# Restart backend only
docker-compose -f docker-compose.local.yml restart backend

# Access backend container shell
docker-compose -f docker-compose.local.yml exec backend sh
```

### Frontend

```bash
# Run linting
npm run lint

# Run type checking
npm run type-check

# Build for production
npm run build
```

### Database

```bash
# Access PostgreSQL
docker-compose -f docker-compose.local.yml exec postgres psql -U GovSure -d GovSure

# View database logs
docker-compose -f docker-compose.local.yml logs -f postgres
```

## Troubleshooting

### Issue: Backend won't start

**Solution**: Check if ports are already in use
```bash
# Check if port 8000 is in use
lsof -i :8000

# Kill the process if needed
kill -9 <PID>
```

### Issue: Database connection error

**Solution**: Reset the database
```bash
docker-compose -f docker-compose.local.yml down -v
docker-compose -f docker-compose.local.yml up -d
```

### Issue: Frontend can't connect to backend

**Solution**: Ensure backend is running and accessible
```bash
# Test backend health
curl http://localhost:8000/health

# Should return: {"status":"healthy","app":"GovSure","version":"1.0.0"}
```

### Issue: CORS errors

**Solution**: CORS is now enabled in the backend for local development. If you still see errors:
1. Make sure you're accessing the frontend via `http://localhost:3000`
2. Clear browser cache
3. Check backend logs for CORS-related messages

## Creating Test Users

```bash
# Run the test user creation script
./create_test_users_simple.sh
```

## Project Structure

```
govlogic/
├── backend/              # FastAPI backend
│   ├── app/
│   │   ├── main.py      # Main application
│   │   ├── config.py    # Configuration
│   │   ├── api/         # API routes
│   │   └── models/      # Database models
│   └── requirements.txt
├── frontend/            # React frontend
│   ├── src/
│   │   ├── pages/       # Page components
│   │   ├── components/  # Reusable components
│   │   └── App.tsx      # Main app component
│   └── package.json
├── docker-compose.local.yml  # Local development setup
└── docker-compose.yml        # Production setup with Caddy
```

## Development Tips

1. **Hot Reload**: Both frontend and backend support hot reload
   - Frontend: Vite automatically reloads on file changes
   - Backend: Uvicorn reloads on Python file changes

2. **Database Changes**: If you modify database models, restart the backend to apply migrations

3. **API Testing**: Use the Swagger UI at http://localhost:8000/docs for API testing

4. **Debugging**: 
   - Backend: Check logs with `docker-compose logs -f backend`
   - Frontend: Use browser DevTools (F12)

## Next Steps

1. ✅ Start the services (see Quick Start above)
2. 📝 Create test users with `./create_test_users_simple.sh`
3. 🌐 Open http://localhost:3000 in your browser
4. 🔑 Log in with test credentials
5. 🚀 Start developing!

## Production Deployment

For production deployment with Caddy reverse proxy, use:
```bash
docker-compose up -d
```

This uses the main `docker-compose.yml` file which includes Caddy for SSL/TLS and production optimizations.

---

**Happy coding! 🎉**

For issues or questions, check the logs first, then consult the main documentation.

