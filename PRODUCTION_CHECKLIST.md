# GovLogic GovConAI - Production Deployment Checklist

## Pre-Deployment Phase

### Configuration
- [ ] Copy `.env.example` to `.env`
- [ ] Set `DEBUG=false` in production
- [ ] Generate secure `SECRET_KEY` using: `python -c "import secrets; print(secrets.token_urlsafe(32))"`
- [ ] Configure database URL with production database
- [ ] Configure Redis URL with production Redis instance
- [ ] Set all required API keys:
  - [ ] OPENAI_API_KEY
  - [ ] ANTHROPIC_API_KEY (if using Claude)
  - [ ] SAM_GOV_API_KEY (if using SAM.gov integration)
  - [ ] SENDGRID_API_KEY (if using email notifications)
  - [ ] STRIPE_PUBLIC_KEY and STRIPE_SECRET_KEY (if using payments)

### Security
- [ ] Enable HTTPS/TLS
- [ ] Configure CORS_ORIGINS with production domain only
- [ ] Set up firewall rules
- [ ] Enable rate limiting
- [ ] Configure CSRF protection
- [ ] Set up Web Application Firewall (WAF)
- [ ] Enable security headers (HSTS, X-Frame-Options, etc.)
- [ ] Review and update ALLOWED_HOSTS

### Database
- [ ] Create production PostgreSQL database
- [ ] Enable SSL connections to database
- [ ] Create database user with limited permissions
- [ ] Run migrations: `alembic upgrade head`
- [ ] Seed initial data (organizations, users)
- [ ] Enable automated backups
- [ ] Test backup restoration
- [ ] Set up replication (optional)

### Infrastructure
- [ ] Set up production servers/containers
- [ ] Configure load balancer
- [ ] Set up reverse proxy (Nginx/Apache)
- [ ] Configure SSL certificates (Let's Encrypt or paid)
- [ ] Set up CDN for static assets
- [ ] Configure DNS records
- [ ] Set up monitoring and alerting
- [ ] Set up logging infrastructure

### Monitoring & Logging
- [ ] Set up Prometheus for metrics
- [ ] Set up Grafana for dashboards
- [ ] Set up ELK stack or equivalent for logs
- [ ] Set up Sentry for error tracking
- [ ] Configure log retention policies
- [ ] Set up alerting rules
- [ ] Test alert notifications

### Testing
- [ ] Run full test suite
- [ ] Perform load testing
- [ ] Perform security testing
- [ ] Test database failover
- [ ] Test backup restoration
- [ ] Test API endpoints
- [ ] Test frontend functionality
- [ ] Test email notifications
- [ ] Test payment processing (if applicable)

## Deployment Phase

### Pre-Deployment
- [ ] Create backup of existing production (if upgrading)
- [ ] Notify stakeholders of deployment window
- [ ] Prepare rollback plan
- [ ] Have on-call support ready

### Docker Compose Deployment
```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# Run migrations
docker-compose exec backend alembic upgrade head

# Check health
docker-compose exec backend curl http://localhost:8000/health
```

### Kubernetes Deployment
```bash
# Create namespace
kubectl create namespace govlogic

# Create secrets
kubectl create secret generic govlogic-secrets \
  --from-literal=openai-api-key=<key> \
  --from-literal=secret-key=<key> \
  -n govlogic

# Deploy
kubectl apply -f k8s/backend-deployment.yaml -n govlogic
kubectl apply -f k8s/frontend-deployment.yaml -n govlogic
kubectl apply -f k8s/services.yaml -n govlogic

# Check deployment
kubectl get pods -n govlogic
```

### Verification
- [ ] Check application health: `curl https://api.govlogic.com/health`
- [ ] Test login functionality
- [ ] Test core features (opportunities, proposals, etc.)
- [ ] Check logs for errors
- [ ] Monitor CPU and memory usage
- [ ] Test API endpoints
- [ ] Test frontend functionality
- [ ] Verify database connectivity
- [ ] Verify Redis connectivity

## Post-Deployment Phase

### Monitoring
- [ ] Monitor application logs
- [ ] Monitor system metrics (CPU, memory, disk)
- [ ] Monitor database performance
- [ ] Monitor API response times
- [ ] Monitor error rates
- [ ] Monitor user activity

### Optimization
- [ ] Optimize database queries
- [ ] Configure caching
- [ ] Optimize static asset delivery
- [ ] Monitor and optimize costs

### Documentation
- [ ] Document deployment procedures
- [ ] Document rollback procedures
- [ ] Document troubleshooting steps
- [ ] Update runbooks
- [ ] Document access procedures

### Maintenance
- [ ] Set up automated backups
- [ ] Set up automated security updates
- [ ] Set up automated dependency updates
- [ ] Schedule regular security audits
- [ ] Schedule regular performance reviews

## Ongoing Operations

### Daily
- [ ] Check application health
- [ ] Review error logs
- [ ] Monitor system metrics
- [ ] Respond to alerts

### Weekly
- [ ] Review performance metrics
- [ ] Check backup status
- [ ] Review security logs
- [ ] Update documentation

### Monthly
- [ ] Security audit
- [ ] Performance optimization review
- [ ] Capacity planning review
- [ ] Cost optimization review

### Quarterly
- [ ] Full security assessment
- [ ] Disaster recovery drill
- [ ] Upgrade dependencies
- [ ] Review and update runbooks

## Rollback Procedure

If deployment fails:

1. **Immediate Actions**
   - [ ] Stop new deployments
   - [ ] Notify stakeholders
   - [ ] Activate incident response team

2. **Rollback Steps**
   ```bash
   # Docker Compose
   docker-compose down
   docker-compose up -d  # With previous version

   # Kubernetes
   kubectl rollout undo deployment/govlogic-backend -n govlogic
   kubectl rollout undo deployment/govlogic-frontend -n govlogic
   ```

3. **Verification**
   - [ ] Verify application is running
   - [ ] Verify data integrity
   - [ ] Test core functionality
   - [ ] Monitor for issues

4. **Post-Rollback**
   - [ ] Investigate root cause
   - [ ] Document lessons learned
   - [ ] Update deployment procedures
   - [ ] Schedule re-deployment

## Emergency Contacts

- **DevOps Lead**: [Name] - [Phone] - [Email]
- **Database Admin**: [Name] - [Phone] - [Email]
- **Security Lead**: [Name] - [Phone] - [Email]
- **On-Call Support**: [Phone] - [Email]

## Additional Resources

- README.md - Project overview
- DEPLOYMENT.md - Detailed deployment guide
- API Documentation - http://api.govlogic.com/docs
- Monitoring Dashboard - http://grafana.govlogic.com
- Log Aggregation - http://kibana.govlogic.com

---

**Last Updated**: [Date]
**Updated By**: [Name]
**Next Review**: [Date]
