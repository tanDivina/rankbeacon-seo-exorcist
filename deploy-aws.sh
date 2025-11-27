#!/bin/bash

# RankBeacon SEO Exorcist - AWS Deployment Script
# Deploys to AWS App Runner (Backend) + AWS Amplify (Frontend)

set -e

echo "👻 RankBeacon SEO Exorcist - AWS Deployment"
echo "============================================"
echo ""

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI is not installed"
    echo "Install it with: brew install awscli (macOS) or visit https://aws.amazon.com/cli/"
    exit 1
fi

# Check if AWS is configured
if ! aws sts get-caller-identity &> /dev/null; then
    echo "❌ AWS CLI is not configured"
    echo "Run: aws configure"
    exit 1
fi

# Get AWS account ID
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
AWS_REGION=${AWS_REGION:-us-east-1}

echo "✅ AWS Account: $AWS_ACCOUNT_ID"
echo "✅ Region: $AWS_REGION"
echo ""

# Ask for confirmation
read -p "Deploy backend to AWS App Runner? (y/n): " deploy_backend
read -p "Deploy frontend to AWS Amplify? (y/n): " deploy_frontend

if [ "$deploy_backend" = "y" ]; then
    echo ""
    echo "🔧 Deploying Backend to AWS App Runner..."
    echo "=========================================="
    
    # Create ECR repository if it doesn't exist
    echo "📦 Creating ECR repository..."
    aws ecr describe-repositories --repository-names rankbeacon-backend --region $AWS_REGION 2>/dev/null || \
        aws ecr create-repository --repository-name rankbeacon-backend --region $AWS_REGION
    
    # Get ECR login
    echo "🔐 Logging into ECR..."
    aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com
    
    # Build Docker image
    echo "🏗️  Building Docker image..."
    cd backend
    docker build -t rankbeacon-backend .
    
    # Tag image
    echo "🏷️  Tagging image..."
    docker tag rankbeacon-backend:latest $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/rankbeacon-backend:latest
    
    # Push image
    echo "⬆️  Pushing image to ECR..."
    docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/rankbeacon-backend:latest
    
    cd ..
    
    echo ""
    echo "✅ Backend image pushed to ECR!"
    echo ""
    echo "📋 Next steps for App Runner:"
    echo "1. Go to AWS Console → App Runner"
    echo "2. Create service from ECR image:"
    echo "   Image: $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/rankbeacon-backend:latest"
    echo "   Port: 8000"
    echo "   CPU: 1 vCPU, Memory: 2 GB"
    echo "   Environment variables:"
    echo "     ALLOWED_ORIGINS=*"
    echo "     PYTHONUNBUFFERED=1"
    echo ""
    echo "Or use AWS CLI:"
    echo "aws apprunner create-service \\"
    echo "  --service-name rankbeacon-backend \\"
    echo "  --source-configuration '{\"ImageRepository\":{\"ImageIdentifier\":\"$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/rankbeacon-backend:latest\",\"ImageRepositoryType\":\"ECR\",\"ImageConfiguration\":{\"Port\":\"8000\",\"RuntimeEnvironmentVariables\":{\"ALLOWED_ORIGINS\":\"*\",\"PYTHONUNBUFFERED\":\"1\"}}}}' \\"
    echo "  --instance-configuration 'Cpu=1024,Memory=2048' \\"
    echo "  --region $AWS_REGION"
    echo ""
fi

if [ "$deploy_frontend" = "y" ]; then
    echo ""
    echo "📱 Deploying Frontend to AWS Amplify..."
    echo "========================================"
    echo ""
    
    # Check if git repo is initialized
    if [ ! -d ".git" ]; then
        echo "❌ Git repository not initialized"
        echo "Run: git init && git add . && git commit -m 'Initial commit'"
        exit 1
    fi
    
    # Check if remote is set
    if ! git remote get-url origin &> /dev/null; then
        echo "❌ Git remote 'origin' not set"
        echo "Push your code to GitHub first:"
        echo "  git remote add origin https://github.com/yourusername/rankbeacon-seo-exorcist.git"
        echo "  git push -u origin main"
        exit 1
    fi
    
    echo "✅ Git repository found"
    echo ""
    echo "📋 Next steps for Amplify:"
    echo "1. Go to AWS Console → Amplify"
    echo "2. Click 'New app' → 'Host web app'"
    echo "3. Connect to GitHub"
    echo "4. Select repository: $(git remote get-url origin)"
    echo "5. Branch: $(git branch --show-current)"
    echo "6. Root directory: frontend"
    echo "7. Add environment variable:"
    echo "   NEXT_PUBLIC_API_URL=https://your-app-runner-url.awsapprunner.com"
    echo "8. Save and deploy"
    echo ""
    echo "Or use Amplify CLI:"
    echo "npm install -g @aws-amplify/cli"
    echo "amplify init"
    echo "amplify add hosting"
    echo "amplify publish"
    echo ""
fi

echo ""
echo "🎃 Deployment preparation complete!"
echo ""
echo "📝 Summary:"
echo "==========="
if [ "$deploy_backend" = "y" ]; then
    echo "✅ Backend Docker image pushed to ECR"
    echo "   → Create App Runner service in AWS Console"
fi
if [ "$deploy_frontend" = "y" ]; then
    echo "✅ Frontend ready for Amplify"
    echo "   → Connect GitHub repo in Amplify Console"
fi
echo ""
echo "💡 Tip: After deploying backend, update the frontend's NEXT_PUBLIC_API_URL"
echo "    environment variable in Amplify with your App Runner URL"
echo ""
echo "🔗 Useful links:"
echo "   App Runner: https://console.aws.amazon.com/apprunner"
echo "   Amplify: https://console.aws.amazon.com/amplify"
echo "   ECR: https://console.aws.amazon.com/ecr"
echo ""
echo "Happy haunting! 👻"
