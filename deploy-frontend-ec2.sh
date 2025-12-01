#!/bin/bash

# Deploy Frontend to EC2
INSTANCE_IP="18.232.139.140"
KEY_FILE="rankbeacon-key.pem"

echo "🎃 Deploying Frontend to EC2..."
echo ""

# Build the frontend
echo "📦 Building frontend..."
cd frontend
npm run build

# Create deployment package
echo "📦 Creating deployment package..."
cd ..
tar -czf frontend-deploy.tar.gz \
    --exclude='node_modules' \
    --exclude='.next/cache' \
    frontend/.next \
    frontend/public \
    frontend/package.json \
    frontend/next.config.js

# Upload to EC2
echo "📤 Uploading to EC2..."
scp -i $KEY_FILE -o StrictHostKeyChecking=no frontend-deploy.tar.gz ubuntu@$INSTANCE_IP:~/

# Deploy on EC2
echo "🚀 Setting up on EC2..."
ssh -i $KEY_FILE -o StrictHostKeyChecking=no ubuntu@$INSTANCE_IP << 'ENDSSH'
set -e

# Extract files
cd ~
tar -xzf frontend-deploy.tar.gz
rm frontend-deploy.tar.gz

# Install dependencies if needed
cd frontend
if [ ! -d "node_modules" ]; then
    npm install --production
fi

# Stop existing frontend if running
pkill -f "next start" || true

# Start frontend
nohup npm start > frontend.log 2>&1 &

echo "Frontend started!"
sleep 3

# Check if running
if pgrep -f "next start" > /dev/null; then
    echo "✅ Frontend is running!"
else
    echo "❌ Frontend failed to start. Check logs:"
    tail -20 frontend.log
fi
ENDSSH

# Cleanup
rm frontend-deploy.tar.gz

echo ""
echo "✅ Deployment complete!"
echo ""
echo "🔗 Your site is running at:"
echo "   http://$INSTANCE_IP:3000"
echo ""
echo "📝 To check logs:"
echo "   ssh -i $KEY_FILE ubuntu@$INSTANCE_IP 'tail -f ~/frontend/frontend.log'"
echo ""
