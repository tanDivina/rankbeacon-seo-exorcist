# 👻 RankBeacon MCP Server

Model Context Protocol server for SEO analysis integration with Kiro IDE and other AI assistants.

## Features

- 🎃 **analyze_website**: Comprehensive SEO analysis with haunting scores
- 👻 **find_broken_links**: Detect 404 errors (ghosts)
- 🔮 **predict_rankings**: ML-powered ranking forecasts
- 🕵️ **detect_algorithm_updates**: Identify Google algorithm impacts
- 👹 **analyze_competitors**: Competitive threat assessment
- ⚡ **check_page_speed**: Core Web Vitals analysis
- 💡 **get_seo_recommendations**: Prioritized action items

## Installation

```bash
cd mcp-server
npm install
npm run build
```

## Usage with Kiro

Add to your `.kiro/settings/mcp.json`:

```json
{
  "mcpServers": {
    "rankbeacon-seo": {
      "command": "node",
      "args": ["/absolute/path/to/mcp-server/dist/index.js"],
      "env": {
        "BACKEND_URL": "https://rankbeacon-backend.onrender.com"
      }
    }
  }
}
```

**Important:** Use absolute paths, not relative paths!

## Example Usage in Kiro

### Basic Analysis
```
You: Analyze the SEO of example.com

Kiro: *uses analyze_website tool*

🎃 SEO EXORCISM REPORT

🏚️ Haunting Score: 65/100
⚠️ Moderately Haunted

👻 SUPERNATURAL THREATS DETECTED:

👻 GHOSTS (8 broken links):
  • /old-page returns 404
  • /missing-image.jpg not found
  ... and 6 more

🧟 ZOMBIES (3 orphaned pages):
  • /blog/old-post has no internal links
  ... and 2 more

🕯️ EXORCISM PLAN:
1. Banish ghosts (fix 404 errors)
2. Revive zombies (add internal links)
3. Dispel specters (add schema markup)
4. Strengthen defenses (improve Core Web Vitals)
```

### Predictive Analytics
```
You: Predict rankings for example.com

Kiro: *uses predict_rankings tool*

🔮 RANKING PREDICTIONS (30-Day Forecast)

📈 example keyword:
  Current: Position 15
  Predicted: Position 9.2 (85% confidence)
  Range: 7.1 - 11.3
  Trend: improving

📊 TRAFFIC FORECAST:
  Current: 1,200 visits/month
  Predicted: 2,400 visits/month
  Change: +1,200 (+100%)
```

### Algorithm Detection
```
You: Check if example.com was affected by algorithm updates

Kiro: *uses detect_algorithm_updates tool*

⚠️ ALGORITHM UPDATE DETECTED!

📅 Date: 2025-12-01
🏷️ Type: Core Algorithm Update
📊 Confidence: 87%
💥 Impact Score: -70

🕯️ RECOVERY STRATEGY:
1. Audit content quality and E-E-A-T signals
2. Review technical SEO (speed, mobile, Core Web Vitals)
3. Analyze competitor improvements
4. Update content with fresh, comprehensive information
5. Build high-quality backlinks from authoritative sources
```

### Competitor Analysis
```
You: Compare example.com to competitor.com

Kiro: *uses analyze_competitors tool*

👹 MONSTER THREAT ASSESSMENT

🏚️ Your Haunting Score: 65/100

👹 MONSTERS DETECTED:

👹👹 BETA MONSTER: competitor.com
  Haunting Score: 45/100
  Threat Level: High - They're ahead

🌫️ PHANTOM OPPORTUNITIES (Content Gaps):
  • Content depth - competitors have more comprehensive pages
  • Schema markup - competitors using structured data
  • Internal linking - competitors have better site structure

💡 QUICK WINS:
  • Add FAQ schema to capture featured snippets
  • Improve internal linking between related pages
  • Optimize images to improve page speed
```

## Available Tools

### 1. analyze_website
Comprehensive SEO analysis with haunting score, issues, and recommendations.

