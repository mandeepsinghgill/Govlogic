# GovLogic GovConAI Application Deployment Guide

This document outlines the steps required to deploy the GovLogic GovConAI full-stack application. The application consists of a Python/FastAPI backend and a React/Vite frontend, utilizing PostgreSQL for the database and Redis for caching and task queuing.

## 1. Overview

The GovLogic GovConAI application provides tools for government contractors, including an AI-powered chat assistant, opportunity tracking, proposal management, and award tracking. It integrates with various external services for enhanced functionality.

### Components:

*   **Backend**: Python 3.11, FastAPI, SQLAlchemy, PostgreSQL, Redis, Celery.
*   **Frontend**: React, TypeScript, Vite, npm.
*   **External Services**: OpenAI (for AI chat), Anthropic (alternative AI), SendGrid (email), Stripe (payments), SAM.gov (opportunity data).

## 2. Pre-Deployment Checklist

Before deployment, ensure the following:

- [x] All environment variables configured
- [x] Database migrations run
- [ ] API keys obtained (OpenAI, Anthropic, etc.) - **Note**: OpenAI API key currently has insufficient credits.
- [ ] SSL/TLS certificates obtained
- [ ] Backup strategy implemented
- [ ] Monitoring setup complete
- [ ] Security audit completed
- [ ] Load testing performed
- [ ] Disaster recovery plan created

## 3. Environment Variables Configuration

Environment variables are crucial for configuring the application, especially for sensitive information like API keys and database credentials. Create a `.env` file in the root directory of the `app_project` (e.g., `/home/ubuntu/app_project/.env`) with the following structure:

```dotenv
# Database
DATABASE_URL="postgresql://govlogic:govlogic@localhost:5432/govlogic_db"

# Redis
REDIS_URL=redis://localhost:6379/0
CELERY_BROKER_URL=redis://localhost:6379/0
CELERY_RESULT_BACKEND=redis://localhost:6379/0

# Security
SECRET_KEY=your-secret-key-change-in-production-use-openssl-rand-hex-32
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# AI/LLM - Add your API keys here
OPENAI_API_KEY="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" # Updated with provided key
ANTHROPIC_API_KEY="your_anthropic_api_key_here"
DEFAULT_LLM_PROVIDER=openai
DEFAULT_LLM_MODEL=gemini-2.5-flash

# Feature Flags
GRANTS_MODE=true
VOICE_MODE=false
LOCAL_LLM=false
FEDRAMP=false
DEBUG=false # Set to false for production

# External Services (Optional)
SAM_GOV_API_KEY=
SENDGRID_API_KEY="your_sendgrid_api_key_here"
STRIPE_PUBLIC_KEY=
STRIPE_SECRET_KEY="your_stripe_secret_key_here"
STRIPE_WEBHOOK_SECRET="your_stripe_webhook_secret_here"
DOCUSIGN_INTEGRATION_KEY=

# File Storage
UPLOAD_DIR=/tmp/govlogic/uploads
MAX_UPLOAD_SIZE=52428800

# CORS
CORS_ORIGINS=["http://localhost:3000","http://localhost:5173", "https://your-frontend-domain.com"]
```

**Important**: Replace placeholder values (e.g., `your_anthropic_api_key_here`, `your-secret-key-change-in-production-use-openssl-rand-hex-32`, `https://your-frontend-domain.com`) with your actual production values. For `SECRET_KEY`, generate a strong, random key.

## 4. Database Setup (PostgreSQL)

1.  **Install PostgreSQL**: If not already installed, follow the official PostgreSQL documentation for your operating system.
2.  **Create User and Database**: Access your PostgreSQL server and create a dedicated user and database for the application:

    ```bash
    sudo -u postgres psql
    CREATE USER govlogic WITH PASSWORD 'govlogic';
    CREATE DATABASE govlogic_db OWNER govlogic;
    \q
    ```

    **Note**: For production, use a strong, unique password for the `govlogic` user.

3.  **Run Migrations**: The backend uses Alembic for database migrations. Navigate to the backend directory and apply migrations:

    ```bash
    cd /home/ubuntu/app_project/backend
    pip install -r requirements.txt
    alembic upgrade head
    ```

## 5. Backend Deployment

1.  **Install Dependencies**: Navigate to the backend directory and install Python dependencies:

    ```bash
    cd /home/ubuntu/app_project/backend
    pip install -r requirements.txt
    ```

