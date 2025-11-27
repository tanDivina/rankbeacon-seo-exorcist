# Installing Playwright for JavaScript Rendering

## Quick Setup

1. **Install Python dependencies:**
   ```bash
   cd backend
   pip3 install -r requirements.txt
   ```

2. **Install Playwright browsers:**
   ```bash
   playwright install chromium
   ```
   
   Or install all browsers:
   ```bash
   playwright install
   ```

## What Gets Installed

Playwright will download:
- Chromium browser (~170MB)
- Required system dependencies

## Troubleshooting

### Permission Issues on macOS/Linux
```bash
sudo playwright install-deps
```

### Docker Installation
If running in Docker, add to your Dockerfile:
```dockerfile
RUN pip install playwright && playwright install --with-deps chromium
```

### Minimal Installation
For production, only install Chromium:
```bash
playwright install chromium --with-deps
```

## Verifying Installation

Test that Playwright works:
```bash
python3 -c "from playwright.sync_api import sync_playwright; print('✅ Playwright installed!')"
```

## Usage in RankBeacon

Once installed, the backend will automatically use Playwright to render JavaScript-heavy sites when the "Enable JavaScript Rendering" option is checked in the frontend.

This allows scanning of:
- React/Vue/Angular SPAs
- Next.js/Nuxt.js apps
- Any JavaScript-rendered content
