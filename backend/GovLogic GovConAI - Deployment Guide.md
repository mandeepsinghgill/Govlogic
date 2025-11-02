# GovLogic GovConAI - Deployment Guide

## Quick Start (Local Development)

### Option 1: Docker Compose (Recommended)

```bash
# 1. Set environment variables
cp backend/.env.example backend/.env
# Edit backend/.env and add your API keys

# 2. Start all services
docker-compose up -d

# 3. Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

### Option 2: Manual Setup

#### Backend

```bash
cd backend

# Install Python 3.12
python3.12 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start PostgreSQL (with pgvector)
# Option A: Docker
docker run -d --name GovSure-postgres \
  -e POSTGRES_USER=GovSure \
  -e POSTGRES_PASSWORD=GovSure \
  -e POSTGRES_DB=GovSure \
  -p 5432:5432 \
  ankane/pgvector:latest

# Option B: Local PostgreSQL
# Install pgvector extension
# CREATE EXTENSION vector;

# Start Redis
docker run -d --name GovSure-redis -p 6379:6379 redis:7-alpine

# Configure environment
cp .env.example .env
# Edit .env with your settings

# Run database migrations
alembic upgrade head

# Start backend server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# In another terminal, start Celery worker
celery -A app.celery_app worker --loglevel=info
```

#### Frontend

```bash
cd frontend

# Install dependencies
pnpm install

# Start development server
pnpm run dev

# Access at http://localhost:5173
```

## Production Deployment

### Prerequisites

- Kubernetes cluster (GKE, EKS, AKS, or on-prem)
- kubectl configured
- Helm 3.x installed
- Domain name with DNS configured
- SSL/TLS certificates

### 1. Database Setup

```bash
# Option A: Managed PostgreSQL (Recommended)
# - AWS RDS PostgreSQL with pgvector
# - Google Cloud SQL for PostgreSQL
# - Azure Database for PostgreSQL

# Option B: Self-hosted
# Deploy PostgreSQL with pgvector using Helm
helm repo add bitnami https://charts.bitnami.com/bitnami
helm install GovSure-postgres bitnami/postgresql \
  --set auth.username=GovSure \
  --set auth.password=<strong-password> \
  --set auth.database=GovSure \
  --set primary.persistence.size=100Gi

# Install pgvector extension
kubectl exec -it GovSure-postgres-0 -- psql -U GovSure -d GovSure -c "CREATE EXTENSION vector;"
```

### 2. Redis Setup

```bash
# Option A: Managed Redis (Recommended)
# - AWS ElastiCache
# - Google Cloud Memorystore
# - Azure Cache for Redis
# - Upstash Redis (serverless)

# Option B: Self-hosted
helm install GovSure-redis bitnami/redis \
  --set auth.password=<strong-password> \
  --set master.persistence.size=20Gi
```

### 3. Backend Deployment

```bash
# Build Docker image
cd backend
docker build -t GovSure/backend:latest -f ../docker/Dockerfile.backend .

# Push to registry
docker tag GovSure/backend:latest <your-registry>/GovSure/backend:latest
docker push <your-registry>/GovSure/backend:latest

# Create Kubernetes secrets
kubectl create secret generic GovSure-secrets \
  --from-literal=database-url=postgresql://user:pass@host:5432/GovSure \
  --from-literal=redis-url=redis://:pass@host:6379/0 \
  --from-literal=secret-key=$(openssl rand -hex 32) \
  --from-literal=openai-api-key=<your-key> \
  --from-literal=anthropic-api-key=<your-key>

# Deploy backend
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/backend-service.yaml

# Deploy Celery worker
kubectl apply -f k8s/celery-deployment.yaml
```

### 4. Frontend Deployment

```bash
# Build production bundle
cd frontend
pnpm run build

# Build Docker image
docker build -t GovSure/frontend:latest -f ../docker/Dockerfile.frontend .

# Push to registry
docker push <your-registry>/GovSure/frontend:latest

# Deploy frontend
kubectl apply -f k8s/frontend-deployment.yaml
kubectl apply -f k8s/frontend-service.yaml
```

### 5. Ingress & SSL

```bash
# Install nginx-ingress controller
helm install nginx-ingress ingress-nginx/ingress-nginx

# Install cert-manager for SSL
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml

# Create ClusterIssuer for Let's Encrypt
kubectl apply -f k8s/cert-issuer.yaml

# Deploy ingress
kubectl apply -f k8s/ingress.yaml
```

### 6. Monitoring & Logging

```bash
# Prometheus & Grafana
helm install prometheus prometheus-community/kube-prometheus-stack

# ELK Stack for logging
helm install elasticsearch elastic/elasticsearch
helm install kibana elastic/kibana
helm install filebeat elastic/filebeat
```

## Environment Variables

### Backend (.env)

```bash
# Required
DATABASE_URL=postgresql://user:pass@host:5432/GovSure
REDIS_URL=redis://:pass@host:6379/0
SECRET_KEY=<generated-with-openssl-rand-hex-32>
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# Optional
SENDGRID_API_KEY=SG...
STRIPE_SECRET_KEY=sk_live_...
SAM_GOV_API_KEY=...
DOCUSIGN_INTEGRATION_KEY=...

