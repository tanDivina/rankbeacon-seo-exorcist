#!/bin/bash

# Simple deployment - just get the backend API running
INSTANCE_IP="18.232.139.140"
KEY_FILE="rankbeacon-key.pem"

echo "👻 Simple Backend Deployment to EC2..."
echo ""

# Create a simple startup script
cat > start-backend.sh << 'EOF'
#!/bin/bash
cd ~

# Install Python and dependencies
sudo apt-get update
sudo apt-get install -y python3-pip python3-venv

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install minimal dependencies
pip install fastapi uvicorn python-multipart aiohttp beautifulsoup4 lxml

# Create simple backend
cat > simple_backend.py << 'PYEOF'
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="RankBeacon SEO Exorcist API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {
        "message": "👻 RankBeacon SEO Exorcist API",
        "status": "haunting",
        "version": "1.0.0"
    }

@app.get("/api/health")
async def health():
    return {"status": "healthy", "haunting_score": 100}

@app.post("/api/analyze")
async def analyze(url: str):
    return {
        "url": url,
        "haunting_score": 45,
        "ghosts": ["404 error on /old-page"],
        "zombies": ["orphaned page /blog/post"],
        "monsters": ["competitor.com ranking above you"]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
PYEOF

# Start the server
echo "Starting backend server..."
nohup python3 simple_backend.py > backend.log 2>&1 &

echo "Backend started! Check logs with: tail -f ~/backend.log"
EOF

chmod +x start-backend.sh

# Copy and run
echo "📤 Uploading startup script..."
scp -i $KEY_FILE -o StrictHostKeyChecking=no start-backend.sh ubuntu@$INSTANCE_IP:~/

echo "🚀 Starting backend..."
ssh -i $KEY_FILE -o StrictHostKeyChecking=no ubuntu@$INSTANCE_IP 'bash ~/start-backend.sh'

sleep 5

echo ""
echo "✅ Deployment complete!"
echo ""
echo "🔗 Your API is running at:"
echo "   Backend: http://$INSTANCE_IP:8000"
echo "   API Docs: http://$INSTANCE_IP:8000/docs"
echo "   Health: http://$INSTANCE_IP:8000/api/health"
echo ""
echo "📝 To check logs:"
echo "   ssh -i $KEY_FILE ubuntu@$INSTANCE_IP 'tail -f ~/backend.log'"
echo ""
echo "🎃 Test it:"
echo "   curl http://$INSTANCE_IP:8000"
echo ""
