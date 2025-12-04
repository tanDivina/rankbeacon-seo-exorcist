#!/bin/bash

echo "🔍 Checking EC2 Backend & Tunnel Status"
echo "========================================"
echo ""

EC2_IP="18.232.139.140"
KEY_FILE="your-key.pem"

# Check if we can SSH
echo "1. Testing SSH connection..."
if ssh -i "$KEY_FILE" -o ConnectTimeout=5 ubuntu@$EC2_IP "echo 'SSH OK'" 2>/dev/null; then
    echo "   ✅ SSH connection working"
else
    echo "   ❌ Cannot SSH to EC2"
    echo "   Make sure: ssh -i $KEY_FILE ubuntu@$EC2_IP works"
    exit 1
fi

echo ""
echo "2. Checking backend process..."
BACKEND_STATUS=$(ssh -i "$KEY_FILE" ubuntu@$EC2_IP "curl -s http://localhost:8000/api/health 2>/dev/null")
if [ -n "$BACKEND_STATUS" ]; then
    echo "   ✅ Backend is running on port 8000"
    echo "   Response: $BACKEND_STATUS"
else
    echo "   ❌ Backend NOT running on port 8000"
    echo ""
    echo "   Starting backend..."
    ssh -i "$KEY_FILE" ubuntu@$EC2_IP << 'ENDSSH'
        cd ~/rankbeacon-seo-exorcist/backend 2>/dev/null || cd ~/backend 2>/dev/null || cd ~
        
        # Kill existing
        pkill -f "uvicorn.*8000" 2>/dev/null
        
        # Check if simple_main.py exists
        if [ -f "simple_main.py" ]; then
            echo "   Found simple_main.py, starting..."
            nohup python3 -m uvicorn simple_main:app --host 0.0.0.0 --port 8000 > /tmp/backend.log 2>&1 &
        elif [ -f "main.py" ]; then
            echo "   Found main.py, starting..."
            nohup python3 -m uvicorn main:app --host 0.0.0.0 --port 8000 > /tmp/backend.log 2>&1 &
        else
            echo "   ❌ Cannot find backend file"
            exit 1
        fi
        
        sleep 3
        curl -s http://localhost:8000/api/health
ENDSSH
fi

echo ""
echo "3. Checking Cloudflare tunnel..."
TUNNEL_RUNNING=$(ssh -i "$KEY_FILE" ubuntu@$EC2_IP "pgrep -f cloudflared")
if [ -n "$TUNNEL_RUNNING" ]; then
    echo "   ✅ Cloudflare tunnel process running (PID: $TUNNEL_RUNNING)"
    
    # Get tunnel URL
    TUNNEL_URL=$(ssh -i "$KEY_FILE" ubuntu@$EC2_IP "grep -oP 'https://[a-z0-9-]+\.trycloudflare\.com' /tmp/cloudflare-tunnel.log 2>/dev/null | head -1")
    
    if [ -n "$TUNNEL_URL" ]; then
        echo "   🌐 Tunnel URL: $TUNNEL_URL"
        
        echo ""
        echo "4. Testing tunnel from outside..."
        if curl -s "$TUNNEL_URL/api/health" > /dev/null 2>&1; then
            echo "   ✅ Tunnel is accessible from internet!"
            echo ""
            echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
            echo "✅ Everything is working!"
            echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
            echo ""
            echo "Use this URL for Vercel:"
            echo "   $TUNNEL_URL"
            echo ""
            echo "Update Vercel:"
            echo "   ./update-vercel-with-tunnel.sh $TUNNEL_URL"
        else
            echo "   ❌ Tunnel not accessible from internet"
            echo "   Tunnel might be starting up, wait 10 seconds and try again"
        fi
    else
        echo "   ⚠️  Cannot find tunnel URL in logs"
        echo "   Tunnel might be starting, check: /tmp/cloudflare-tunnel.log"
    fi
else
    echo "   ❌ Cloudflare tunnel NOT running"
    echo ""
    echo "   Starting tunnel..."
    ssh -i "$KEY_FILE" ubuntu@$EC2_IP << 'ENDSSH'
        # Kill any existing tunnel
        pkill cloudflared 2>/dev/null
        
        # Start new tunnel
        nohup cloudflared tunnel --url http://localhost:8000 > /tmp/cloudflare-tunnel.log 2>&1 &
        
        echo "   Waiting for tunnel to start..."
        sleep 15
        
        # Get URL
        TUNNEL_URL=$(grep -oP 'https://[a-z0-9-]+\.trycloudflare\.com' /tmp/cloudflare-tunnel.log | head -1)
        
        if [ -n "$TUNNEL_URL" ]; then
            echo "   ✅ Tunnel started: $TUNNEL_URL"
        else
            echo "   ⚠️  Tunnel starting, check logs:"
            tail -10 /tmp/cloudflare-tunnel.log
        fi
ENDSSH
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "To get tunnel URL:"
echo "   ssh -i $KEY_FILE ubuntu@$EC2_IP \"cat ~/.cloudflared/tunnel-info.txt\""
echo ""
echo "To view logs:"
echo "   ssh -i $KEY_FILE ubuntu@$EC2_IP \"tail -f /tmp/cloudflare-tunnel.log\""
echo ""
echo "To restart everything:"
echo "   ssh -i $KEY_FILE ubuntu@$EC2_IP"
echo "   Then run: ./setup-cloudflare-tunnel.sh"
echo ""
