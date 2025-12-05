#!/bin/bash

KEY_FILE="${1:-rankbeacon-key.pem}"
EC2_IP="18.232.139.140"

echo "🚀 Starting backend with Google API credentials..."

# Upload backend
scp -i "$KEY_FILE" backend/simple_main.py ubuntu@$EC2_IP:~/backend/simple_main.py

# Start backend with environment variables
ssh -i "$KEY_FILE" ubuntu@$EC2_IP 'bash -s' << 'ENDSSH'
    cd ~/backend
    
    # Kill old process
    pkill -f "uvicorn.*8000"
    sleep 2
    
    # Start with Google API credentials
    GOOGLE_API_KEY="AIzaSyAxF6QqZCnbD-4x1qM-FOQCl-8NrRoeY0I" \
    GOOGLE_CSE_ID="b0c9bb4f214994348" \
    nohup python3 -m uvicorn simple_main:app --host 0.0.0.0 --port 8000 > /tmp/backend.log 2>&1 &
    
    sleep 3
    curl -s http://localhost:8000/api/health
ENDSSH

echo ""
echo "✅ Backend started with Google API integration!"
echo ""
echo "Test competitor analysis:"
echo "  curl 'https://autumn-dodge-probability-borders.trycloudflare.com/api/analyze' -X POST -H 'Content-Type: application/json' -d '{\"url\":\"example.com\",\"include_competitors\":true}'"
