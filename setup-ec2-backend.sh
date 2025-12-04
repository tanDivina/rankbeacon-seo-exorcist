#!/bin/bash

echo "🔧 Setting up RankBeacon Backend on EC2"
echo "========================================"
echo ""

KEY_FILE="${1:-rankbeacon-key.pem}"
EC2_IP="18.232.139.140"

if [ ! -f "$KEY_FILE" ]; then
    echo "❌ SSH key not found: $KEY_FILE"
    exit 1
fi

echo "Installing dependencies and starting backend on EC2..."
echo ""

ssh -i "$KEY_FILE" ubuntu@$EC2_IP << 'ENDSSH'
set -e

echo "📦 Installing Python dependencies..."
pip3 install --quiet fastapi uvicorn python-multipart aiohttp beautifulsoup4 httpx pydantic || {
    echo "Using pip with --user flag..."
    pip3 install --user --quiet fastapi uvicorn python-multipart aiohttp beautifulsoup4 httpx pydantic
}

echo "✅ Dependencies installed"
echo ""

echo "📁 Checking for backend files..."
cd ~

# Find backend directory
if [ -d "rankbeacon-seo-exorcist/backend" ]; then
    cd rankbeacon-seo-exorcist/backend
    echo "✅ Found backend in: $(pwd)"
elif [ -d "backend" ]; then
    cd backend
    echo "✅ Found backend in: $(pwd)"
else
    echo "❌ Backend directory not found!"
    echo "Available directories:"
    ls -la ~
    exit 1
fi

# Check which backend file exists
if [ -f "simple_main.py" ]; then
    BACKEND_FILE="simple_main"
    echo "✅ Using simple_main.py"
elif [ -f "main.py" ]; then
    BACKEND_FILE="main"
    echo "✅ Using main.py"
else
    echo "❌ No backend file found!"
    ls -la
    exit 1
fi

echo ""
echo "🔄 Stopping old processes..."
pkill -f "uvicorn.*8000" 2>/dev/null || true
sleep 2

echo ""
echo "🚀 Starting backend..."
# Add .local/bin to PATH for this session
export PATH="$HOME/.local/bin:$PATH"
nohup python3 -m uvicorn ${BACKEND_FILE}:app --host 0.0.0.0 --port 8000 > /tmp/backend.log 2>&1 &

echo "⏳ Waiting for backend to start..."
sleep 5

# Test backend
if curl -s http://localhost:8000/api/health > /dev/null 2>&1; then
    echo "✅ Backend is running!"
    curl -s http://localhost:8000/api/health
else
    echo "❌ Backend failed to start"
    echo ""
    echo "Logs:"
    tail -20 /tmp/backend.log
    exit 1
fi

echo ""
echo "📦 Installing cloudflared..."
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
echo "🌩️  Starting Cloudflare tunnel..."
pkill cloudflared 2>/dev/null || true
sleep 2

nohup cloudflared tunnel --url http://localhost:8000 > /tmp/cloudflare-tunnel.log 2>&1 &

echo "⏳ Waiting for tunnel to initialize (20 seconds)..."
sleep 20

# Get tunnel URL
TUNNEL_URL=$(grep -oP 'https://[a-z0-9-]+\.trycloudflare\.com' /tmp/cloudflare-tunnel.log | head -1)

if [ -z "$TUNNEL_URL" ]; then
    echo "⏳ Still waiting..."
    sleep 10
    TUNNEL_URL=$(grep -oP 'https://[a-z0-9-]+\.trycloudflare\.com' /tmp/cloudflare-tunnel.log | head -1)
fi

if [ -z "$TUNNEL_URL" ]; then
    echo "❌ Could not get tunnel URL"
    echo "Tunnel logs:"
    tail -30 /tmp/cloudflare-tunnel.log
    exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ SETUP COMPLETE!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🌐 Your HTTPS Backend URL:"
echo "   $TUNNEL_URL"
echo ""

# Save URL
mkdir -p ~/.cloudflared
echo "$TUNNEL_URL" > ~/.cloudflared/current-url.txt
cat > ~/.cloudflared/tunnel-info.txt << EOF
Tunnel URL: $TUNNEL_URL
Started: $(date)
Backend PID: $(pgrep -f "uvicorn.*8000")
Tunnel PID: $(pgrep cloudflared)

To view logs:
  Backend: tail -f /tmp/backend.log
  Tunnel: tail -f /tmp/cloudflare-tunnel.log

To restart:
  pkill -f uvicorn
  pkill cloudflared
  Then run setup script again
EOF

echo "💾 Info saved to: ~/.cloudflared/tunnel-info.txt"
echo ""

ENDSSH

echo ""
echo "3️⃣  Getting tunnel URL from EC2..."
TUNNEL_URL=$(ssh -i "$KEY_FILE" ubuntu@$EC2_IP "cat ~/.cloudflared/current-url.txt 2>/dev/null")

if [ -z "$TUNNEL_URL" ]; then
    echo "❌ Could not retrieve tunnel URL"
    exit 1
fi

echo "✅ Tunnel URL: $TUNNEL_URL"
echo ""

echo "4️⃣  Testing tunnel from internet..."
sleep 5

if curl -s "$TUNNEL_URL/api/health" > /dev/null 2>&1; then
    echo "✅ Tunnel is accessible!"
    RESPONSE=$(curl -s "$TUNNEL_URL/api/health")
    echo "   Response: $RESPONSE"
else
    echo "⚠️  Tunnel not responding yet, waiting..."
    sleep 10
    
    if curl -s "$TUNNEL_URL/api/health" > /dev/null 2>&1; then
        echo "✅ Tunnel is accessible now!"
    else
        echo "❌ Tunnel still not accessible"
        echo ""
        echo "Try testing manually:"
        echo "  curl $TUNNEL_URL/api/health"
        exit 1
    fi
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ EC2 BACKEND IS READY!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🌐 Backend URL: $TUNNEL_URL"
echo ""
echo "📝 Next: Update Vercel with this URL"
echo ""
echo "Run:"
echo "  cd frontend"
echo "  vercel env rm NEXT_PUBLIC_API_URL production --yes"
echo "  echo '$TUNNEL_URL' | vercel env add NEXT_PUBLIC_API_URL production"
echo "  vercel --prod"
echo ""
echo "Or use the quick script:"
echo "  ./update-vercel-with-tunnel.sh $TUNNEL_URL"
echo ""
