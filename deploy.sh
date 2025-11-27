#!/bin/bash

# RankBeacon SEO Exorcist - Quick Deploy Script
# This script helps you deploy to various platforms

echo "👻 RankBeacon SEO Exorcist - Deployment Helper"
echo "================================================"
echo ""

# Check if we're in the right directory
if [ ! -f "README.md" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

echo "Select deployment option:"
echo "1) Vercel (Frontend) + Railway (Backend) - RECOMMENDED"
echo "2) Docker Compose (Local/VPS)"
echo "3) Build for production"
echo "4) Test deployment locally"
echo ""
read -p "Enter option (1-4): " option

case $option in
    1)
        echo ""
        echo "🚀 Deploying to Vercel + Railway"
        echo "================================"
        echo ""
        
        # Check if Vercel CLI is installed
        if ! command -v vercel &> /dev/null; then
            echo "📦 Installing Vercel CLI..."
            npm install -g vercel
        fi
        
        # Deploy frontend
        echo ""
        echo "📱 Deploying Frontend to Vercel..."
        cd frontend
        vercel --prod
        cd ..
        
        echo ""
        echo "✅ Frontend deployed!"
        echo ""
        echo "📋 Next steps for Backend:"
        echo "1. Go to https://railway.app"
        echo "2. Create new project from GitHub"
        echo "3. Select this repository"
        echo "4. Set root directory to: backend"
        echo "5. Set start command to: uvicorn main:app --host 0.0.0.0 --port \$PORT"
        echo "6. Add build command: pip install -r requirements.txt && playwright install chromium"
        echo "7. Generate domain and update frontend env var"
        echo ""
        ;;
        
    2)
        echo ""
        echo "🐳 Starting Docker Compose..."
        echo "============================="
        echo ""
        
        # Check if Docker is installed
        if ! command -v docker &> /dev/null; then
            echo "❌ Docker is not installed. Please install Docker first."
            exit 1
        fi
        
        # Build and start containers
        docker compose up -d --build
        
        echo ""
        echo "✅ Services started!"
        echo "📱 Frontend: http://localhost:3000"
        echo "🔧 Backend: http://localhost:8000"
        echo "📚 API Docs: http://localhost:8000/docs"
        echo ""
        echo "To view logs: docker compose logs -f"
        echo "To stop: docker compose down"
        echo ""
        ;;
        
    3)
        echo ""
        echo "🏗️  Building for Production..."
        echo "=============================="
        echo ""
        
        # Build frontend
        echo "📱 Building Frontend..."
        cd frontend
        npm install
        npm run build
        cd ..
        
        # Build backend
        echo "🔧 Building Backend..."
        cd backend
        pip install -r requirements.txt
        playwright install chromium
        cd ..
        
        echo ""
        echo "✅ Build complete!"
        echo "📦 Frontend build: frontend/.next"
        echo "📦 Backend ready: backend/"
        echo ""
        ;;
        
    4)
        echo ""
        echo "🧪 Testing Deployment Locally..."
        echo "================================"
        echo ""
        
        # Start backend
        echo "🔧 Starting Backend..."
        cd backend
        python3 -m uvicorn main:app --host 0.0.0.0 --port 8000 &
        BACKEND_PID=$!
        cd ..
        
        # Wait for backend to start
        sleep 3
        
        # Start frontend
        echo "📱 Starting Frontend..."
        cd frontend
        npm run dev &
        FRONTEND_PID=$!
        cd ..
        
        echo ""
        echo "✅ Services started!"
        echo "📱 Frontend: http://localhost:3000"
        echo "🔧 Backend: http://localhost:8000"
        echo ""
        echo "Press Ctrl+C to stop all services"
        
        # Wait for user interrupt
        trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT
        wait
        ;;
        
    *)
        echo "❌ Invalid option"
        exit 1
        ;;
esac

echo ""
echo "🎃 Happy Haunting! 👻"
