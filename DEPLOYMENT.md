# 🚀 RankBeacon SEO Exorcist - Deployment Guide

## Prerequisites

- Docker & Docker Compose
- Node.js 18+ (for local development)
- Python 3.12+ (for local development)
- PostgreSQL 15+ (if not using Docker)
- Redis 7+ (if not using Docker)

## Quick Start with Docker

### 1. Clone and Configure

```bash
# Clone repository
git clone https://github.com/your-org/rankbeacon-seo-exorcist.git
cd rankbeacon-seo-exorcist

# Copy environment file
cp .env.example .env

# Edit .env with your API keys
nano .env
```

### 2. Start All Services

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Check service health
docker-compose ps
```

### 3. Access Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/api/docs
- **MCP Server**: ws://localhost:3001

## Production Deployment

### Environment Variables

Required environment variables for production:

```bash
# API Keys (Required)
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# Database (Required)
DATABASE_URL=postgresql://user:pass@host:5432/db

# Redis (Required)
REDIS_URL=redis://host:6379/0

# Frontend URLs (Required)
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_MCP_SERVER_URL=wss://mcp.yourdomain.com

# Security (Recommended)
CORS_ORIGINS=https://yourdomain.com
RATE_LIMIT_PER_MINUTE=100
```

### Docker Compose Production

```bash
# Build for production
docker-compose -f docker-compose.yml -f docker-compose.prod.yml build

# Start services
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Scale services
docker-compose up -d --scale backend=3
```

### Health Checks

All services include health checks:

```bash
# Check backend health
curl http://localhost:8000/api/health

# Check frontend
curl http://localhost:3000/api/health

# Check all services
docker-compose ps
```

## Manual Deployment

### Frontend (Next.js)

```bash
cd frontend

# Install dependencies
npm install

# Build for production
npm run build

# Start production server
npm start
```

### Backend (FastAPI)

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run migrations (if applicable)
# alembic upgrade head

# Start production server
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

### MCP Server (TypeScript)

```bash
cd mcp-server

# Install dependencies
npm install

# Build TypeScript
npm run build

# Start server
node dist/index.js
```

## Database Setup

### PostgreSQL Initialization

```sql
-- Create database
CREATE DATABASE rankbeacon;

-- Create user
CREATE USER rankbeacon WITH PASSWORD 'your_secure_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE rankbeacon TO rankbeacon;

-- Create tables (run migrations)
-- Tables will be created automatically on first run
```

### Redis Configuration

```bash
# Start Redis with persistence
redis-server --appendonly yes

# Or use Docker
docker run -d -p 6379:6379 redis:7-alpine redis-server --appendonly yes
```

## Monitoring & Logging

### Application Logs

```bash
# View all logs
docker-compose logs -f

# View specific service
docker-compose logs -f backend

# View last 100 lines
docker-compose logs --tail=100 frontend
```

### Performance Monitoring

```bash
# Check resource usage
docker stats

# Check service health
curl http://localhost:8000/api/health | jq
```

### Log Aggregation

Logs are written to:
- Frontend: `/app/.next/logs`
- Backend: `/app/logs`
- MCP Server: `/app/rankbeacon-mcp.log`

## Scaling

### Horizontal Scaling

```bash
# Scale backend instances
docker-compose up -d --scale backend=3

# Scale with load balancer
# Add nginx or traefik for load balancing
```

### Vertical Scaling

Update `docker-compose.yml`:

```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 4G
        reservations:
          cpus: '1'
          memory: 2G
```

## Backup & Recovery

### Database Backup

```bash
# Backup PostgreSQL
docker-compose exec postgres pg_dump -U rankbeacon rankbeacon > backup.sql

# Restore
docker-compose exec -T postgres psql -U rankbeacon rankbeacon < backup.sql
```

### Redis Backup

```bash
# Backup Redis
docker-compose exec redis redis-cli SAVE
docker cp rankbeacon_redis_1:/data/dump.rdb ./redis-backup.rdb

# Restore
docker cp ./redis-backup.rdb rankbeacon_redis_1:/data/dump.rdb
docker-compose restart redis
```

## Security

### SSL/TLS Configuration

Use a reverse proxy (nginx/traefik) for SSL:

```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /api {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Environment Security

```bash
# Secure .env file
chmod 600 .env

# Use secrets management
# - Docker secrets
# - Kubernetes secrets
# - AWS Secrets Manager
# - HashiCorp Vault
```

## Troubleshooting

### Common Issues

**Port Already in Use**
```bash
# Find process using port
lsof -i :3000
# Kill process
kill -9 <PID>
```

**Database Connection Failed**
```bash
# Check PostgreSQL is running
docker-compose ps postgres
# Check connection
docker-compose exec postgres psql -U rankbeacon -d rankbeacon
```

**Redis Connection Failed**
```bash
# Check Redis is running
docker-compose ps redis
# Test connection
docker-compose exec redis redis-cli ping
```

**Build Failures**
```bash
# Clean build
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

### Debug Mode

```bash
# Run with debug logging
LOG_LEVEL=debug docker-compose up

# Access container shell
docker-compose exec backend bash
docker-compose exec frontend sh
```

## Performance Tuning

### Backend Optimization

```python
# Increase workers
uvicorn main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker

# Enable caching
CACHE_TTL_ANALYSIS=3600
CACHE_TTL_PREDICTION=86400
```

### Frontend Optimization

```bash
# Enable Next.js optimizations
NEXT_TELEMETRY_DISABLED=1
NEXT_SHARP_PATH=/app/node_modules/sharp
```

### Database Optimization

```sql
-- Create indexes
CREATE INDEX idx_analysis_url ON analysis(url);
CREATE INDEX idx_entities_type ON entities(type);

-- Analyze tables
ANALYZE;
```

## Maintenance

### Updates

```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
docker-compose down
docker-compose build
docker-compose up -d
```

### Cleanup

```bash
# Remove unused images
docker image prune -a

# Remove unused volumes
docker volume prune

# Full cleanup
docker system prune -a --volumes
```

## Support

For issues and questions:
- GitHub Issues: https://github.com/your-org/rankbeacon-seo-exorcist/issues
- Documentation: https://docs.rankbeacon.com
- Email: support@rankbeacon.com

---

**Built with 💀 for the Kiroween Hackathon**

Ready to exorcise your SEO demons! 👻✨
