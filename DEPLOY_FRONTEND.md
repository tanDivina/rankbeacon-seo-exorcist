# 🚀 Deploy Frontend to Vercel (2 Minutes)

## Quick Deploy Steps:

### Option 1: Vercel CLI (Recommended)

1. **Login to Vercel**
   ```bash
   cd frontend
   vercel login
   ```
   - Follow the prompts to authenticate

2. **Deploy**
   ```bash
   vercel --prod
   ```
   - Press Enter to accept defaults
   - Your site will be live in ~2 minutes!

3. **Set Environment Variables** (after first deploy)
   ```bash
   vercel env add NEXT_PUBLIC_API_URL production
   # Enter: http://18.232.139.140:8000
   
   vercel env add NEXT_PUBLIC_MCP_SERVER_URL production
   # Enter: ws://18.232.139.140:3001
   ```

4. **Redeploy with env vars**
   ```bash
   vercel --prod
   ```

---

### Option 2: Vercel Dashboard (Even Easier!)

1. **Go to**: https://vercel.com/new

2. **Import Git Repository**
   - Click "Import Git Repository"
   - Connect your GitHub account
   - Select `rankbeacon-seo-exorcist`

3. **Configure Project**
   - Framework Preset: Next.js
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `.next`

4. **Add Environment Variables**
   ```
   NEXT_PUBLIC_API_URL = http://18.232.139.140:8000
   NEXT_PUBLIC_MCP_SERVER_URL = ws://18.232.139.140:3001
   ```

5. **Click Deploy**
   - Wait 2-3 minutes
   - Your site is live! 🎉

---

### Option 3: Deploy to EC2 (Same Server)

If you want everything on one server:

```bash
# SSH into your EC2 instance
ssh -i rankbeacon-key.pem ubuntu@18.232.139.140

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone your repo (or upload files)
# cd to your project directory

# Build frontend
cd frontend
npm install
npm run build

# Install PM2 to run it
sudo npm install -g pm2

# Start frontend
pm2 start npm --name "rankbeacon-frontend" -- start

# Save PM2 config
pm2 save
pm2 startup
```

Then open port 3000 in security group:
```bash
aws ec2 authorize-security-group-ingress \
  --group-id sg-0f6103a24e8537b39 \
  --protocol tcp \
  --port 3000 \
  --cidr 0.0.0.0/0 \
  --region us-east-1
```

Your site will be at: http://18.232.139.140:3000

---

## 🎯 Recommended: Use Vercel Dashboard

**Why?**
- ✅ Free hosting
- ✅ Automatic HTTPS
- ✅ Global CDN
- ✅ Auto-deploys on git push
- ✅ Takes 2 minutes
- ✅ Professional URL

**Steps:**
1. Go to https://vercel.com/new
2. Import your GitHub repo
3. Set root directory to `frontend`
4. Add the 2 environment variables
5. Click Deploy
6. Done! 🎉

---

## After Deployment

Your site will be live at something like:
- `https://rankbeacon-seo-exorcist.vercel.app`

Or you can add a custom domain for free!

---

## Need Help?

Run this command and I'll help you through it:
```bash
cd frontend && vercel login
```

Then just run:
```bash
vercel --prod
```

That's it! 🚀
