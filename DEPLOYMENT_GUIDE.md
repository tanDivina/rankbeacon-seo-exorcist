# 🚀 RankBeacon SEO Exorcist - Deployment Guide

## Quick Deployment Options

### Option 1: Vercel (Frontend) + Railway/Render (Backend) - RECOMMENDED ⭐

This is the easiest and most cost-effective option for a hackathon demo.

#### Deploy Frontend to Vercel

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy Frontend**
   ```bash
   cd frontend
   vercel
   ```
   
   Follow the prompts:
   - Set up and deploy? **Y**
   - Which scope? Select your account
   - Link to existing project? **N**
   - Project name? `rankbeacon-seo-exorcist`
   - Directory? `./`
   - Override settings? **N**

3. **Set Environment Variable**
   After deployment, add the backend URL:
   ```bash
   vercel env add NEXT_PUBLIC_API_URL
   ```
   Enter: `https://your-backend-url.railway.app` (we'll get this next)

4. **Redeploy with env var**
   ```bash
   vercel --prod
   ```

#### Deploy Backend to Railway

1. **Go to [Railway.app](https://railway.app)**
   - Sign up with GitHub

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Connect your repository
   - Select the `rankbeacon-seo-exorcist` repo

3. **Configure Backend Service**
   - Root directory: `/backend`
   - Build command: `pip install -r requirements.txt && playwright install chromium`
   - Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

4. **Add Environment Variables**
   ```
   PORT=8000
   PYTHONUNBUFFERED=1
   ```

5. **Generate Domain**
   - Go to Settings → Generate Domain
   - Copy the URL (e.g., `https://rankbeacon-backend.railway.app`)

6. **Update Frontend**
   - Update the API URL in Vercel environment variables
   - Redeploy frontend

---

### Option 2: Docker + DigitalOcean/AWS/GCP

For a more production-ready deployment with full control.

#### Prerequisites
- Docker and Docker Compose installed
- Cloud provider account (DigitalOcean, AWS, or GCP)

#### Step 1: Update docker-compose.yml for Production

```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - PYTHONUNBUFFERED=1
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://backend:8000
    depends_on:
      - backend
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - frontend
      - backend
    restart: unless-stopped
```

#### Step 2: Create Nginx Configuration

Create `nginx.conf`:
```nginx
events {
    worker_connections 1024;
}

http {
    upstream frontend {
        server frontend:3000;
    }

    upstream backend {
        server backend:8000;
    }

    server {
        listen 80;
        server_name your-domain.com;

        location / {
            proxy_pass http://frontend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }

        location /api {
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }
    }
}
```

#### Step 3: Deploy to DigitalOcean

1. **Create Droplet**
   - Go to DigitalOcean
   - Create Droplet (Ubuntu 22.04, $12/month minimum)
   - Add SSH key

2. **SSH into Server**
   ```bash
   ssh root@your-droplet-ip
   ```

3. **Install Docker**
   ```bash
   curl -fsSL https://get.docker.com -o get-docker.sh
   sh get-docker.sh
   apt-get install docker-compose-plugin
   ```

4. **Clone Repository**
   ```bash
   git clone https://github.com/yourusername/rankbeacon-seo-exorcist.git
   cd rankbeacon-seo-exorcist
   ```

5. **Deploy**
   ```bash
   docker compose up -d
   ```

6. **Setup Domain**
   - Point your domain's A record to droplet IP
   - Install SSL with Let's Encrypt:
   ```bash
   apt-get install certbot python3-certbot-nginx
   certbot --nginx -d your-domain.com
   ```

---

### Option 3: Heroku (Simple but Paid)

#### Deploy Backend

1. **Install Heroku CLI**
   ```bash
   brew install heroku/brew/heroku  # macOS
   ```

2. **Login and Create App**
   ```bash
   heroku login
   cd backend
   heroku create rankbeacon-backend
   ```

3. **Add Buildpacks**
   ```bash
   heroku buildpacks:add heroku/python
   heroku buildpacks:add https://github.com/mxschmitt/heroku-playwright-buildpack.git
   ```

4. **Create Procfile**
   ```bash
   echo "web: uvicorn main:app --host 0.0.0.0 --port \$PORT" > Procfile
   ```

5. **Deploy**
   ```bash
   git init
   git add .
   git commit -m "Deploy backend"
   git push heroku main
   ```

#### Deploy Frontend

1. **Create Frontend App**
   ```bash
   cd ../frontend
   heroku create rankbeacon-frontend
   ```

2. **Set Environment Variable**
   ```bash
   heroku config:set NEXT_PUBLIC_API_URL=https://rankbeacon-backend.herokuapp.com
   ```

3. **Deploy**
   ```bash
   git init
   git add .
   git commit -m "Deploy frontend"
   git push heroku main
   ```

---

### Option 4: Netlify (Frontend) + Render (Backend)

#### Deploy Backend to Render

1. **Go to [Render.com](https://render.com)**
   - Sign up with GitHub

2. **Create Web Service**
   - New → Web Service
   - Connect repository
   - Name: `rankbeacon-backend`
   - Root Directory: `backend`
   - Build Command: `pip install -r requirements.txt && playwright install chromium`
   - Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

3. **Configure**
   - Instance Type: Free (or Starter $7/month)
   - Add environment variables if needed

#### Deploy Frontend to Netlify

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Build Frontend**
   ```bash
   cd frontend
   npm run build
   ```

3. **Deploy**
   ```bash
   netlify deploy --prod
   ```

4. **Set Environment Variable**
   - Go to Netlify dashboard
   - Site settings → Environment variables
   - Add `NEXT_PUBLIC_API_URL` with your Render backend URL

---

## Environment Variables Reference

### Frontend
```env
NEXT_PUBLIC_API_URL=https://your-backend-url.com
```

### Backend
```env
PORT=8000
PYTHONUNBUFFERED=1
# Optional: Add API keys if using external services
GOOGLE_API_KEY=your_key_here
```

---

## Post-Deployment Checklist

- [ ] Frontend loads correctly
- [ ] Backend API is accessible at `/api/health`
- [ ] CORS is configured for frontend domain
- [ ] JavaScript rendering works (Playwright installed)
- [ ] SSL certificate is active (HTTPS)
- [ ] Environment variables are set
- [ ] Error monitoring is configured (optional)
- [ ] Analytics are tracking (optional)

---

## Troubleshooting

### Frontend can't connect to backend
- Check CORS settings in `backend/main.py`
- Verify `NEXT_PUBLIC_API_URL` is set correctly
- Check browser console for errors

### Playwright not working
- Ensure Playwright is installed: `playwright install chromium`
- Check server has enough memory (minimum 1GB RAM)
- Verify buildpack/dependencies are installed

### 502 Bad Gateway
- Backend might be crashing - check logs
- Increase server timeout settings
- Check if port is correct

### Slow performance
- Enable caching in backend
- Use CDN for frontend assets
- Optimize Playwright (reduce wait times)
- Consider upgrading server resources

---

## Cost Estimates

### Free Tier (Hobby/Demo)
- **Vercel**: Free (frontend)
- **Railway**: $5/month free credit (backend)
- **Total**: ~$0-5/month

### Production Ready
- **Vercel Pro**: $20/month (frontend)
- **Railway Starter**: $7/month (backend)
- **Total**: ~$27/month

### Self-Hosted
- **DigitalOcean Droplet**: $12-24/month
- **Domain**: $10-15/year
- **Total**: ~$12-24/month

---

## Recommended for Hackathon Demo

**Best Option**: Vercel (Frontend) + Railway (Backend)

**Why?**
- ✅ Free/cheap for demo
- ✅ Easy to set up (< 30 minutes)
- ✅ Automatic HTTPS
- ✅ Good performance
- ✅ Easy to share URL
- ✅ No server management

**Quick Deploy Commands**:
```bash
# Frontend
cd frontend
vercel --prod

# Backend - push to GitHub, then connect Railway
# Railway will auto-deploy from GitHub
```

---

## Need Help?

- Check logs: `vercel logs` or Railway dashboard
- Test locally first: `docker-compose up`
- Verify environment variables are set
- Check CORS configuration
- Ensure Playwright is installed on server

Good luck with your deployment! 🚀👻
