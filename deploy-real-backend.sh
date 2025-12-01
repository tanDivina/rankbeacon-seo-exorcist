#!/bin/bash

INSTANCE_IP="18.232.139.140"
KEY_FILE="rankbeacon-key.pem"

echo "🔧 Deploying REAL backend with actual SEO analysis..."
echo ""

# Create deployment package
echo "📦 Creating backend package..."
tar -czf backend-real.tar.gz \
    --exclude='__pycache__' \
    --exclude='*.pyc' \
    --exclude='.pytest_cache' \
    --exclude='tests' \
    backend/

# Upload to EC2
echo "📤 Uploading to EC2..."
scp -i $KEY_FILE -o StrictHostKeyChecking=no backend-real.tar.gz ubuntu@$INSTANCE_IP:~/

# Deploy on EC2
echo "🚀 Setting up real backend..."
ssh -i $KEY_FILE -o StrictHostKeyChecking=no ubuntu@$INSTANCE_IP << 'ENDSSH'
set -e

# Extract files
cd ~
tar -xzf backend-real.tar.gz
rm backend-real.tar.gz

# Install dependencies
cd ~/backend
source ~/venv/bin/activate

echo "Installing dependencies..."
pip install -q fastapi uvicorn python-multipart aiohttp beautifulsoup4 lxml playwright pydantic

# Install Playwright browsers
echo "Installing Playwright browsers (this takes a minute)..."
playwright install chromium

# Stop old backend
pkill -f "python3.*backend" || true

# Start real backend
echo "Starting real backend..."
nohup python3 main.py > ~/backend.log 2>&1 &

sleep 5

# Check if running
if pgrep -f "python3.*main.py" > /dev/null; then
    echo "✅ Real backend is running!"
    tail -10 ~/backend.log
else
    echo "❌ Backend failed to start. Logs:"
    tail -20 ~/backend.log
fi
ENDSSH

# Cleanup
rm backend-real.tar.gz

echo ""
echo "✅ Real backend deployed!"
echo ""
echo "🔗 Test it:"
echo "   curl -X POST http://$INSTANCE_IP:8000/api/analyze -H 'Content-Type: application/json' -d '{\"url\":\"example.com\"}'"
echo ""
echo "📝 Check logs:"
echo "   ssh -i $KEY_FILE ubuntu@$INSTANCE_IP 'tail -f ~/backend.log'"
echo ""
