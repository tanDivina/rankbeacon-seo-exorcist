# 👻 RankBeacon SEO Exorcist

> Exorcise your SEO demons with AI-powered haunting scores and real-time threat detection 🎃

[![Live Demo](https://img.shields.io/badge/demo-live-success)](https://rankbeacon-exorcist-pneeb3u6t-dorien-van-den-abbeeles-projects.vercel.app)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Built with Kiro](https://img.shields.io/badge/Built%20with-Kiro-purple)](https://kiro.ai)

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
6. **Export your report** as JSON or PDF

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
