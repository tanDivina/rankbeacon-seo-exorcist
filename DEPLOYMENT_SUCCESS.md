# 🎉 RankBeacon SEO Exorcist - DEPLOYED!

## ✅ Deployment Status: LIVE

Your RankBeacon SEO Exorcist API is now running on AWS EC2 (Free Tier)!

---

## 🔗 Live URLs

- **API Base**: http://18.232.139.140:8000
- **API Docs**: http://18.232.139.140:8000/docs
- **Health Check**: http://18.232.139.140:8000/api/health

---

## 🧪 Test Your API

```bash
# Basic health check
curl http://18.232.139.140:8000

# Health endpoint
curl http://18.232.139.140:8000/api/health

# Analyze a website (POST request)
curl -X POST "http://18.232.139.140:8000/api/analyze?url=example.com"
```

---

## 📋 Deployment Details

- **Instance ID**: i-0a1c2f0d57fbda56a
- **Instance Type**: t2.micro (FREE TIER)
- **Public IP**: 18.232.139.140
- **Region**: us-east-1
- **OS**: Ubuntu 22.04
- **Status**: Running ✅

---

## 🛠️ Management Commands

### Check Server Status
```bash
ssh -i rankbeacon-key.pem ubuntu@18.232.139.140 'ps aux | grep python3'
```

### View Logs
```bash
ssh -i rankbeacon-key.pem ubuntu@18.232.139.140 'tail -f ~/backend.log'
```

### Restart Server
```bash
ssh -i rankbeacon-key.pem ubuntu@18.232.139.140 'pkill -f simple_backend.py && nohup python3 ~/simple_backend.py > ~/backend.log 2>&1 &'
```

### Stop Instance (Save Costs)
```bash
aws ec2 stop-instances --instance-ids i-0a1c2f0d57fbda56a --region us-east-1
```

### Start Instance
```bash
aws ec2 start-instances --instance-ids i-0a1c2f0d57fbda56a --region us-east-1
```

### Terminate Instance (Delete)
```bash
aws ec2 terminate-instances --instance-ids i-0a1c2f0d57fbda56a --region us-east-1
```

---

## 🎃 API Endpoints

### GET /
Returns basic API information
```json
{
  "message": "👻 RankBeacon SEO Exorcist API",
  "status": "haunting",
  "version": "1.0.0"
}
```

### GET /api/health
Health check endpoint
```json
{
  "status": "healthy",
  "haunting_score": 100
}
```

### POST /api/analyze
Analyze a website for SEO issues
```bash
curl -X POST "http://18.232.139.140:8000/api/analyze?url=example.com"
```

Response:
```json
{
  "url": "example.com",
  "haunting_score": 45,
  "ghosts": ["404 error on /old-page"],
  "zombies": ["orphaned page /blog/post"],
  "monsters": ["competitor.com ranking above you"]
}
```

---

## 💰 Cost Breakdown

**Current Setup (FREE for 12 months):**
- EC2 t2.micro: 750 hours/month FREE
- Data Transfer: 15 GB/month FREE
- **Total**: $0/month (first 12 months)

**After Free Tier:**
- EC2 t2.micro: ~$8.50/month
- Data Transfer: ~$1-2/month
- **Total**: ~$10/month

---

## 🚀 Next Steps

### For Hackathon Demo:
1. ✅ API is live and accessible
2. Test all endpoints with curl or Postman
3. Use the API docs at http://18.232.139.140:8000/docs
4. Show the spooky responses in your demo

### To Deploy Full App (Frontend + Backend):
1. Fix Docker build issues (npm dependencies)
2. Deploy full stack with docker-compose
3. Add custom domain (optional)
4. Set up SSL/HTTPS (optional)

### To Scale:
1. Upgrade to larger instance (t3.small, t3.medium)
2. Add load balancer for multiple instances
3. Use RDS for PostgreSQL database
4. Add CloudFront CDN for frontend

---

## 🎯 What's Running

**Simple Backend API:**
- FastAPI server on port 8000
- Basic SEO analysis endpoints
- Health monitoring
- CORS enabled for all origins

**Not Yet Deployed:**
- Frontend (Next.js)
- Full backend with database
- MCP Server
- PostgreSQL database
- Redis cache

---

## 📝 Notes

- The current deployment is a simplified version for quick demo
- Full application requires Docker builds to complete successfully
- Security group allows traffic on ports: 22 (SSH), 80 (HTTP), 443 (HTTPS), 8000 (API)
- SSH key: `rankbeacon-key.pem` (keep this safe!)

---

## 🎃 Happy Haunting!

Your SEO Exorcist is ready to banish those SEO demons! 👻✨

**Built for the Kiroween Hackathon**
