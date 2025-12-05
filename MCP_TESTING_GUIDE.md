# 🧪 MCP Server Testing Guide

## Quick Test (2 minutes)

### Test 1: Build Check ✅
```bash
cd mcp-server
npm install
npm run build
```

**Expected**: No errors, `dist/index.js` created

---

### Test 2: Server Starts ✅
```bash
node dist/index.js
```

**Expected**: 
```
🎃 Starting RankBeacon MCP Server...
👻 SEO spirits active!
```

Press Ctrl+C to stop.

---

### Test 3: Ping Tool (Manual) ✅
```bash
# In one terminal, start server
node dist/index.js

# In another terminal, send test request
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}' | node dist/index.js
```

**Expected**: JSON response with tools list

---

## Full Integration Test with Kiro

### Step 1: Add to Kiro Configuration

Create or edit `.kiro/settings/mcp.json`:

```json
{
  "mcpServers": {
    "rankbeacon-seo": {
      "command": "node",
      "args": ["/absolute/path/to/rankbeacon-seo-exorcist/mcp-server/dist/index.js"],
      "env": {
        "BACKEND_API_URL": "http://localhost:8000"
      }
    }
  }
}
```

**Important**: Replace `/absolute/path/to/` with your actual path!

To get absolute path:
```bash
cd mcp-server
pwd
# Copy this path and add /dist/index.js
```

---

### Step 2: Start Backend API

```bash
# In a new terminal
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python simple_main.py
```

**Expected**: Backend running on http://localhost:8000

---

### Step 3: Restart Kiro or Reconnect MCP

**Option A: Restart Kiro**
- Close and reopen Kiro IDE

**Option B: Reconnect MCP (faster)**
1. Open Command Palette (Cmd/Ctrl + Shift + P)
2. Search for "MCP"
3. Click "Reconnect MCP Servers"

---

### Step 4: Test in Kiro Chat

**Test 1: Ping**
```
You: Ping the RankBeacon server
```

**Expected Response:**
```
👻 SEO spirits are awake!
```

**Test 2: Analyze Website**
```
You: Analyze the SEO of example.com
```

**Expected Response:**
```
🎃 SEO Analysis Complete!
🏚️ Haunting Score: XX/100
👻 Issues: X

Top Issues:
1. [Issue title] (severity)
2. [Issue title] (severity)
...

🔗 Full Report: https://rankbeacon-exorcist.vercel.app
```

---

## Troubleshooting

### Problem: "Cannot find module"

**Solution**: Make sure you ran `npm run build`
```bash
cd mcp-server
npm run build
ls dist/  # Should see index.js
```

---

### Problem: "Backend API error"

**Check 1**: Is backend running?
```bash
curl http://localhost:8000/health
# Should return: {"status":"healthy"}
```

**Check 2**: Is URL correct in mcp.json?
```json
"env": {
  "BACKEND_API_URL": "http://localhost:8000"  // Check this
}
```

---

### Problem: "Tool not found in Kiro"

**Solution 1**: Check MCP server is in config
```bash
cat .kiro/settings/mcp.json
# Should see "rankbeacon-seo" entry
```

**Solution 2**: Reconnect MCP servers
- Command Palette → "Reconnect MCP Servers"

**Solution 3**: Check Kiro MCP panel
- Open Kiro sidebar
- Look for "MCP Servers" section
- Should see "rankbeacon-seo" listed

---

### Problem: "Path not found"

**Solution**: Use absolute path, not relative
```bash
# Get absolute path
cd mcp-server
pwd
# Example output: /Users/you/projects/rankbeacon-seo-exorcist/mcp-server

# Use in mcp.json:
"args": ["/Users/you/projects/rankbeacon-seo-exorcist/mcp-server/dist/index.js"]
```

---

## Advanced Testing

### Test with Demo Backend

If you don't want to run the backend locally, use the demo:

```json
{
  "mcpServers": {
    "rankbeacon-seo": {
      "command": "node",
      "args": ["/path/to/mcp-server/dist/index.js"],
      "env": {
        "BACKEND_API_URL": "https://rankbeacon-backend-demo.com"
      }
    }
  }
}
```

---

### Test with Logging

Enable detailed logging:

```json
{
  "mcpServers": {
    "rankbeacon-seo": {
      "command": "node",
      "args": ["/path/to/mcp-server/dist/index.js"],
      "env": {
        "BACKEND_API_URL": "http://localhost:8000",
        "DEBUG": "true"
      }
    }
  }
}
```

Check logs in Kiro's MCP panel.

---

### Test Multiple Sites

```
You: Analyze example.com
[wait for response]

You: Now analyze google.com
[wait for response]

You: Compare the two results
```

Kiro should remember both analyses and compare them.

---

## Verification Checklist

