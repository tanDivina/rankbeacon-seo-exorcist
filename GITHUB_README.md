# 👻 RankBeacon SEO Exorcist

> Exorcise your SEO demons with AI-powered haunting scores and real-time threat detection 🎃

[![Live Demo](https://img.shields.io/badge/demo-live-success)](https://rankbeacon-exorcist-pneeb3u6t-dorien-van-den-abbeeles-projects.vercel.app)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Built with Kiro](https://img.shields.io/badge/Built%20with-Kiro-purple)](https://kiro.ai)

**Created by:** Dorien Van Den Abbeele  
**LinkedIn:** [linkedin.com/in/dorien-van-den-abbeele-136170b](https://www.linkedin.com/in/dorien-van-den-abbeele-136170b/)

**RankBeacon** transforms boring SEO analysis into a supernatural adventure. Hunt ghosts (404 errors), track zombies (orphaned pages), and battle monsters (competitor threats) with AI-powered insights.

## 🎃 Features

- **🏚️ Haunting Score:** Overall SEO health (0-100)
- **👻 Ghost Detection:** Find and fix 404 errors and broken links
- **🧟 Zombie Tracking:** Discover orphaned pages with no internal links
- **👹 Monster Analysis:** Track competitor threats and ranking opportunities
- **🌫️ Phantom Opportunities:** Identify content gaps and missed keywords
- **🤖 AI-Powered Insights:** Context-aware recommendations using Google Gemini
- **📊 Predictive Analytics:** Forecast SEO trends and opportunities
- **♿ Accessibility First:** WCAG 2.1 AA compliant
- **🎨 Spooky UX:** Animated bats, spider webs, sound effects, and more!

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.10+
- Google Gemini API key

### Installation

```bash
# Clone the repository
git clone https://github.com/tandivina/rankbeacon-seo-exorcist.git
cd rankbeacon-seo-exorcist

# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Add your GOOGLE_API_KEY to .env
```

### Run Locally

```bash
# Terminal 1 - Start backend
cd backend
python -m uvicorn simple_main:app --reload --port 8000

# Terminal 2 - Start frontend
cd frontend
npm run dev
```

Visit `http://localhost:3000` and start exorcising! 👻

## 🛠️ Tech Stack

**Frontend:**
- Next.js 14 (React)
- TypeScript
- Tailwind CSS
- Web Audio API

**Backend:**
- FastAPI (Python)
- aiohttp (async HTTP)
- BeautifulSoup4 (HTML parsing)
- Google Gemini AI

**Deployment:**
- Vercel (Frontend)
- AWS EC2 (Backend)
- Cloudflare Tunnel (HTTPS)
- Docker

## 📁 Project Structure

```
rankbeacon-seo-exorcist/
├── .kiro/                    # Kiro AI steering files (DO NOT GITIGNORE!)
│   └── steering/
│       ├── seo-best-practices.md
│       ├── knowledge-base.md
│       └── competitive-analysis.md
├── frontend/                 # Next.js frontend
│   ├── src/
│   │   ├── app/             # Next.js app router
│   │   ├── components/      # React components
│   │   └── utils/           # Utilities
│   └── package.json
├── backend/                  # FastAPI backend
│   ├── main.py              # Full backend with Playwright
│   ├── simple_main.py       # Lightweight backend
│   ├── predictive_analytics.py
│   └── requirements.txt
├── LICENSE                   # MIT License
└── README.md
```

## 🎮 How to Use

1. **Enter a URL** to analyze (e.g., `https://example.com`)
2. **Click "Exorcise This Site"** to start the analysis
3. **View your Haunting Score** and detected entities
4. **Expand each issue** to see AI-powered fix suggestions
5. **Mark issues as fixed** to track your progress
6. **Share your results** on social media or copy the report

## 🔌 REST API

RankBeacon provides a REST API for programmatic access.

> **Note:** The API only accepts POST requests. Opening the URL in a browser will show "Method Not Allowed" - use curl or an API client instead.

### Analyze Endpoint

**URL:** `https://autumn-dodge-probability-borders.trycloudflare.com/api/analyze`  
**Method:** `POST`  
**Content-Type:** `application/json`

**Request Body:**
```json
{
  "url": "https://example.com",
  "depth": 3,
  "include_competitors": true,
  "use_js_rendering": false
}
```

### Response

```json
{
  "url": "https://example.com",
  "haunting_score": 42,
  "entities": [
    {
      "type": "ghost",
      "severity": "critical",
      "title": "Missing Page Title",
      "description": "No title tag found - critical for SEO",
      "url": "https://example.com",
      "fix_suggestion": "Add a descriptive <title> tag",
      "suggested_code": "<title>Your Page Title</title>"
    }
  ],
  "recommendations": [
    "Optimize your title tags and meta descriptions",
    "Ensure all images have descriptive alt text"
  ],
  "pages_analyzed": 3,
  "total_issues": 12
}
```

### Entity Types

- **👻 ghost** - Critical missing elements (404s, missing meta tags)
- **🧟 zombie** - Structural issues (orphaned pages, broken links)
- **👹 monster** - Competitor threats (from Google Search API)
- **💀 specter** - Technical SEO issues (schema, performance)
- **🌫️ phantom** - Content gaps (missing alt text, thin content)

### Example Usage

**Basic Analysis:**
```bash
curl -X POST https://autumn-dodge-probability-borders.trycloudflare.com/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"url":"example.com","depth":1}'
```

**With Competitor Analysis (Google Search API):**
```bash
curl -X POST https://autumn-dodge-probability-borders.trycloudflare.com/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"url":"example.com","depth":3,"include_competitors":true}'
```

**JavaScript Rendering for SPAs:**
```bash
curl -X POST https://autumn-dodge-probability-borders.trycloudflare.com/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"url":"example.com","use_js_rendering":true}'
```

**Test it now:**
```bash
# Quick test - should return results in ~2 seconds
curl -X POST https://autumn-dodge-probability-borders.trycloudflare.com/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"url":"example.com","depth":1}' | python3 -m json.tool
```

### Use Cases

**1. CI/CD Integration**
```yaml
# .github/workflows/seo-check.yml
- name: SEO Health Check
  run: |
    curl -X POST https://your-api/api/analyze \
      -H "Content-Type: application/json" \
      -d '{"url":"${{ env.PRODUCTION_URL }}","depth":3}' \
      | jq '.haunting_score' > seo-score.txt
```

**2. Monitoring Dashboard**
```python
# Monitor multiple sites daily
sites = ['site1.com', 'site2.com', 'site3.com']
for site in sites:
    response = requests.post(api_url, json={'url': site, 'depth': 1})
    score = response.json()['haunting_score']
    send_alert_if_score_drops(site, score)
```

**3. Client Reporting**
```javascript
// Generate weekly SEO reports for clients
const clients = await getClients();
for (const client of clients) {
  const analysis = await analyzeSite(client.url);
  await sendReport(client.email, analysis);
}
```

**4. Bulk Analysis**
```bash
# Analyze all pages in sitemap
cat sitemap.txt | while read url; do
  curl -X POST https://your-api/api/analyze \
    -H "Content-Type: application/json" \
    -d "{\"url\":\"$url\",\"depth\":1}" >> results.json
done
```

**5. Slack/Discord Bot**
```python
# SEO bot for team notifications
@bot.command()
async def check_seo(ctx, url: str):
    result = analyze_site(url)
    await ctx.send(f"SEO Score: {result['haunting_score']}/100\n"
                   f"Issues found: {len(result['entities'])}")
```

### Rate Limits

- Free tier: 100 requests/day
- Competitor analysis uses Google Custom Search API (100 searches/day free)
- No authentication required (for now)

## 🧪 Testing

```bash
# Frontend tests
cd frontend
npm test

# Backend tests
cd backend
pytest
```

## 🚢 Deployment

### Deploy Frontend to Vercel
```bash
cd frontend
vercel --prod
```

### Deploy Backend to AWS EC2
```bash
# See DEPLOYMENT_GUIDE.md for detailed instructions
./deploy-aws-free.sh
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🏆 Built with Kiro AI

This project was built using [Kiro AI](https://kiro.ai), an AI-powered development assistant. The `.kiro/` directory contains:
- **Steering files:** SEO best practices and knowledge base
- **Context:** Project-specific guidance for AI assistance

**Note:** The `.kiro/` directory is intentionally NOT in `.gitignore` to demonstrate Kiro usage.

## 🎃 Acknowledgments

- Built for the Kiro AI Hackathon
- Powered by Google Gemini AI
- Inspired by the need to make SEO analysis less boring

## 📧 Contact

- GitHub: [@tandivina](https://github.com/tandivina)
- Live Demo: [RankBeacon SEO Exorcist](https://rankbeacon-exorcist-pneeb3u6t-dorien-van-den-abbeeles-projects.vercel.app)

---

**"Because your SEO shouldn't be scary... well, maybe a little scary."** 🦇
