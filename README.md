# 👻 RankBeacon SEO Exorcist

> *"Banish your SEO demons with AI-powered supernatural monitoring"*

An immersive, AI-powered SEO monitoring platform that transforms traditional SEO analysis into a spooky, engaging experience. Built for the Kiroween Hackathon with advanced Kiro MCP integration.

**Created by:** Dorien Van Den Abbeele  
**LinkedIn:** [linkedin.com/in/dorien-van-den-abbeele-136170b](https://www.linkedin.com/in/dorien-van-den-abbeele-136170b/)

## 🎃 Features

### 🔮 AI-Powered SEO Analysis
- **Conversational SEO Audits** through Kiro chat interface
- **Real-time Website Crawling** with comprehensive technical analysis
- **AI Overview Optimization** for modern search features
- **Voice Search Optimization** with conversational query analysis
- **Content Gap Analysis** powered by semantic AI

### 👻 Supernatural Theme
- **Spooky UI Transformation** - SEO issues become supernatural entities
- **Ghost Entities** - 404 errors that haunt your site
- **Zombie Pages** - Orphaned pages with no internal links
- **Monster Threats** - Competitor advantages
- **Schema Specters** - Missing structured data
- **Graveyard Dashboard** - Interactive SEO health visualization

### 🤖 Advanced Kiro Integration
- **Custom MCP Server** with specialized SEO tools
- **Agent Hooks** for automated monitoring and alerts
- **Steering Documents** with SEO best practices
- **Conversational Interface** for natural SEO discussions

### 📊 Competitive Intelligence
- **Automated Competitor Monitoring** with threat assessment
- **Ranking Change Detection** with algorithm correlation
- **Content Strategy Analysis** and opportunity identification
- **Predictive Analytics** for SEO performance forecasting

## 🏗️ Architecture

```
rankbeacon-seo-exorcist/
├── frontend/          # Next.js React dashboard with spooky UI
├── backend/           # FastAPI Python server for SEO analysis
├── mcp-server/        # TypeScript MCP server for Kiro integration
└── docker-compose.yml # Development environment setup
```

### Frontend (Next.js + React)
- **Spooky UI Components** with supernatural animations
- **Interactive Graveyard Dashboard** for SEO visualization
- **Real-time Updates** via WebSocket connections
- **Responsive Design** optimized for all devices

### Backend (FastAPI + Python)
- **Website Crawling Engine** with multi-threaded analysis
- **AI Integration** with OpenAI/Anthropic APIs
- **Competitive Analysis** algorithms
- **PostgreSQL + Redis** for data persistence and caching

### MCP Server (TypeScript)
- **Kiro Tool Integration** for conversational SEO
- **Real-time Communication** with backend services
- **Intelligent Response Formatting** for SEO insights
- **Context-Aware Guidance** through steering documents

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.9+
- Docker & Docker Compose
- Kiro IDE

### Installation

1. **Clone and setup**
   ```bash
   cd rankbeacon-seo-exorcist
   npm run install:all
   ```

2. **Install Playwright for JavaScript Rendering** (Required for React/Vue/Angular sites)
   ```bash
   cd backend
   pip3 install -r requirements.txt
   playwright install chromium
   ```
   
   See [backend/INSTALL_PLAYWRIGHT.md](backend/INSTALL_PLAYWRIGHT.md) for detailed instructions.

3. **Environment Configuration**
   ```bash
   cp .env.example .env
   # Add your API keys for OpenAI, Google Search Console, etc.
   ```

4. **Start Development Environment**
   ```bash
   # Option 1: Full stack with Docker
   docker-compose up -d
   
   # Option 2: Individual services
   npm run dev
   ```

5. **Configure Kiro MCP Integration**
   ```bash
   # Add to your Kiro MCP configuration
   {
     "mcpServers": {
       "rankbeacon": {
         "command": "node",
         "args": ["./mcp-server/dist/index.js"],
         "env": {
           "RANKBEACON_API_URL": "http://localhost:8000"
         }
       }
     }
   }
   ```

## 🔌 REST API

RankBeacon provides a REST API for programmatic SEO analysis:

```bash
curl -X POST https://autumn-dodge-probability-borders.trycloudflare.com/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"url":"example.com","depth":3,"include_competitors":true}'
```

**Full API Documentation:** See [GITHUB_README.md](GITHUB_README.md#-rest-api) for detailed examples, response formats, and entity types.

## 🎯 Usage

### Through Kiro Chat
```
You: Scan example.com for SEO issues
Kiro: 👻 Summoning the SEO spirits to analyze your domain...

🏚️ HAUNTING REPORT for example.com
Haunting Score: 23/100 (Very Haunted! 😱)

👻 GHOSTS DETECTED (404 Errors):
- /old-product-page (haunting since 2023)
- /broken-link-1 (recently deceased)

🧟 ZOMBIES FOUND (Orphaned Pages):
- /isolated-blog-post (no internal links)
- /forgotten-landing-page (lost in the void)

🔮 EXORCISM RECOMMENDATIONS:
1. Redirect ghost pages to relevant content
2. Add internal links to zombie pages
3. Update sitemap to guide lost souls

Would you like me to perform an exorcism? 🕯️
```

### Dashboard Interface
- **Graveyard Overview** - Visual SEO health landscape
- **Entity Management** - Click to exorcise specific issues
- **Competitive Monitoring** - Track monster threats
- **Historical Analytics** - Performance over time

### Automated Monitoring
- **Daily Health Checks** via agent hooks
- **Algorithm Update Detection** with impact analysis
- **Competitor Movement Alerts** when threats emerge
- **Content Gap Notifications** for new opportunities

## 🛠️ Development

### Project Structure
```
frontend/
├── src/
│   ├── components/     # Spooky UI components
│   ├── pages/         # Next.js pages
│   ├── hooks/         # React hooks for SEO data
│   └── styles/        # Supernatural styling
├── public/            # Static assets and animations
└── package.json

backend/
├── app/
│   ├── core/          # SEO analysis engines
│   ├── services/      # Business logic
│   ├── models/        # Data models
│   └── api/           # FastAPI endpoints
├── requirements.txt
└── main.py

mcp-server/
├── src/
│   ├── tools/         # MCP tool implementations
│   ├── handlers/      # Request handlers
│   └── types/         # TypeScript definitions
├── package.json
└── tsconfig.json
```

### Available Scripts
- `npm run dev` - Start all services in development mode
- `npm run build` - Build all components for production
- `npm run test` - Run test suites across all services
- `npm run lint` - Code quality checks

## 🎭 Spooky Features

### Supernatural Entities
- **👻 Ghosts** - 404 errors with floating animations
- **🧟 Zombies** - Orphaned pages that shamble around
- **👹 Monsters** - Competitor threats that lurk
- **👻 Specters** - Schema markup issues
- **🌫️ Phantoms** - Content gaps and opportunities

### Interactive Elements
- **🕯️ Exorcism Actions** - Fix SEO issues with guided steps
- **📜 Obituary Reports** - Comprehensive SEO audits
- **🌙 Moon Phases** - Algorithm update timeline
- **⚰️ Tombstone Metrics** - Key performance indicators

## 🏆 Hackathon Features

### Kiro Integration Showcase
- **Advanced MCP Server** with 15+ specialized SEO tools
- **Conversational SEO Analysis** through natural language
- **Agent Hooks** for automated monitoring workflows
- **Dynamic Steering** based on website characteristics

### AI-Powered Innovation
- **Semantic Content Analysis** for gap identification
- **Predictive SEO Modeling** with confidence intervals
- **Algorithm Impact Correlation** with recovery strategies
- **Voice Search Optimization** for conversational queries

### Unique Value Proposition
- **Gamified SEO Monitoring** makes technical analysis engaging
- **Supernatural Storytelling** creates memorable user experience
- **AI-First Approach** leverages latest language models
- **Kiro-Native Design** showcases platform capabilities

## 📊 Technical Specifications

### Performance
- **Sub-30s Website Crawling** for comprehensive analysis
- **Real-time Updates** via WebSocket connections
- **Scalable Architecture** with containerized services
- **Caching Strategy** for optimal response times

### Security
- **API Key Management** with environment variables
- **Rate Limiting** to prevent abuse
- **Input Validation** for all user inputs
- **Secure Communication** between services

### Monitoring
- **Health Checks** for all services
- **Error Tracking** with detailed logging
- **Performance Metrics** collection
- **Uptime Monitoring** for reliability

## 🎃 Contributing

This is a hackathon project, but we welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---

*Built with 💀 for the Kiroween Hackathon*

**Ready to exorcise your SEO demons?** 👻✨
