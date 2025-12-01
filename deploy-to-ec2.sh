#!/bin/bash

# Deploy RankBeacon to EC2 instance

set -e

INSTANCE_IP="18.232.139.140"
KEY_FILE="rankbeacon-key.pem"

echo "👻 Deploying RankBeacon to EC2..."
echo ""

# Create deployment package (exclude unnecessary files)
echo "📦 Creating deployment package..."
tar -czf rankbeacon-deploy.tar.gz \
    --exclude='node_modules' \
    --exclude='.next' \
    --exclude='__pycache__' \
    --exclude='.pytest_cache' \
    --exclude='*.pyc' \
    --exclude='.git' \
    --exclude='*.tar.gz' \
    --exclude='*.pem' \
    backend/ frontend/ mcp-server/ docker-compose.yml .env.example

echo "✅ Package created"
echo ""

# Wait for instance to be ready
echo "⏳ Waiting for instance to be ready..."
sleep 30

# Copy files to EC2
echo "📤 Uploading files to EC2..."
scp -i $KEY_FILE -o StrictHostKeyChecking=no rankbeacon-deploy.tar.gz ubuntu@$INSTANCE_IP:~/

# SSH and deploy
echo "🚀 Setting up application on EC2..."
ssh -i $KEY_FILE -o StrictHostKeyChecking=no ubuntu@$INSTANCE_IP << 'ENDSSH'
set -e

# Extract files
cd ~
tar -xzf rankbeacon-deploy.tar.gz
rm rankbeacon-deploy.tar.gz

# Create .env file
if [ ! -f .env ]; then
    cp .env.example .env
    echo "ALLOWED_ORIGINS=*" >> .env
    echo "PYTHONUNBUFFERED=1" >> .env
fi

# Wait for Docker to be ready
echo "Waiting for Docker..."
for i in {1..30}; do
    if docker ps &> /dev/null; then
        echo "Docker is ready!"
        break
    fi
    sleep 2
done

# Start services
echo "Starting Docker Compose..."
docker compose up -d

# Wait for services to start
sleep 10

# Check status
echo ""
echo "Service status:"
docker compose ps

echo ""
echo "Setup complete!"
ENDSSH

echo ""
echo "✅ Deployment complete!"
echo ""
echo "🔗 Your app is running at:"
echo "   Frontend: http://$INSTANCE_IP:3000"
echo "   Backend: http://$INSTANCE_IP:8000"
echo "   API Docs: http://$INSTANCE_IP:8000/api/docs"
echo ""
echo "📝 To check logs:"
echo "   ssh -i $KEY_FILE ubuntu@$INSTANCE_IP 'docker compose logs -f'"
echo ""
echo "🎃 Happy haunting!"

# Cleanup
rm rankbeacon-deploy.tar.gz
