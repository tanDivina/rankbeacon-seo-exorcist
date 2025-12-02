#!/usr/bin/env node
/**
 * 👻 RankBeacon MCP Server - The SEO Exorcist
 */
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import winston from 'winston';
import * as dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const logger = winston.createLogger({
  level: process.env['LOG_LEVEL'] || 'info',
  format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
  transports: [new winston.transports.Console({ format: winston.format.simple() })],
});

const TOOLS = [
  { name: 'ping', description: '🏓 Test connectivity', inputSchema: { type: 'object', properties: {} } },
  {
    name: 'analyze_seo',
    description: '🎃 Analyze website SEO',
    inputSchema: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'URL to analyze' },
        depth: { type: 'number', default: 1 },
      },
      required: ['url'],
    },
  },
];

const server = new Server({ name: 'rankbeacon-seo-exorcist', version: '1.0.0' }, { capabilities: { tools: {} } });

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  
  if (name === 'ping') {
    return { content: [{ type: 'text', text: '🏓 Pong!' }] };
  }
  
  if (name === 'analyze_seo') {
    const backendUrl = process.env['BACKEND_API_URL'] || 'http://backend:8000';
    const response = await fetch(`${backendUrl}/api/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: args.url, depth: args.depth || 1, use_js_rendering: true })
    });
    
    const data: any = await response.json();
    return {
      content: [{
        type: 'text',
        text: `🎃 Haunting Score: ${data.haunting_score}/100\n👻 Issues: ${data.entities.length}\n\nTop Issues:\n${data.entities.slice(0, 5).map((e: any) => `- ${e.title}`).join('\n')}`
      }]
    };
  }
  
  throw new Error(`Unknown tool: ${name}`);
});

async function start() {
  logger.info('🎃 Starting MCP Server...');
  const transport = new StdioServerTransport();
  await server.connect(transport);
  logger.info('👻 MCP Server ready!');
}

start().catch((error) => {
  logger.error('Failed to start:', error);
  process.exit(1);
});
