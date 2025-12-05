# Google Custom Search API Setup (Optional)

RankBeacon can use Google Custom Search API to find real competitors ranking for your keywords. This is **completely optional** - the app works great without it using smart heuristics.

## Benefits of Adding Google API

- 🎯 Find **real competitors** ranking for your keywords
- 📊 Get actual competitor URLs and titles
- 🔍 More accurate competitive analysis

## Free Tier

- ✅ **100 searches/day FREE**
- After that: $5 per 1,000 queries
- Perfect for demos and early users

## Setup Steps (5 minutes)

### 1. Get Google API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select existing)
3. Enable **Custom Search API**:
   - Go to "APIs & Services" → "Library"
   - Search for "Custom Search API"
   - Click "Enable"
4. Create credentials:
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "API Key"
   - Copy your API key

### 2. Create Custom Search Engine

1. Go to [Programmable Search Engine](https://programmablesearchengine.google.com/)
2. Click "Add" to create new search engine
3. Configure:
   - **Sites to search**: Select "Search the entire web"
   - **Name**: RankBeacon Competitor Search
4. Click "Create"
5. Copy your **Search Engine ID** (looks like: `a1b2c3d4e5f6g7h8i`)

### 3. Add to EC2 Backend

SSH into your EC2 instance and set environment variables:

```bash
ssh -i rankbeacon-key.pem ubuntu@18.232.139.140

# Add to ~/.bashrc or ~/.profile
echo 'export GOOGLE_API_KEY="your-api-key-here"' >> ~/.bashrc
echo 'export GOOGLE_SEARCH_ENGINE_ID="your-search-engine-id"' >> ~/.bashrc

# Reload
source ~/.bashrc

# Restart backend
pkill -f uvicorn
cd ~/backend
nohup python3 -m uvicorn simple_main:app --host 0.0.0.0 --port 8000 > /tmp/backend.log 2>&1 &
```

### 4. Test It

```bash
curl -X POST https://your-tunnel-url.trycloudflare.com/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"url":"example.com","depth":1,"include_competitors":true}'
```

Look for "monster" entities with real competitor URLs!

## Without API Key

If you don't set up the API, RankBeacon will:
- ✅ Still work perfectly
- ✅ Use smart heuristics to detect competitive gaps
- ✅ Generate helpful competitor insights
- ❌ Won't show actual competitor URLs

## Cost Monitoring

- Check usage: [Google Cloud Console](https://console.cloud.google.com/) → Billing
- Set budget alerts to avoid surprises
- 100 free queries/day = ~30-50 site analyses

## Security

- Never commit API keys to git
- Use environment variables only
- Rotate keys if exposed
- Set up API key restrictions in Google Cloud Console

## Troubleshooting

**"No competitors found"**
- Check API key is set: `echo $GOOGLE_API_KEY`
- Verify Search Engine ID: `echo $GOOGLE_SEARCH_ENGINE_ID`
- Check backend logs: `tail -f /tmp/backend.log`

**"API quota exceeded"**
- You've used your 100 free queries today
- Wait until tomorrow or upgrade to paid tier
- App will fall back to heuristic analysis

## Alternative: SerpAPI

If you prefer SerpAPI instead:

1. Sign up at [SerpAPI](https://serpapi.com/)
2. Get your API key (100 searches/month free)
3. Modify `backend/simple_main.py` to use SerpAPI endpoint

```python
# Replace Google API call with:
search_url = "https://serpapi.com/search"
params = {
    'api_key': os.getenv('SERPAPI_KEY'),
    'q': keywords,
    'num': 5
}
```

---

**Questions?** The app works great without this - only add it if you want real competitor data!
