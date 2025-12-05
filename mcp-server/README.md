# 👻 RankBeacon MCP Server

Model Context Protocol server for SEO analysis integration with Kiro IDE.

## Features

- **analyze_seo**: Analyze any website for SEO issues
- **ping**: Test server connectivity

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
      "args": ["/path/to/mcp-server/dist/index.js"],
      "env": {
        "BACKEND_API_URL": "https://your-backend-url.com"
      }
    }
  }
}
```

## Testing Locally

```bash
# Build the server
npm run build

# Test with stdio
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | node dist/index.js
```

## Example Usage in Kiro

```
You: Analyze the SEO of example.com

Kiro: *uses analyze_seo tool*

Result: 
🎃 SEO Exorcism Complete!
🏚️ Haunting Score: 65/100
👻 Total Issues: 12

Top Issues:
1. Missing Meta Description (critical)
2. Title Tag Too Long (high)
3. Images Missing Alt Text (medium)
...
```

## API

### analyze_seo

Analyzes a website for SEO issues.

**Parameters:**
- `url` (string, required): Website URL to analyze
- `depth` (number, optional): Crawl depth (default: 1)
- `use_js_rendering` (boolean, optional): Enable JS rendering (default: true)

**Returns:**
- Haunting Score (0-100)
- List of issues by type (ghosts, zombies, monsters, specters, phantoms)
- Recommendations
- Link to full report

### ping

Tests if the server is running.

**Returns:**
- Success message

## Environment Variables

- `BACKEND_API_URL`: URL of the RankBeacon backend API (default: http://localhost:8000)

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
┌─────────────┐
│  Kiro IDE   │
└──────┬──────┘
       │ MCP Protocol
       │
┌──────▼──────────┐
│  MCP Server     │
│  (This Package) │
└──────┬──────────┘
       │ HTTP API
       │
┌──────▼──────────┐
│  Backend API    │
│  (FastAPI)      │
└─────────────────┘
```

## Troubleshooting

**Server not responding:**
- Check that backend API is running
- Verify BACKEND_API_URL is correct
- Check logs in Kiro's MCP panel

**Analysis fails:**
- Ensure URL is valid and accessible
- Check backend API logs
- Try with `use_js_rendering: false` for simple sites

## License

MIT