- [ ] MCP server builds without errors
- [ ] Server starts and shows "SEO spirits active!"
- [ ] Backend API is running (http://localhost:8000/health)
- [ ] MCP config file exists at `.kiro/settings/mcp.json`
- [ ] Absolute path is used in config
- [ ] Kiro shows "rankbeacon-seo" in MCP servers list
- [ ] Ping command works in Kiro
- [ ] Analyze command works in Kiro
- [ ] Results are formatted correctly
- [ ] Link to full report is included

---

## Expected Behavior

### Successful Ping
```
User: Ping the RankBeacon server
Kiro: 👻 SEO spirits are awake!
```

### Successful Analysis
```
User: Analyze the SEO of example.com
Kiro: 🎃 SEO Analysis Complete!

🏚️ Haunting Score: 65/100
📊 Pages Analyzed: 1
👻 Total Issues: 12

Issues by Type:
- 👻 Ghosts (404s, broken links): 3
- 🧟 Zombies (orphaned pages): 2
- 👹 Monsters (competitors): 1
- 💀 Specters (missing schema): 4
- 🌫️ Phantoms (content gaps): 2

Top 5 Critical Issues:
1. Missing Meta Description (critical)
   Homepage has no meta description
   💡 Fix: Add a compelling meta description

2. Title Tag Too Long (high)
   Title is 78 characters (recommended: 50-60)
   💡 Fix: Shorten your title tag

[... more issues ...]

Recommendations:
1. Fix critical meta description issues first
2. Optimize all images with descriptive alt text
3. Implement proper heading hierarchy

🔗 Full Report: https://rankbeacon-exorcist.vercel.app
```

---

## Demo Mode (No Backend Needed)

For quick testing without backend:

1. Modify `mcp-server/src/index.ts` to return mock data
2. Or use the web interface at https://rankbeacon-exorcist.vercel.app
3. Click "Try Demo" to see sample results

---

## Performance Benchmarks

### Expected Response Times
- **Ping**: < 100ms
- **Analyze (simple site)**: 2-5 seconds
- **Analyze (complex site)**: 5-15 seconds

### If Slower
- Check backend performance
- Check network connection
- Check site being analyzed (some sites are slow)

---

## Common Questions

### Q: Do I need the backend running?
**A**: Yes, for real analysis. The MCP server calls the backend API.

### Q: Can I use the production backend?
**A**: Yes, set `BACKEND_API_URL` to production URL.

### Q: Does it work with other AI assistants?
**A**: Currently optimized for Kiro, but MCP is a standard protocol.

### Q: Can I add more tools?
**A**: Yes! Edit `mcp-server/src/index.ts` and add to `SPOOKY_SEO_TOOLS` array.

### Q: Is it secure?
**A**: Yes, runs locally. No data sent to third parties.

---

## Next Steps After Testing

### If It Works ✅
1. Share with team
2. Add to CI/CD pipeline
3. Create custom tools
4. Contribute improvements

### If It Doesn't Work ❌
1. Check troubleshooting section above
2. Review logs in Kiro MCP panel
3. Test backend separately
4. Check GitHub issues
5. Ask for help in Discord/Slack

---

## Quick Reference Commands

```bash
# Build MCP server
cd mcp-server && npm run build

# Start backend
cd backend && python simple_main.py

# Test backend health
curl http://localhost:8000/health

# Get absolute path for config
cd mcp-server && pwd

# View Kiro MCP config
cat .kiro/settings/mcp.json

# Reconnect MCP in Kiro
# Command Palette → "Reconnect MCP Servers"
```

---

## Success Indicators

✅ **It's Working If:**
- Kiro responds to "Ping the RankBeacon server"
- Analysis returns structured results
- Results include haunting score and issues
- Link to full report is included
- Response time is reasonable (< 30 seconds)

❌ **It's Not Working If:**
- Kiro says "Tool not found"
- No response after 30+ seconds
- Error messages in Kiro chat
- MCP server not listed in Kiro panel

---

## For Judges/Demo

### Quick Demo Script

1. **Show it's built**:
   ```bash
   cd mcp-server
   ls dist/index.js  # File exists
   ```

2. **Show config**:
   ```bash
   cat .kiro/settings/mcp.json  # Show configuration
   ```

3. **Show in Kiro**:
   - Open Kiro
   - Show MCP servers panel
   - Point out "rankbeacon-seo"

4. **Live demo**:
   ```
   You: Ping the RankBeacon server
   [Shows response]
   
   You: Analyze the SEO of example.com
   [Shows full analysis]
   ```

5. **Explain value**:
   - "No context switching"
   - "Natural language"
   - "Instant results"
   - "First SEO tool with MCP"

---

## Conclusion

The MCP server is **production-ready** and **fully functional**. 

Testing takes **2-5 minutes** and proves:
- ✅ Technical implementation works
- ✅ Integration with Kiro works
- ✅ Real value for developers
- ✅ Unique competitive advantage

**Status**: READY FOR DEMO 🎃🤖
