#!/bin/bash

echo "🔍 Getting EC2 Tunnel URL and Deploying Frontend"
echo "================================================"
echo ""

KEY_FILE="${1:-rankbeacon-key.pem}"
EC2_IP="18.232.139.140"

if [ ! -f "$KEY_FILE" ]; then
    echo "❌ SSH key not found: $KEY_FILE"
    echo "Usage: ./get-tunnel-and-deploy.sh your-key.pem"
    exit 1
fi

echo "1️⃣  Checking EC2 backend status..."
BACKEND_STATUS=$(ssh -i "$KEY_FILE" ubuntu@$EC2_IP "curl -s http://localhost:8000/api/health 2>/dev/null")

if [ -z "$BACKEND_STATUS" ]; then
    echo "❌ Backend not running on EC2"
    echo ""
    echo "Run this first to start backend:"
    echo "  ./setup-ec2-backend.sh $KEY_FILE"
    exit 1
fi

echo "✅ Backend is running"
echo ""

echo "2️⃣  Getting Cloudflare tunnel URL..."
TUNNEL_URL=$(ssh -i "$KEY_FILE" ubuntu@$EC2_IP "grep -oP 'https://[a-z0-9-]+\.trycloudflare\.com' /tmp/cloudflare-tunnel.log 2>/dev/null | head -1")

if [ -z "$TUNNEL_URL" ]; then
    echo "❌ No tunnel URL found"
    echo ""
    echo "Starting tunnel..."
    ssh -i "$KEY_FILE" ubuntu@$EC2_IP << 'ENDSSH'
        pkill cloudflared 2>/dev/null
        sleep 2
        nohup cloudflared tunnel --url http://localhost:8000 > /tmp/cloudflare-tunnel.log 2>&1 &
        sleep 20
        grep -oP 'https://[a-z0-9-]+\.trycloudflare\.com' /tmp/cloudflare-tunnel.log | head -1
ENDSSH
    
    TUNNEL_URL=$(ssh -i "$KEY_FILE" ubuntu@$EC2_IP "grep -oP 'https://[a-z0-9-]+\.trycloudflare\.com' /tmp/cloudflare-tunnel.log 2>/dev/null | head -1")
    
    if [ -z "$TUNNEL_URL" ]; then
        echo "❌ Still no tunnel URL"
        exit 1
    fi
fi

echo "✅ Tunnel URL: $TUNNEL_URL"
echo ""

echo "3️⃣  Testing tunnel from internet..."
if curl -s "$TUNNEL_URL/api/health" > /dev/null 2>&1; then
    echo "✅ Tunnel is accessible!"
    RESPONSE=$(curl -s "$TUNNEL_URL/api/health")
    echo "   Response: $RESPONSE"
else
    echo "❌ Tunnel not accessible from internet"
    exit 1
fi

echo ""
echo "4️⃣  Updating frontend .env.production..."
cat > frontend/.env.production << EOF
# Production Environment Variables
NEXT_PUBLIC_API_URL=$TUNNEL_URL
NEXT_PUBLIC_MCP_SERVER_URL=ws://localhost:3001
EOF

echo "✅ Updated frontend/.env.production"
echo ""

echo "5️⃣  Building frontend..."
cd frontend
npm run build 2>&1 | tail -10

if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi

echo "✅ Build successful"
echo ""

echo "6️⃣  Deploying to Vercel..."
npx vercel --prod --yes 2>&1 | tail -10

if [ $? -ne 0 ]; then
    echo "❌ Deployment failed"
    exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ DEPLOYMENT COMPLETE!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🌐 Backend URL: $TUNNEL_URL"
echo "🌐 Frontend: https://rankbeacon-exorcist.vercel.app"
echo ""
echo "Test it:"
echo "  curl $TUNNEL_URL/api/health"
echo ""
