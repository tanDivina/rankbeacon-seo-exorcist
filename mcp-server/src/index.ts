#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';

const server = new Server({ name: 'rankbeacon-seo-exorcist', version: '1.0.0' });

const TOOLS = [
  { name: 'ping', description: 'Test if SEO spirits are awake', inputSchema: { type: 'object', properties: {} } }
];

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name } = request.params;
  if (name === 'ping') {
    return { content: [{ type: 'text', text: '👻 SEO spirits are awake!' }] };
  }
  throw new Error(`Unknown tool: ${name}`);
});

async function start() {
  console.error('🎃 Starting RankBeacon MCP Server...');
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('👻 SEO spirits active!');
}

process.on('SIGINT', () => { console.error('🌙 Shutting down...'); process.exit(0); });
start().catch((error) => { console.error('💀 Failed:', error); process.exit(1); });
