#!/bin/bash

echo "🌩️ Setting up Cloudflare Tunnel for RankBeacon Backend"
echo "========================================================"
echo ""

# Check if running on EC2
if [ ! -f /home/ubuntu/.ssh/authorized_keys ]; then
    echo "⚠️  This script should be run on your EC2 instance"
    echo "Run: ssh -i your-key.pem ubuntu@18.232.139.140"
    echo "Then run this script on the EC2 instance"
    exit 1
fi

# Install cloudflared
echo "📦 Installing cloudflared..."
cd /tmp
wget -q https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
sudo dpkg -i cloudflared-linux-amd64.deb
rm cloudflared-linux-amd64.deb

echo "✅ Cloudflared installed"
echo ""

# Check if backend is running
echo "🔍 Checking if backend is running on port 8000..."
if ! curl -s http://localhost:8000/api/health > /dev/null 2>&1; then
    echo "⚠️  Backend not running on port 8000"
    echo "Starting backend..."
    
    cd /home/ubuntu/rankbeacon-seo-exorcist/backend || cd ~/backend
    
    # Kill any existing process
    pkill -f "uvicorn.*8000" || true
    
    # Start backend
    nohup python3 -m uvicorn simple_main:app --host 0.0.0.0 --port 8000 > /tmp/backend.log 2>&1 &
    
    sleep 3
    
    if curl -s http://localhost:8000/api/health > /dev/null 2>&1; then
        echo "✅ Backend started successfully"
    else
        echo "❌ Failed to start backend. Check /tmp/backend.log"
        exit 1
    fi
else
    echo "✅ Backend is running"
fi

echo ""
echo "🌩️ Starting Cloudflare Tunnel..."
echo ""
echo "This will create a public HTTPS URL for your backend."
echo "The tunnel will run in the background."
echo ""

# Create tunnel directory
mkdir -p ~/.cloudflared

# Start tunnel in background and capture URL
echo "Starting tunnel (this may take 10-15 seconds)..."
nohup cloudflared tunnel --url http://localhost:8000 > /tmp/cloudflare-tunnel.log 2>&1 &
TUNNEL_PID=$!

# Wait for tunnel to start and get URL
echo "Waiting for tunnel URL..."
sleep 10

# Extract URL from logs
TUNNEL_URL=$(grep -oP 'https://[a-z0-9-]+\.trycloudflare\.com' /tmp/cloudflare-tunnel.log | head -1)

if [ -z "$TUNNEL_URL" ]; then
    echo "⏳ Still waiting for tunnel..."
    sleep 5
    TUNNEL_URL=$(grep -oP 'https://[a-z0-9-]+\.trycloudflare\.com' /tmp/cloudflare-tunnel.log | head -1)
fi

if [ -z "$TUNNEL_URL" ]; then
    echo "❌ Could not get tunnel URL. Check logs:"
    tail -20 /tmp/cloudflare-tunnel.log
    exit 1
fi

echo ""
echo "✅ Cloudflare Tunnel is LIVE!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🌐 Your HTTPS Backend URL:"
echo "   $TUNNEL_URL"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📝 Next Steps:"
echo ""
echo "1. Test your backend:"
echo "   curl $TUNNEL_URL/api/health"
echo ""
echo "2. Update Vercel environment variable:"
echo "   cd frontend"
echo "   vercel env rm NEXT_PUBLIC_API_URL production"
echo "   vercel env add NEXT_PUBLIC_API_URL production"
echo "   # Enter: $TUNNEL_URL"
echo "   vercel --prod"
echo ""
echo "3. Keep tunnel running:"
echo "   - Tunnel PID: $TUNNEL_PID"
echo "   - Logs: tail -f /tmp/cloudflare-tunnel.log"
echo "   - To stop: kill $TUNNEL_PID"
echo ""
echo "⚠️  Note: Free Cloudflare tunnels are temporary!"
echo "   The URL will change if the tunnel restarts."
echo "   For permanent URL, use Cloudflare Tunnel with a domain."
echo ""

# Save tunnel info
cat > ~/.cloudflared/tunnel-info.txt << EOF
Tunnel URL: $TUNNEL_URL
Tunnel PID: $TUNNEL_PID
Started: $(date)
Backend: http://localhost:8000
Logs: /tmp/cloudflare-tunnel.log

To restart tunnel:
cloudflared tunnel --url http://localhost:8000

To stop tunnel:
kill $TUNNEL_PID
EOF

echo "💾 Tunnel info saved to: ~/.cloudflared/tunnel-info.txt"
echo ""
echo "🎃 Your backend is now accessible via HTTPS!"
