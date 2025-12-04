#!/bin/bash

echo "🔄 Update Vercel with Cloudflare Tunnel URL"
echo "==========================================="
echo ""

# Check if tunnel URL is provided
if [ -z "$1" ]; then
    echo "Usage: ./update-vercel-with-tunnel.sh <tunnel-url>"
    echo ""
    echo "Example:"
    echo "  ./update-vercel-with-tunnel.sh https://abc-123.trycloudflare.com"
    echo ""
    echo "Get your tunnel URL from EC2:"
    echo "  ssh -i your-key.pem ubuntu@18.232.139.140"
    echo "  cat ~/.cloudflared/tunnel-info.txt"
    exit 1
fi

TUNNEL_URL=$1

# Validate URL
if [[ ! $TUNNEL_URL =~ ^https:// ]]; then
    echo "❌ URL must start with https://"
    exit 1
fi

echo "🌐 Tunnel URL: $TUNNEL_URL"
echo ""

# Test the backend
echo "🧪 Testing backend..."
if curl -s "$TUNNEL_URL/api/health" > /dev/null 2>&1; then
    echo "✅ Backend is responding"
else
    echo "⚠️  Backend not responding. Make sure tunnel is running on EC2."
    echo ""
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo ""
echo "📦 Updating Vercel environment variables..."
cd frontend

# Remove old env var
echo "Removing old NEXT_PUBLIC_API_URL..."
vercel env rm NEXT_PUBLIC_API_URL production --yes 2>/dev/null || true

# Add new env var
echo "Adding new NEXT_PUBLIC_API_URL..."
echo "$TUNNEL_URL" | vercel env add NEXT_PUBLIC_API_URL production

echo ""
echo "🚀 Redeploying to Vercel..."
vercel --prod --yes

echo ""
echo "✅ Deployment complete!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎃 Your app should now work with HTTPS backend!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Test it:"
echo "1. Open your Vercel URL in browser"
echo "2. Try analyzing a website"
echo "3. Check browser console for any errors"
echo ""