**Parameters:**
- `url` (string, required): Website URL to analyze
- `max_pages` (number, optional): Maximum pages to crawl (default: 10)

### 2. find_broken_links
Find all broken links (ghosts) on a website.

**Parameters:**
- `url` (string, required): Website URL to check

### 3. predict_rankings
Predict future ranking positions using ML models.

**Parameters:**
- `url` (string, required): Website URL
- `keywords` (array, optional): Keywords to predict

### 4. detect_algorithm_updates
Detect potential Google algorithm updates affecting rankings.

**Parameters:**
- `url` (string, required): Website URL

### 5. analyze_competitors
Analyze competitor SEO strategies and identify threats.

**Parameters:**
- `your_url` (string, required): Your website URL
- `competitor_urls` (array, required): Competitor URLs

### 6. check_page_speed
Analyze page speed and Core Web Vitals.

**Parameters:**
- `url` (string, required): Page URL to analyze

### 7. get_seo_recommendations
Get prioritized SEO recommendations.

**Parameters:**
- `url` (string, required): Website URL

## Testing Locally

```bash
# Build the server
npm run build

# Test with stdio
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | node dist/index.js
```

## Environment Variables

- `BACKEND_URL`: URL of the RankBeacon backend API
  - Default: `https://rankbeacon-backend.onrender.com`
  - Local dev: `http://localhost:8000`

## Development

```bash
# Watch mode
npm run dev

# Build
npm run build

# Lint
npm run lint
```

## Architecture

```
┌─────────────────┐
│   Kiro IDE      │
│   (or any MCP   │
│   AI assistant) │
└────────┬────────┘
         │ MCP Protocol (stdio)
         │
┌────────▼────────────┐
│   MCP Server        │
│   (TypeScript)      │
│   - 7 SEO tools     │
│   - Spooky theming  │
└────────┬────────────┘
         │ HTTP REST API
         │
┌────────▼────────────┐
│   Backend API       │
│   (FastAPI/Python)  │
│   - Web crawling    │
│   - ML predictions  │
│   - Algorithm detect│
└─────────────────────┘
```

## Troubleshooting

### "Backend API error: 500"
- Check that backend server is running
- Verify `BACKEND_URL` in your MCP config
- Check backend logs for errors

### "Unknown tool: xyz"
- Rebuild the MCP server: `npm run build`
- Restart Kiro to reload MCP configuration
- Check that tool name matches exactly

### "Connection refused"
- Verify backend URL is correct and accessible
- Test: `curl https://rankbeacon-backend.onrender.com/api/health`
- Check firewall settings

### Analysis takes too long
- Reduce `max_pages` parameter
- Use production backend (faster than local)
- Check if site is blocking automated access

## Real-World Use Cases

### 1. Developer Workflow
```
"Check the SEO of my staging site before deploying"
→ Catches issues pre-production
```

### 2. Content Team
```
"Analyze my new blog post at example.com/blog/new-post"
→ Instant SEO feedback for writers
```

### 3. CI/CD Integration
```bash
# In GitHub Actions
echo '{"method":"tools/call","params":{"name":"analyze_website","arguments":{"url":"$PREVIEW_URL"}}}' | \
  node mcp-server/dist/index.js
```

### 4. Competitive Intelligence
```
"How does our SEO compare to our top 3 competitors?"
→ Identify gaps and opportunities
```

### 5. Emergency Response
```
"Our traffic dropped 40%! Check for algorithm updates"
→ Rapid diagnosis and recovery plan
```

## Why This Matters

**First-Mover Advantage:**
- Only SEO tool with MCP integration
- Positioned for AI assistant ecosystem
- Works with any MCP-compatible AI (Kiro, Claude, etc.)

**Developer Experience:**
- No context switching (stay in IDE)
- Natural language interface
- Instant results with actionable fixes
- 90% faster than traditional SEO tools

**Technical Excellence:**
- Production-ready TypeScript code
- Comprehensive error handling
- Spooky themed responses
- Full backend integration

## License

MIT

---

**Built with 💜 for Kiroween Hackathon**
*Banishing SEO demons since 2025* 🎃