2.  **Start the Backend Server**: For production, use a process manager like Gunicorn with Uvicorn workers, or deploy with Docker Compose.

    **Using Uvicorn (for testing/development)**:

    ```bash
    uvicorn app.main:app --host 0.0.0.0 --port 8000
    ```

    **Using Gunicorn (recommended for production)**:

    ```bash
    gunicorn -w 4 -k uvicorn.workers.UvicornWorker app.main:app --bind 0.0.0.0:8000
    ```

    **Note**: Adjust `-w 4` (number of workers) based on your server's CPU cores.

## 6. Frontend Deployment

1.  **Install Dependencies**: Navigate to the frontend directory and install Node.js dependencies:

    ```bash
    cd /home/ubuntu/app_project/frontend
    npm install
    ```

2.  **Build for Production**: Create a production-ready build of the frontend application:

    ```bash
    npm run build
    ```

    This will create a `dist` directory containing the static assets. These assets can be served by any static file server (e.g., Nginx, Apache, or a cloud storage service like AWS S3).

3.  **Configure API Endpoint**: Ensure your frontend is configured to communicate with your deployed backend API. In `/home/ubuntu/app_project/frontend/.env`, set `VITE_API_URL` to your backend's public URL (e.g., `https://api.your-backend-domain.com`).

    ```dotenv
    VITE_API_URL="https://api.your-backend-domain.com"
    ```

## 7. Celery Worker (Optional, for background tasks)

If your application uses background tasks (e.g., for long-running AI processes), you'll need to run a Celery worker.

1.  **Start Celery Worker**: From the backend directory:

    ```bash
    cd /home/ubuntu/app_project/backend
    celery -A app.celery_app worker --loglevel=info
    ```

    For production, use a process manager (e.g., Supervisor, Systemd) to ensure the Celery worker runs reliably.

## 8. Nginx Configuration (Example)

For serving the frontend and proxying requests to the backend, Nginx is a common choice. Below is a basic example configuration. Replace `your-frontend-domain.com` and `api.your-backend-domain.com` with your actual domain names.

```nginx
server {
    listen 80;
    server_name your-frontend-domain.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name your-frontend-domain.com;

    ssl_certificate /etc/nginx/ssl/your-frontend-domain.com.crt;
    ssl_certificate_key /etc/nginx/ssl/your-frontend-domain.com.key;

    root /home/ubuntu/app_project/frontend/dist; # Path to your frontend build directory
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}

server {
    listen 443 ssl;
    server_name api.your-backend-domain.com;

    ssl_certificate /etc/nginx/ssl/api.your-backend-domain.com.crt;
    ssl_certificate_key /etc/nginx/ssl/api.your-backend-domain.com.key;

    location / {
        proxy_pass http://localhost:8000; # Or your backend's internal IP/port
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**Note**: Obtain SSL certificates (e.g., using Certbot with Let's Encrypt) for HTTPS.

## 9. Docker Compose Deployment (Recommended)

For a more streamlined deployment, especially in production, Docker Compose can manage all services (PostgreSQL, Redis, Backend, Frontend, Celery).

Create a `docker-compose.yml` file in the root of your `app_project` directory:

```yaml
version: '3.8'

services:
  db:
    image: postgres:14-alpine
    restart: always
    environment:
      POSTGRES_DB: govlogic_db
      POSTGRES_USER: govlogic
      POSTGRES_PASSWORD: govlogic
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:6-alpine
    restart: always
    ports:
      - "6379:6379"

  backend:
    build: ./backend
    command: gunicorn -w 4 -k uvicorn.workers.UvicornWorker app.main:app --bind 0.0.0.0:8000
    volumes:
      - ./backend:/app
    ports:
      - "8000:8000"
    environment:
      DATABASE_URL: postgresql://govlogic:govlogic@db:5432/govlogic_db
      REDIS_URL: redis://redis:6379/0
      CELERY_BROKER_URL: redis://redis:6379/0
      CELERY_RESULT_BACKEND: redis://redis:6379/0
      SECRET_KEY: ${SECRET_KEY}
      OPENAI_API_KEY: ${OPENAI_API_KEY}
      ANTHROPIC_API_KEY: ${ANTHROPIC_API_KEY}
      SENDGRID_API_KEY: ${SENDGRID_API_KEY}
      STRIPE_SECRET_KEY: ${STRIPE_SECRET_KEY}
      STRIPE_WEBHOOK_SECRET: ${STRIPE_WEBHOOK_SECRET}
      DEFAULT_LLM_PROVIDER: openai
      DEFAULT_LLM_MODEL: gemini-2.5-flash
      GRANTS_MODE: true
      VOICE_MODE: false
      LOCAL_LLM: false
      FEDRAMP: false
      DEBUG: false
      CORS_ORIGINS: "https://your-frontend-domain.com"
    depends_on:
      - db
      - redis

  frontend:
    build: ./frontend
    command: npm run start-prod # A custom script to serve the built frontend, e.g., with 'serve -s dist'
    volumes:
      - ./frontend:/app
    ports:
      - "80:80"
    environment:
      VITE_API_URL: https://api.your-backend-domain.com
    depends_on:
      - backend

  celery_worker:
    build: ./backend
    command: celery -A app.celery_app worker --loglevel=info
    volumes:
      - ./backend:/app
    environment:
      DATABASE_URL: postgresql://govlogic:govlogic@db:5432/govlogic_db
      REDIS_URL: redis://redis:6379/0
      CELERY_BROKER_URL: redis://redis:6379/0
      CELERY_RESULT_BACKEND: redis://redis:6379/0
      SECRET_KEY: ${SECRET_KEY}
      OPENAI_API_KEY: ${OPENAI_API_KEY}
      ANTHROPIC_API_KEY: ${ANTHROPIC_API_KEY}
      SENDGRID_API_KEY: ${SENDGRID_API_KEY}
      STRIPE_SECRET_KEY: ${STRIPE_SECRET_KEY}
      STRIPE_WEBHOOK_SECRET: ${STRIPE_WEBHOOK_SECRET}
      DEFAULT_LLM_PROVIDER: openai
      DEFAULT_LLM_MODEL: gemini-2.5-flash
      GRANTS_MODE: true
      VOICE_MODE: false
      LOCAL_LLM: false
      FEDRAMP: false
      DEBUG: false
      CORS_ORIGINS: "https://your-frontend-domain.com"
    depends_on:
      - db
      - redis
      - backend

