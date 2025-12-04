#!/bin/bash

echo "🔧 RankBeacon - Fix EC2 Backend & Deploy to Vercel"
echo "===================================================="
echo ""

# Configuration
EC2_IP="18.232.139.140"
KEY_FILE="${1:-your-key.pem}"

if [ ! -f "$KEY_FILE" ]; then
    echo "❌ SSH key not found: $KEY_FILE"
    echo ""
    echo "Usage: ./fix-and-deploy.sh path/to/your-key.pem"
    echo ""
    echo "Or place your key as 'your-key.pem' in this directory"
    exit 1
fi

echo "Using SSH key: $KEY_FILE"
echo "EC2 IP: $EC2_IP"
echo ""

# Test SSH
echo "1️⃣  Testing SSH connection..."
if ! ssh -i "$KEY_FILE" -o ConnectTimeout=5 ubuntu@$EC2_IP "echo 'Connected'" 2>/dev/null; then
    echo "❌ Cannot connect to EC2"
    echo ""
    echo "Make sure:"
    echo "  - EC2 instance is running"
    echo "  - Security group allows SSH (port 22)"
    echo "  - Key file has correct permissions: chmod 400 $KEY_FILE"
    exit 1
fi
echo "✅ SSH working"
echo ""

# Setup and start everything on EC2
echo "2️⃣  Setting up backend and tunnel on EC2..."
echo ""

ssh -i "$KEY_FILE" ubuntu@$EC2_IP << 'ENDSSH'
set -e

echo "📦 Installing cloudflared if needed..."
if ! command -v cloudflared &> /dev/null; then
    cd /tmp
    wget -q https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
    sudo dpkg -i cloudflared-linux-amd64.deb
    rm cloudflared-linux-amd64.deb
    echo "✅ Cloudflared installed"
else
    echo "✅ Cloudflared already installed"
fi

echo ""
echo "🔄 Stopping old processes..."
pkill -f "uvicorn.*8000" 2>/dev/null || true
pkill cloudflared 2>/dev/null || true
sleep 2

echo ""
echo "🚀 Starting backend..."
cd ~/rankbeacon-seo-exorcist/backend 2>/dev/null || cd ~/backend 2>/dev/null || cd ~

if [ -f "simple_main.py" ]; then
    nohup python3 -m uvicorn simple_main:app --host 0.0.0.0 --port 8000 > /tmp/backend.log 2>&1 &
    echo "✅ Backend started (simple_main.py)"
elif [ -f "main.py" ]; then
    nohup python3 -m uvicorn main:app --host 0.0.0.0 --port 8000 > /tmp/backend.log 2>&1 &
    echo "✅ Backend started (main.py)"
else
    echo "❌ No backend file found!"
    exit 1
fi

sleep 3

# Test backend
if curl -s http://localhost:8000/api/health > /dev/null 2>&1; then
    echo "✅ Backend responding on port 8000"
else
    echo "❌ Backend not responding"
    echo "Logs:"
    tail -20 /tmp/backend.log
    exit 1
fi

echo ""
echo "🌩️  Starting Cloudflare tunnel..."
nohup cloudflared tunnel --url http://localhost:8000 > /tmp/cloudflare-tunnel.log 2>&1 &

echo "⏳ Waiting for tunnel to initialize (15 seconds)..."
sleep 15

# Get tunnel URL
TUNNEL_URL=$(grep -oP 'https://[a-z0-9-]+\.trycloudflare\.com' /tmp/cloudflare-tunnel.log | head -1)

if [ -z "$TUNNEL_URL" ]; then
    echo "⏳ Still waiting..."
    sleep 10
    TUNNEL_URL=$(grep -oP 'https://[a-z0-9-]+\.trycloudflare\.com' /tmp/cloudflare-tunnel.log | head -1)
fi

if [ -z "$TUNNEL_URL" ]; then
    echo "❌ Could not get tunnel URL"
    echo "Logs:"
    tail -20 /tmp/cloudflare-tunnel.log
    exit 1
fi

echo "✅ Tunnel started!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🌐 TUNNEL URL: $TUNNEL_URL"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Save for later
mkdir -p ~/.cloudflared
echo "$TUNNEL_URL" > ~/.cloudflared/current-url.txt
echo "Tunnel URL: $TUNNEL_URL" > ~/.cloudflared/tunnel-info.txt
echo "Started: $(date)" >> ~/.cloudflared/tunnel-info.txt
echo "PID: $(pgrep cloudflared)" >> ~/.cloudflared/tunnel-info.txt

ENDSSH

echo ""
echo "3️⃣  Getting tunnel URL..."
TUNNEL_URL=$(ssh -i "$KEY_FILE" ubuntu@$EC2_IP "cat ~/.cloudflared/current-url.txt 2>/dev/null")

if [ -z "$TUNNEL_URL" ]; then
    echo "❌ Could not get tunnel URL from EC2"
    echo ""
    echo "Check logs manually:"
    echo "  ssh -i $KEY_FILE ubuntu@$EC2_IP"
    echo "  tail -f /tmp/cloudflare-tunnel.log"
    exit 1
fi

echo "✅ Got tunnel URL: $TUNNEL_URL"
echo ""

# Test tunnel from outside
echo "4️⃣  Testing tunnel from internet..."
sleep 5  # Give it a moment

if curl -s "$TUNNEL_URL/api/health" > /dev/null 2>&1; then
    echo "✅ Tunnel is accessible!"
    HEALTH_RESPONSE=$(curl -s "$TUNNEL_URL/api/health")
    echo "   Response: $HEALTH_RESPONSE"
else
    echo "⚠️  Tunnel not responding yet, waiting 10 more seconds..."
    sleep 10
    
    if curl -s "$TUNNEL_URL/api/health" > /dev/null 2>&1; then
        echo "✅ Tunnel is accessible now!"
    else
        echo "❌ Tunnel still not accessible"
        echo ""
        echo "The tunnel might need more time. Try manually:"
        echo "  curl $TUNNEL_URL/api/health"
        echo ""
        read -p "Continue with Vercel deployment anyway? (y/n) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
fi

echo ""
echo "5️⃣  Updating Vercel..."
cd frontend

echo "Removing old environment variable..."
vercel env rm NEXT_PUBLIC_API_URL production --yes 2>/dev/null || true

echo "Adding new environment variable..."
echo "$TUNNEL_URL" | vercel env add NEXT_PUBLIC_API_URL production

echo ""
echo "Deploying to Vercel..."
vercel --prod --yes

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ DEPLOYMENT COMPLETE!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🌐 Backend (HTTPS): $TUNNEL_URL"
echo "🎃 Frontend: Check Vercel output above"
echo ""
echo "📝 Next steps:"
echo "  1. Open your Vercel URL in browser"
echo "  2. Try analyzing a website"
echo "  3. Check browser console if issues"
echo ""
echo "⚠️  Important: The tunnel URL is temporary!"
echo "   If you restart EC2 or the tunnel, you'll need to:"
echo "   1. Get new tunnel URL from EC2"
echo "   2. Update Vercel again"
echo ""
echo "To get current tunnel URL anytime:"
echo "  ssh -i $KEY_FILE ubuntu@$EC2_IP \"cat ~/.cloudflared/current-url.txt\""
echo ""
