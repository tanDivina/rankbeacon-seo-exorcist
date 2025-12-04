# 🌩️ Cloudflare Tunnel Setup - Quick Guide

This fixes the HTTPS/HTTP mixed content issue between Vercel (frontend) and EC2 (backend).

## The Problem
- ❌ Vercel frontend: `https://your-app.vercel.app` (HTTPS)
- ❌ EC2 backend: `http://18.232.139.140:8000` (HTTP)
- ❌ Browser blocks HTTP requests from HTTPS pages

## The Solution
- ✅ Vercel frontend: `https://your-app.vercel.app` (HTTPS)
- ✅ Cloudflare Tunnel: `https://abc-123.trycloudflare.com` → EC2 (HTTPS)
- ✅ Both use HTTPS, browser happy!

---

## Step 1: Setup Tunnel on EC2 (5 minutes)

### Copy script to EC2:
```bash
# From your local machine
scp -i your-key.pem setup-cloudflare-tunnel.sh ubuntu@18.232.139.140:~/
```

### SSH into EC2 and run:
```bash
ssh -i your-key.pem ubuntu@18.232.139.140

# Run the setup script
chmod +x setup-cloudflare-tunnel.sh
./setup-cloudflare-tunnel.sh
```

The script will:
1. Install cloudflared
2. Start your backend (if not running)
3. Create a Cloudflare tunnel
4. Give you an HTTPS URL like: `https://abc-123.trycloudflare.com`

### Save the URL!
The script outputs something like:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🌐 Your HTTPS Backend URL:
   https://abc-123.trycloudflare.com
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Copy this URL!** You'll need it for Step 2.

---

## Step 2: Update Vercel (2 minutes)

### Option A: Use the script (easiest)
```bash
# From your local machine, in the project directory
./update-vercel-with-tunnel.sh https://abc-123.trycloudflare.com
```

### Option B: Manual update
```bash
cd frontend

# Remove old env var
vercel env rm NEXT_PUBLIC_API_URL production

# Add new env var with tunnel URL
vercel env add NEXT_PUBLIC_API_URL production
# When prompted, enter: https://abc-123.trycloudflare.com

# Redeploy
vercel --prod
```

---

## Step 3: Test It! 🎉

1. **Open your Vercel app** in browser
2. **Enter a URL** to analyze (try `https://example.com`)
3. **Click "Exorcise This Site"**
4. **Should work!** No more CORS or mixed content errors

### If it doesn't work:

**Check backend is accessible:**
```bash
curl https://abc-123.trycloudflare.com/api/health
```

Should return:
```json
{"status": "healthy", "haunting_score": 100}
```

**Check tunnel is running on EC2:**
```bash
ssh -i your-key.pem ubuntu@18.232.139.140
cat ~/.cloudflared/tunnel-info.txt
tail -f /tmp/cloudflare-tunnel.log
```

**Check browser console:**
- Open DevTools (F12)
- Look for errors in Console tab
- Check Network tab for failed requests

---

## Keeping the Tunnel Running

### Check tunnel status:
```bash
ssh -i your-key.pem ubuntu@18.232.139.140
cat ~/.cloudflared/tunnel-info.txt
```

### Restart tunnel if needed:
```bash
ssh -i your-key.pem ubuntu@18.232.139.140

# Kill old tunnel
pkill cloudflared

# Start new tunnel
nohup cloudflared tunnel --url http://localhost:8000 > /tmp/cloudflare-tunnel.log 2>&1 &

# Wait 10 seconds, then get new URL
sleep 10
grep -oP 'https://[a-z0-9-]+\.trycloudflare\.com' /tmp/cloudflare-tunnel.log | head -1
```

**Important:** The URL changes each time you restart the tunnel! You'll need to update Vercel again.

---

## Making it Permanent (Optional)

Free Cloudflare tunnels are temporary. For a permanent solution:

### Option 1: Named Cloudflare Tunnel (requires domain)
```bash
# On EC2
cloudflared tunnel login
cloudflared tunnel create rankbeacon
cloudflared tunnel route dns rankbeacon api.yourdomain.com
cloudflared tunnel run rankbeacon
```

Then your URL is always: `https://api.yourdomain.com`

### Option 2: Use Railway Instead
Railway gives you a permanent HTTPS URL automatically:
1. Push code to GitHub
2. Deploy to Railway
3. Get URL like: `https://rankbeacon-production.up.railway.app`
4. Update Vercel once, done forever

---

## Troubleshooting

### "Tunnel not responding"
```bash
# Check if backend is running
curl http://localhost:8000/api/health

# Check tunnel logs
tail -f /tmp/cloudflare-tunnel.log

# Restart everything
pkill cloudflared
pkill -f uvicorn
cd ~/rankbeacon-seo-exorcist/backend
nohup python3 -m uvicorn simple_main:app --host 0.0.0.0 --port 8000 > /tmp/backend.log 2>&1 &
nohup cloudflared tunnel --url http://localhost:8000 > /tmp/cloudflare-tunnel.log 2>&1 &
```

### "CORS error in browser"
The tunnel URL changed. Get the new URL and update Vercel:
```bash
ssh -i your-key.pem ubuntu@18.232.139.140
grep -oP 'https://[a-z0-9-]+\.trycloudflare\.com' /tmp/cloudflare-tunnel.log | head -1

# Then update Vercel with new URL
./update-vercel-with-tunnel.sh <new-url>
```

### "Mixed content error"
Make sure you're using `https://` not `http://` in the Vercel env var:
```bash
vercel env ls
# Should show: NEXT_PUBLIC_API_URL = https://...
```

---

## Quick Commands Reference

```bash
# Get tunnel URL
ssh -i your-key.pem ubuntu@18.232.139.140 "cat ~/.cloudflared/tunnel-info.txt"

# Check tunnel status
ssh -i your-key.pem ubuntu@18.232.139.140 "curl http://localhost:8000/api/health"

# View tunnel logs
ssh -i your-key.pem ubuntu@18.232.139.140 "tail -f /tmp/cloudflare-tunnel.log"

# Restart tunnel
ssh -i your-key.pem ubuntu@18.232.139.140 "pkill cloudflared && nohup cloudflared tunnel --url http://localhost:8000 > /tmp/cloudflare-tunnel.log 2>&1 &"

# Update Vercel
./update-vercel-with-tunnel.sh https://your-tunnel-url.trycloudflare.com
```

---

## Success Checklist

- [ ] Cloudflared installed on EC2
- [ ] Backend running on EC2 port 8000
- [ ] Tunnel running and URL obtained
- [ ] Tunnel URL accessible from browser
- [ ] Vercel env var updated with tunnel URL
- [ ] Vercel redeployed
- [ ] Frontend can connect to backend
- [ ] No CORS or mixed content errors
- [ ] SEO analysis works end-to-end

🎃 **You're all set!** Your app should now work perfectly with HTTPS on both ends.
