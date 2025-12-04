# ✅ Backend is Ready! Update Vercel Now

## Your Backend HTTPS URL:
```
https://autumn-dodge-probability-borders.trycloudflare.com
```

## Update Vercel (2 minutes):

### Step 1: Remove old env var
```bash
cd frontend
vercel env rm NEXT_PUBLIC_API_URL production --yes
```

### Step 2: Add new env var
```bash
vercel env add NEXT_PUBLIC_API_URL production
```
When prompted, paste:
```
https://autumn-dodge-probability-borders.trycloudflare.com
```

### Step 3: Redeploy
```bash
vercel --prod
```

## Or use Vercel Dashboard:

1. Go to: https://vercel.com/dashboard
2. Select your RankBeacon project
3. Go to Settings → Environment Variables
4. Find `NEXT_PUBLIC_API_URL`
5. Edit it to: `https://autumn-dodge-probability-borders.trycloudflare.com`
6. Redeploy from Deployments tab

## Test Backend:
```bash
curl https://autumn-dodge-probability-borders.trycloudflare.com/api/health
```

Should return:
```json
{"status":"healthy","haunting_score":100}
```

## ✅ Everything is Working!

- Backend: Running on EC2
- Cloudflare Tunnel: Active with HTTPS
- URL: https://autumn-dodge-probability-borders.trycloudflare.com

Just update Vercel and you're done!

## Keep Tunnel Running

The tunnel is running in the background on EC2. To check status:
```bash
ssh -i rankbeacon-key.pem ubuntu@18.232.139.140
tail -f /tmp/cloudflare-tunnel.log
```

To get the URL again:
```bash
ssh -i rankbeacon-key.pem ubuntu@18.232.139.140 "grep -oP 'https://[a-z0-9-]+\.trycloudflare\.com' /tmp/cloudflare-tunnel.log | head -1"
```

⚠️ **Note:** Free Cloudflare tunnels change URL when restarted!
