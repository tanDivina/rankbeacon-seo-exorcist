#!/bin/bash

# Test script for RankBeacon MCP Server
# Tests all 7 tools to ensure they work correctly

echo "🎃 Testing RankBeacon MCP Server"
echo "=================================="
echo ""

MCP_SERVER="mcp-server/dist/index.js"

if [ ! -f "$MCP_SERVER" ]; then
    echo "❌ MCP server not built. Run: cd mcp-server && npm run build"
    exit 1
fi

echo "✅ MCP server found"
echo ""

# Test 1: List tools
echo "📋 Test 1: Listing available tools..."
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | node $MCP_SERVER | head -20
echo ""
echo "---"
echo ""

# Test 2: Analyze website
echo "🎃 Test 2: Analyzing website..."
echo '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"analyze_website","arguments":{"url":"https://example.com","max_pages":5}}}' | node $MCP_SERVER | head -30
echo ""
echo "---"
echo ""

# Test 3: Find broken links
echo "👻 Test 3: Finding broken links..."
echo '{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"find_broken_links","arguments":{"url":"https://example.com"}}}' | node $MCP_SERVER | head -20
echo ""
echo "---"
echo ""

# Test 4: Predict rankings
echo "🔮 Test 4: Predicting rankings..."
echo '{"jsonrpc":"2.0","id":4,"method":"tools/call","params":{"name":"predict_rankings","arguments":{"url":"https://example.com","keywords":["seo","marketing"]}}}' | node $MCP_SERVER | head -30
echo ""
echo "---"
echo ""

# Test 5: Detect algorithm updates
echo "🕵️ Test 5: Detecting algorithm updates..."
echo '{"jsonrpc":"2.0","id":5,"method":"tools/call","params":{"name":"detect_algorithm_updates","arguments":{"url":"https://example.com"}}}' | node $MCP_SERVER | head -20
echo ""
echo "---"
echo ""

# Test 6: Analyze competitors
echo "👹 Test 6: Analyzing competitors..."
echo '{"jsonrpc":"2.0","id":6,"method":"tools/call","params":{"name":"analyze_competitors","arguments":{"your_url":"https://example.com","competitor_urls":["https://competitor.com"]}}}' | node $MCP_SERVER | head -30
echo ""
echo "---"
echo ""

# Test 7: Check page speed
echo "⚡ Test 7: Checking page speed..."
echo '{"jsonrpc":"2.0","id":7,"method":"tools/call","params":{"name":"check_page_speed","arguments":{"url":"https://example.com"}}}' | node $MCP_SERVER | head -20
echo ""
echo "---"
echo ""

# Test 8: Get recommendations
echo "💡 Test 8: Getting SEO recommendations..."
echo '{"jsonrpc":"2.0","id":8,"method":"tools/call","params":{"name":"get_seo_recommendations","arguments":{"url":"https://example.com"}}}' | node $MCP_SERVER | head -20
echo ""
echo "---"
echo ""

echo "✅ All tests completed!"
echo ""
echo "Note: Some tests may show errors if the backend is not running."
echo "To test with live backend, ensure it's running at:"
echo "  https://rankbeacon-backend.onrender.com"
echo ""
echo "Or start locally:"
echo "  cd backend && uvicorn main:app --reload"
