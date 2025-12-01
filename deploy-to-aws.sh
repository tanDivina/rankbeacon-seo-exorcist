#!/bin/bash
set -e

echo "🚀 RankBeacon AWS Deployment Script"
echo "===================================="

# Configuration
AWS_REGION="us-east-1"
AWS_ACCOUNT_ID="257455992303"
BACKEND_REPO_NAME="rankbeacon-backend"
APP_NAME="rankbeacon-seo-exorcist"

echo ""
echo "📦 Step 1: Creating ECR Repository for Backend..."
aws ecr describe-repositories --repository-names $BACKEND_REPO_NAME --region $AWS_REGION 2>/dev/null || \
aws ecr create-repository --repository-name $BACKEND_REPO_NAME --region $AWS_REGION

echo ""
echo "🔐 Step 2: Logging into ECR..."
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com

echo ""
echo "🏗️  Step 3: Building Backend Docker Image..."
cd backend
docker build -t $BACKEND_REPO_NAME:latest .
cd ..

echo ""
echo "🏷️  Step 4: Tagging Image..."
docker tag $BACKEND_REPO_NAME:latest $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$BACKEND_REPO_NAME:latest

echo ""
echo "⬆️  Step 5: Pushing Image to ECR..."
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$BACKEND_REPO_NAME:latest

echo ""
echo "✅ Backend image pushed successfully!"
echo ""
echo "📝 Next Steps:"
echo "=============="
echo ""
echo "1. Create App Runner Service (Backend):"
echo "   - Go to: https://console.aws.amazon.com/apprunner/home?region=$AWS_REGION#/create"
echo "   - Source: Container registry → Amazon ECR"
echo "   - Image URI: $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$BACKEND_REPO_NAME:latest"
echo "   - Port: 8000"
echo "   - CPU: 1 vCPU, Memory: 2 GB"
echo "   - Environment variables:"
echo "     ALLOWED_ORIGINS=*"
echo "     PYTHONUNBUFFERED=1"
echo ""
echo "2. Create Amplify App (Frontend):"
echo "   - Go to: https://console.aws.amazon.com/amplify/home?region=$AWS_REGION#/"
echo "   - Click 'New app' → 'Host web app'"
echo "   - Connect GitHub repository: tanDivina/rankbeacon-seo-exorcist"
echo "   - Branch: main"
echo "   - Root directory: frontend"
echo "   - Add environment variable:"
echo "     NEXT_PUBLIC_API_URL=<your-app-runner-url>"
echo ""
echo "🎉 Deployment preparation complete!"
