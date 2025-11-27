# 🚀 AWS Deployment Guide - RankBeacon SEO Exorcist

## Architecture Overview

We'll use:
- **AWS Amplify** - Frontend hosting (Next.js)
- **AWS App Runner** - Backend hosting (FastAPI with Playwright)
- **AWS CloudFront** - CDN (optional)
- **Route 53** - DNS (optional)

**Estimated Cost**: $10-30/month

---

## Option 1: AWS Amplify + App Runner (Recommended)

### Step 1: Deploy Backend to AWS App Runner

1. **Create ECR Repository**
   ```bash
   aws ecr create-repository --repository-name rankbeacon-backend --region us-east-1
   ```

2. **Build and Push Docker Image**
   ```bash
   # Get ECR login
   aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com
   
   # Build image
   cd backend
   docker build -t rankbeacon-backend .
   
   # Tag image
   docker tag rankbeacon-backend:latest YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/rankbeacon-backend:latest
   
   # Push image
   docker push YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/rankbeacon-backend:latest
   ```

3. **Create App Runner Service**
   - Go to AWS Console → App Runner
   - Click "Create service"
   - Source: Container registry → Amazon ECR
   - Select your image
   - Deployment: Manual
   - Configure service:
     - Service name: `rankbeacon-backend`
     - Port: `8000`
     - CPU: 1 vCPU
     - Memory: 2 GB (needed for Playwright)
   - Environment variables:
     ```
     ALLOWED_ORIGINS=*
     PYTHONUNBUFFERED=1
     ```
   - Create service

4. **Get Backend URL**
   - Copy the App Runner URL (e.g., `https://abc123.us-east-1.awsapprunner.com`)

### Step 2: Deploy Frontend to AWS Amplify

1. **Push to GitHub** (if not already)
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Create Amplify App**
   - Go to AWS Console → Amplify
   - Click "New app" → "Host web app"
   - Connect to GitHub
   - Select repository: `rankbeacon-seo-exorcist`
   - Branch: `main`
   - App name: `rankbeacon-seo-exorcist`

3. **Configure Build Settings**
   - Root directory: `frontend`
   - Build command: `npm run build`
   - Output directory: `.next`
   
   Or use the amplify.yml we'll create below

4. **Add Environment Variable**
   - Go to App settings → Environment variables
   - Add: `NEXT_PUBLIC_API_URL` = `https://your-app-runner-url.awsapprunner.com`

5. **Deploy**
   - Click "Save and deploy"
   - Wait for build to complete (~5 minutes)

6. **Get Frontend URL**
   - Copy the Amplify URL (e.g., `https://main.d1234567890.amplifyapp.com`)

---

## Option 2: AWS ECS Fargate (More Control)

### Prerequisites
```bash
# Install AWS CLI
brew install awscli  # macOS
# or
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Configure AWS CLI
aws configure
```

### Deploy with ECS

1. **Create ECS Cluster**
   ```bash
   aws ecs create-cluster --cluster-name rankbeacon-cluster --region us-east-1
   ```

2. **Create Task Definitions** (see files below)

3. **Create Services**
   ```bash
   # Backend service
   aws ecs create-service \
     --cluster rankbeacon-cluster \
     --service-name rankbeacon-backend \
     --task-definition rankbeacon-backend:1 \
     --desired-count 1 \
     --launch-type FARGATE \
     --network-configuration "awsvpcConfiguration={subnets=[subnet-xxx],securityGroups=[sg-xxx],assignPublicIp=ENABLED}"
   
   # Frontend service
   aws ecs create-service \
     --cluster rankbeacon-cluster \
     --service-name rankbeacon-frontend \
     --task-definition rankbeacon-frontend:1 \
     --desired-count 1 \
     --launch-type FARGATE \
     --network-configuration "awsvpcConfiguration={subnets=[subnet-xxx],securityGroups=[sg-xxx],assignPublicIp=ENABLED}"
   ```

---

## Option 3: AWS EC2 (Traditional)

