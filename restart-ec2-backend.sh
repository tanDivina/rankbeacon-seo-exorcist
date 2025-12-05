#!/bin/bash

KEY_FILE="${1:-rankbeacon-key.pem}"
EC2_IP="18.232.139.140"

echo "🔄 Restarting EC2 Backend..."
echo ""

# Upload the clean backend
echo "1️⃣  Uploading clean backend code..."
scp -i "$KEY_FILE" backend/simple_main.py ubuntu@$EC2_IP:~/backend/simple_main.py

echo ""
echo "2️⃣  Restarting backend process..."
ssh -i "$KEY_FILE" ubuntu@$EC2_IP 'bash -s' << 'ENDSSH'
    # Kill old process
    pkill -f "uvicorn.*8000"
    sleep 2
    
    # Start new process
    cd ~/backend
    nohup python3 -m uvicorn simple_main:app --host 0.0.0.0 --port 8000 > /tmp/backend.log 2>&1 &
    
    # Wait for it to start
    sleep 5
    
    # Test it
    curl -s http://localhost:8000/api/health
ENDSSH

echo ""
echo "3️⃣  Testing from internet..."
sleep 2
TUNNEL_URL=$(ssh -i "$KEY_FILE" ubuntu@$EC2_IP "grep -oP 'https://[a-z0-9-]+\.trycloudflare\.com' /tmp/cloudflare-tunnel.log 2>/dev/null | head -1")

if [ -n "$TUNNEL_URL" ]; then
    echo "Tunnel URL: $TUNNEL_URL"
    curl -s "$TUNNEL_URL/api/health"
    echo ""
    echo ""
    echo "✅ Backend restarted successfully!"
else
    echo "⚠️  Could not find tunnel URL"
fi