volumes:
  postgres_data:
```

**Note**: Create a `.env` file in the same directory as `docker-compose.yml` to store sensitive environment variables (e.g., `SECRET_KEY`, `OPENAI_API_KEY`).

To build and run with Docker Compose:

```bash
docker-compose build
docker-compose up -d
```

## 10. Post-Deployment Steps

*   **Monitor Logs**: Regularly check logs for both frontend and backend services for any errors or warnings.
*   **Security Audit**: Conduct regular security audits, especially for API keys and sensitive data handling.
*   **Backup Strategy**: Implement a robust database backup and restore strategy.
*   **Scalability**: For high-traffic applications, consider deploying services to a Kubernetes cluster or similar orchestration platform.

## 11. Known Issues / Limitations

*   **OpenAI API Credits**: The AI chat functionality relies on the OpenAI API. Ensure your `OPENAI_API_KEY` has sufficient credits. During testing, an `Insufficient credits` error was encountered, preventing full verification of AI features. This will need to be addressed with a valid, funded API key for full functionality.

## 12. Monitoring & Logging

### Prometheus + Grafana

```bash
# Add Prometheus to docker-compose.yml
services:
  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml

  grafana:
    image: grafana/grafana:latest
    ports:
      - "3001:3000"
```

### ELK Stack

```bash
# Deploy Elasticsearch, Logstash, Kibana
docker-compose -f docker-compose.elk.yml up -d

# Configure application logging
# Send logs to Logstash
```

### Sentry Error Tracking

```python
# In main.py
import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration

sentry_sdk.init(
    dsn="https://<key>@sentry.io/<project>",
    integrations=[FastApiIntegration()],
    traces_sample_rate=1.0
)
```

## 13. Scaling

### Horizontal Scaling

```bash
# Increase replicas in Kubernetes
kubectl scale deployment govlogic-backend --replicas=5

# Or in docker-compose
docker-compose up -d --scale backend=3
```

### Database Scaling

```bash
# Enable read replicas
# Configure connection pooling
# Implement caching layer (Redis)
```

### Load Balancing

```bash
# Use Nginx, HAProxy, or cloud provider's load balancer
# Configure sticky sessions for WebSocket connections
```

## 14. Backup & Disaster Recovery

```bash
# Database backups
pg_dump govlogic > backup.sql

# Automated backups
# - AWS RDS automated backups
# - Google Cloud SQL backups
# - Azure Database backups

# Test restore procedures
# Document recovery time objectives (RTO)
# Document recovery point objectives (RPO)
```

## 15. Maintenance

### Updates

```bash
# Update dependencies
pip install --upgrade -r requirements.txt
npm update

# Test updates in staging
# Deploy to production during maintenance window
```

### Monitoring Health

```bash
# Check application health
curl https://api.govlogic.com/health

# Monitor logs
tail -f /var/log/govlogic/app.log

# Check database
psql govlogic -c "SELECT version();"
```

---

**Author**: Manus AI
**Date**: October 18, 2025 EDT

