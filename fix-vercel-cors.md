# 🔧 Fix Vercel ↔️ EC2 Connection Issue

## The Problem
Vercel serves your frontend over **HTTPS**, but your EC2 backend uses **HTTP**. Browsers block this "mixed content" for security.

## Quick Solutions

### Option 1: Use Cloudflare Tunnel (Easiest, Free SSL) ⭐

1. **Install Cloudflare Tunnel on EC2**
   ```bash
   # SSH into your EC2 instance
   ssh -i your-key.pem ubuntu@18.232.139.140
   
   # Install cloudflared
   wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
   sudo dpkg -i cloudflared-linux-amd64.deb
   
   # Login to Cloudflare
   cloudflared tunnel login
   
   # Create tunnel
   cloudflared tunnel create rankbeacon
   
   # Run tunnel (replace with your tunnel ID)
   cloudflared tunnel --url http://localhost:8000 run rankbeacon
   ```

2. **Get your HTTPS URL**
   - Cloudflare will give you a URL like: `https://rankbeacon-xyz.trycloudflare.com`

3. **Update Vercel env vars**
   ```bash
   cd frontend
   vercel env rm NEXT_PUBLIC_API_URL production
   vercel env add NEXT_PUBLIC_API_URL production
   # Enter: https://your-cloudflare-url.trycloudflare.com
   
   vercel --prod
   ```

### Option 2: Add HTTPS to EC2 with Caddy (Simple)

1. **Install Caddy on EC2**
   ```bash
   ssh -i your-key.pem ubuntu@18.232.139.140
   
   sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https
   curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
   curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
   sudo apt update
   sudo apt install caddy
   ```

2. **Configure Caddy** (create `/etc/caddy/Caddyfile`)
   ```
   api.yourdomain.com {
       reverse_proxy localhost:8000
   }
   ```

3. **Point DNS to EC2**
   - Add A record: `api.yourdomain.com` → `18.232.139.140`

4. **Start Caddy**
   ```bash
   sudo systemctl start caddy
   sudo systemctl enable caddy
   ```

### Option 3: Update CORS to Allow Vercel (Temporary Fix)

If you just need it working NOW for demo:

1. **Update backend CORS** - Add your Vercel domain:
   ```python
   # In backend/main.py or backend/simple_main.py
   app.add_middleware(
       CORSMiddleware,
       allow_origins=[
           "https://your-app.vercel.app",  # Add your Vercel URL
           "http://localhost:3000",
       ],
       allow_credentials=True,
       allow_methods=["*"],
       allow_headers=["*"],
   )
   ```

2. **Restart backend on EC2**
   ```bash
   ssh -i your-key.pem ubuntu@18.232.139.140
   sudo systemctl restart rankbeacon
   ```

But this still won't fix the HTTPS/HTTP issue - browsers will still block it.

## Recommended: Railway Backend (Easiest)

Instead of EC2, deploy backend to Railway (has HTTPS built-in):

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Ready for Railway"
   git push
   ```

2. **Deploy to Railway**
   - Go to https://railway.app
   - New Project → Deploy from GitHub
   - Select your repo
   - Railway auto-detects Python and deploys
   - You get HTTPS URL: `https://rankbeacon-production.up.railway.app`

3. **Update Vercel**
   ```bash
   cd frontend
   vercel env add NEXT_PUBLIC_API_URL production
   # Enter: https://rankbeacon-production.up.railway.app
   vercel --prod
   ```

## Current Issue Summary

❌ **What's broken:**
- Frontend: `https://your-app.vercel.app` (HTTPS)
- Backend: `http://18.232.139.140:8000` (HTTP)
- Browser blocks HTTP requests from HTTPS pages

✅ **What you need:**
- Frontend: `https://your-app.vercel.app` (HTTPS)
- Backend: `https://your-backend-url` (HTTPS)
- Both must use HTTPS

## Quick Test

Check if CORS is the issue:
```bash
curl -X POST http://18.232.139.140:8000/api/analyze \
  -H "Content-Type: application/json" \
  -H "Origin: https://your-app.vercel.app" \
  -d '{"url": "https://example.com"}'
```

If this works, it's the HTTPS/HTTP issue. If it fails, it's CORS.