# Feature Flags
GRANTS_MODE=true
FEDRAMP=true
DEBUG=false
```

### Frontend (.env)

```bash
REACT_APP_API_URL=https://api.GovSure.ai
REACT_APP_WS_URL=wss://api.GovSure.ai
```

## Scaling

### Horizontal Pod Autoscaling

```yaml
# backend-hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: GovSure-backend
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: GovSure-backend
  minReplicas: 3
  maxReplicas: 20
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

### Celery Worker Scaling

```bash
# Scale based on queue length
kubectl autoscale deployment GovSure-celery \
  --min=2 --max=10 \
  --cpu-percent=80
```

## Backup & Disaster Recovery

### Database Backups

```bash
# Automated daily backups
kubectl create cronjob GovSure-backup \
  --image=postgres:14 \
  --schedule="0 2 * * *" \
  -- pg_dump -h postgres-host -U GovSure GovSure > /backups/$(date +%Y%m%d).sql
```

### Redis Backups

```bash
# Enable AOF persistence
# Configure in redis.conf:
appendonly yes
appendfsync everysec
```

## Security Checklist

- [ ] Change all default passwords
- [ ] Use strong SECRET_KEY (32+ random bytes)
- [ ] Enable HTTPS/TLS everywhere
- [ ] Configure firewall rules (allow only 80/443)
- [ ] Enable database encryption at rest
- [ ] Set up VPN for database access
- [ ] Enable audit logging
- [ ] Configure rate limiting
- [ ] Set up WAF (Web Application Firewall)
- [ ] Enable CORS only for trusted domains
- [ ] Implement IP whitelisting for admin
- [ ] Regular security updates
- [ ] Penetration testing

## Performance Optimization

### Database

```sql
-- Create indexes
CREATE INDEX idx_opportunities_stage ON opportunities(stage);
CREATE INDEX idx_opportunities_pwin ON opportunities(pwin_score);
CREATE INDEX idx_proposals_status ON proposals(status);
CREATE INDEX idx_proposals_org ON proposals(organization_id);

-- Enable query caching
ALTER SYSTEM SET shared_buffers = '4GB';
ALTER SYSTEM SET effective_cache_size = '12GB';
```

### Redis Caching

```python
# Cache frequently accessed data
# - Opportunity lists
# - Proposal templates
# - Knowledge base documents
# - User sessions
```

### CDN

```bash
# Use CloudFront, Cloudflare, or Fastly for:
# - Frontend static assets
# - Document downloads
# - API responses (with cache headers)
```

## Monitoring

### Key Metrics

- **API Response Time** - Target: <200ms p95
- **Proposal Generation Time** - Target: <5 minutes
- **Database Query Time** - Target: <50ms p95
- **Error Rate** - Target: <0.1%
- **Uptime** - Target: 99.9%

### Alerts

```yaml
# Prometheus alerts
- alert: HighErrorRate
  expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
  
- alert: SlowAPIResponse
  expr: histogram_quantile(0.95, http_request_duration_seconds) > 0.5
  
- alert: HighMemoryUsage
  expr: container_memory_usage_bytes / container_spec_memory_limit_bytes > 0.9
```

## Troubleshooting

### Backend won't start

```bash
# Check logs
kubectl logs -f deployment/GovSure-backend

# Common issues:
# 1. Database connection failed - check DATABASE_URL
# 2. Missing migrations - run: alembic upgrade head
# 3. Missing dependencies - rebuild Docker image
```

### Celery tasks not processing

```bash
# Check Celery worker logs
kubectl logs -f deployment/GovSure-celery

# Check Redis connection
redis-cli -h <redis-host> ping

# Restart workers
kubectl rollout restart deployment/GovSure-celery
```

### Frontend 404 errors

```bash
# Ensure API_URL is correct
# Check CORS settings in backend
# Verify ingress routing
kubectl describe ingress GovSure-ingress
```

## Cost Optimization

### AWS Example

- **Compute:** EKS with t3.medium nodes (3-10 nodes) - $150-500/mo
- **Database:** RDS PostgreSQL db.t3.large - $200/mo
- **Redis:** ElastiCache t3.small - $50/mo
- **Storage:** EBS + S3 - $100/mo
- **Total:** ~$500-850/mo for small deployment

### Savings Tips

- Use spot instances for Celery workers
- Enable database auto-scaling
- Use S3 lifecycle policies for old documents
- Implement aggressive caching
- Use CloudFront for static assets

## Support

For deployment assistance:
- Email: devops@GovSure.ai
- Slack: #GovSure-deployment
- Documentation: https://docs.GovSure.ai/deployment

