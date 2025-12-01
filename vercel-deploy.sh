#!/bin/bash

echo "🎃 Deploying RankBeacon Frontend to Vercel..."
echo ""

cd frontend

# Set environment variables for Vercel
export NEXT_PUBLIC_API_URL="http://18.232.139.140:8000"
export NEXT_PUBLIC_MCP_SERVER_URL="ws://18.232.139.140:3001"

echo "📦 Building and deploying..."
vercel --prod \
  --yes \
  --env NEXT_PUBLIC_API_URL="http://18.232.139.140:8000" \
  --env NEXT_PUBLIC_MCP_SERVER_URL="ws://18.232.139.140:3001"

echo ""
echo "✅ Deployment complete!"
echo ""
echo "Your frontend is now live on Vercel!"
echo "Check the URL above to access your site."
