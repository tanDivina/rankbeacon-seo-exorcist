# 🚀 Quick Deploy to AWS - RankBeacon SEO Exorcist

## Current Status
- ✅ AWS CLI configured (Account: 257455992303)
- ✅ ECR repository exists: `rankbeacon-backend`
- ✅ Region: us-east-1
- ⚠️ Docker not running locally

## Easiest Deployment Path

### Option 1: Use AWS Console (No Docker needed locally)

#### Step 1: Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit - RankBeacon SEO Exorcist"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/rankbeacon-seo-exorcist.git
git push -u origin main
```

#### Step 2: Deploy Backend via AWS App Runner
1. Go to [AWS App Runner Console](https://console.aws.amazon.com/apprunner)
2. Click "Create service"
3. Choose "Source code repository"
4. Connect GitHub (first time only)
5. Select your repository: `rankbeacon-seo-exorcist`
6. Branch: `main`
7. Source directory: `backend`
8. Configure build:
   - Runtime: Python 3
   - Build command: `pip install -r requirements.txt && playwright install chromium`
   - Start command: `uvicorn main:app --host 0.0.0.0 --port 8000`
9. Configure service:
   - CPU: 1 vCPU
   - Memory: 2 GB
   - Port: 8000
   - Environment variables:
     - `ALLOWED_ORIGINS` = `*`
     - `PYTHONUNBUFFERED` = `1`
10. Click "Create & deploy"
11. Wait ~10 minutes for deployment
12. Copy the App Runner URL (e.g., `https://abc123.us-east-1.awsapprunner.com`)

#### Step 3: Deploy Frontend via AWS Amplify
1. Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify)
2. Click "New app" → "Host web app"
3. Choose "GitHub"
4. Authorize AWS Amplify
5. Select repository: `rankbeacon-seo-exorcist`
6. Branch: `main`
7. App name: `rankbeacon-seo-exorcist`
8. Build settings:
   - Root directory: `frontend`
   - Build command: `npm run build`
   - Output directory: `.next`
9. Environment variables:
   - `NEXT_PUBLIC_API_URL` = `https://YOUR-APP-RUNNER-URL.awsapprunner.com`
10. Click "Save and deploy"
11. Wait ~5 minutes
12. Your site is live! 🎉

---

### Option 2: Start Docker and Deploy via CLI

If you start Docker Desktop:

```bash
# Build and push backend
cd backend
docker build -t rankbeacon-backend .
docker tag rankbeacon-backend:latest 257455992303.dkr.ecr.us-east-1.amazonaws.com/rankbeacon-backend:latest
docker push 257455992303.dkr.ecr.us-east-1.amazonaws.com/rankbeacon-backend:latest

# Then create App Runner service via console or CLI
```

---

### Option 3: Deploy to Vercel + Railway (Simpler)

#### Backend to Railway
1. Go to [Railway.app](https://railway.app)
2. Sign in with GitHub
3. "New Project" → "Deploy from GitHub repo"
4. Select your repo
5. Add service → Select `backend` folder
6. Environment variables:
   - `PYTHONUNBUFFERED` = `1`
7. Settings → Generate Domain
8. Copy the URL

#### Frontend to Vercel
```bash
cd frontend
npm install -g vercel
vercel
# Follow prompts
# Add environment variable: NEXT_PUBLIC_API_URL=https://your-railway-url.railway.app
vercel --prod
```

---

## What I Recommend

**For fastest deployment (5 minutes):**
1. Start Docker Desktop
2. Run: `./deploy-aws.sh` and answer "y" to backend
3. Follow the App Runner console steps
4. Deploy frontend to Vercel: `cd frontend && vercel --prod`

**For no-Docker deployment (15 minutes):**
1. Push code to GitHub
2. Use AWS App Runner with GitHub source
3. Use AWS Amplify for frontend
4. Both auto-deploy on push!

---

## Current Files Ready
- ✅ `backend/Dockerfile` - Updated with Playwright
- ✅ `backend/main.py` - CORS configured
- ✅ `frontend/` - Production ready
- ✅ `.github/workflows/deploy-backend.yml` - Auto-deploy on push
- ✅ `deploy-aws.sh` - CLI deployment script

---

## Need Help?

Let me know which option you prefer and I'll guide you through it! 🚀👻