### Launch EC2 Instance

1. **Create EC2 Instance**
   - Go to EC2 Console
   - Launch instance
   - AMI: Ubuntu 22.04
   - Instance type: t3.medium (2 vCPU, 4GB RAM)
   - Storage: 20GB
   - Security group: Allow ports 22, 80, 443, 3000, 8000

2. **SSH into Instance**
   ```bash
   ssh -i your-key.pem ubuntu@your-ec2-ip
   ```

3. **Install Dependencies**
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y
   
   # Install Docker
   curl -fsSL https://get.docker.com -o get-docker.sh
   sudo sh get-docker.sh
   sudo usermod -aG docker ubuntu
   
   # Install Docker Compose
   sudo apt install docker-compose-plugin
   
   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt install -y nodejs
   
   # Install Python
   sudo apt install -y python3 python3-pip
   ```

4. **Clone and Deploy**
   ```bash
   git clone https://github.com/yourusername/rankbeacon-seo-exorcist.git
   cd rankbeacon-seo-exorcist
   
   # Use Docker Compose
   docker compose up -d
   ```

5. **Setup Nginx Reverse Proxy**
   ```bash
   sudo apt install nginx
   sudo nano /etc/nginx/sites-available/rankbeacon
   ```
   
   Add configuration (see nginx.conf below)

6. **Setup SSL with Let's Encrypt**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com
   ```

---

## Configuration Files

### amplify.yml (for AWS Amplify)
```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - cd frontend
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: frontend/.next
    files:
      - '**/*'
  cache:
    paths:
      - frontend/node_modules/**/*
```

### backend-task-definition.json (for ECS)
```json
{
  "family": "rankbeacon-backend",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "1024",
  "memory": "2048",
  "containerDefinitions": [
    {
      "name": "backend",
      "image": "YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/rankbeacon-backend:latest",
      "portMappings": [
        {
          "containerPort": 8000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "PYTHONUNBUFFERED",
          "value": "1"
        },
        {
          "name": "ALLOWED_ORIGINS",
          "value": "*"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/rankbeacon-backend",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

### nginx.conf (for EC2)
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

---

## Quick Deploy Script for AWS

Run this to deploy to AWS App Runner + Amplify:

```bash
./deploy-aws.sh
```

---

## Monitoring & Logs

### CloudWatch Logs
```bash
# View App Runner logs
aws logs tail /aws/apprunner/rankbeacon-backend --follow

# View Amplify logs
# Go to Amplify Console → Your app → Logs
```

### Health Checks
- Backend: `https://your-backend-url.awsapprunner.com/api/health`
- Frontend: `https://your-frontend-url.amplifyapp.com`

---

## Cost Breakdown

### App Runner + Amplify (Recommended)
- **App Runner**: ~$15-25/month (1 vCPU, 2GB RAM)
- **Amplify**: ~$0-5/month (free tier covers most demos)
- **Data Transfer**: ~$1-5/month
- **Total**: ~$16-35/month

### ECS Fargate
- **Fargate**: ~$30-50/month (2 tasks)
- **Load Balancer**: ~$16/month
- **Total**: ~$46-66/month

### EC2
- **t3.medium**: ~$30/month
- **Elastic IP**: ~$3.60/month
- **Total**: ~$34/month

---

## Troubleshooting

### App Runner Issues
- Check CloudWatch logs
- Verify Docker image works locally
- Ensure port 8000 is exposed
- Check memory allocation (Playwright needs 2GB+)

### Amplify Build Fails
- Check build logs in Amplify console
- Verify package.json scripts
- Check environment variables
- Try building locally first

### CORS Errors
- Update `ALLOWED_ORIGINS` in App Runner
- Redeploy backend service
- Clear browser cache

---

## Next Steps

1. Choose deployment option (I recommend App Runner + Amplify)
2. Follow the steps above
3. Update DNS if you have a custom domain
4. Set up monitoring and alerts
5. Configure auto-scaling if needed

Need help with any step? Let me know! 🚀
