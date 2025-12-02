#!/usr/bin/env node

/**
 * 👻 RankBeacon MCP Server - The SEO Exorcist
 * 
 * Extends Kiro's capabilities with supernatural SEO powers!
 * This MCP server provides conversational SEO analysis through specialized tools.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import winston from 'winston';
import dotenv from 'dotenv';

// Import communication layer
import { wsManager, messageRouter, responseFormatter } from './communication/index.js';

// Import our spooky SEO tools
import { crawlWebsiteTool } from './tools/crawler.js';
// import { auditSEOTool } from './tools/auditor.js';
// import { analyzeCompetitorsTool } from './tools/competitors.js';
// import { optimizeContentTool } from './tools/optimizer.js';
// import { validateSchemaTool } from './tools/schema.js';
// import { checkPerformanceTool } from './tools/performance.js';
// import { predictorTool, trendAnalysisTool } from './tools/predictor.js';
// import { algorithmDetectionTool, updateImpactTool, recoveryStrategyTool } from './tools/algorithm.js';
// import { pingTool, echoTool, statusTool } from './tools/ping.js';
// import { optimizeForAIOverviewTool } from './tools/aiOverview.js';
// import { performCompetitiveAnalysisTool } from './tools/competitiveAnalysis.js';

// Load environment variables
dotenv.config();

// Configure spooky logging
const logger = winston.createLogger({
  level: process.env['LOG_LEVEL'] || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json(),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
      const emoji = level === 'error' ? '💀' : level === 'warn' ? '⚠️' : '👻';
      return `${emoji} [${timestamp}] ${level.toUpperCase()}: ${message} ${
        Object.keys(meta).length ? JSON.stringify(meta) : ''
      }`;
    })
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'rankbeacon-mcp.log' })
  ],
});

/**
 * The complete arsenal of SEO exorcism tools! 🔮
 */
const SPOOKY_SEO_TOOLS: Tool[] = [
  {
    name: 'ping',
    description: '🏓 Test basic Kiro communication with a simple ping/pong. Returns server status and latency information.',
    inputSchema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          description: 'Optional message to include in the pong response',
          default: 'Hello from RankBeacon! 👻'
        },
        sessionId: {
          type: 'string',
          description: 'Optional session ID for WebSocket communication',
        },
        includeServerInfo: {
          type: 'boolean',
          description: 'Include server information in response',
          default: false
        }
      },
    },
  },
  {
    name: 'echo',
    description: '📢 Echo back a message with optional formatting. Useful for testing message routing.',
    inputSchema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          description: 'Message to echo back',
        },
        format: {
          type: 'string',
          enum: ['plain', 'spooky', 'uppercase', 'reverse', 'emoji'],
          description: 'Format to apply to the message',
          default: 'plain'
        },
        sessionId: {
          type: 'string',
          description: 'Optional session ID for WebSocket communication',
        }
      },
      required: ['message'],
    },
  },
  {
    name: 'status',
    description: '📊 Get current server status including active sessions, memory usage, and uptime.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'crawl_website',
    description: '🕷️ Summon digital spiders to crawl and analyze a website for SEO issues. Returns comprehensive site analysis including ghosts (404s), zombies (orphaned pages), and other supernatural entities.',
    inputSchema: {
      type: 'object',
      properties: {
        domain: {
          type: 'string',
          description: 'The domain to crawl (e.g., "example.com")',
        },
        maxPages: {
          type: 'number',
          description: 'Maximum number of pages to crawl (default: 50)',
          default: 50,
        },
        includeExternal: {
          type: 'boolean',
          description: 'Include external links in analysis (default: false)',
          default: false,
        },
      },
      required: ['domain'],
    },
  },
  {
    name: 'audit_seo',
    description: '🔍 Perform a comprehensive SEO audit on a specific URL. Identifies technical issues, content problems, and optimization opportunities with spooky themed results.',
    inputSchema: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          description: 'The URL to audit',
        },
        includeContent: {
          type: 'boolean',
          description: 'Include content analysis (default: true)',
          default: true,
        },
      },
      required: ['url'],
    },
  },
  {
    name: 'analyze_competitors',
    description: '👹 Analyze competitor websites to identify threats (monsters) and opportunities. Provides competitive intelligence and market gap analysis.',
    inputSchema: {
      type: 'object',
      properties: {
        domain: {
          type: 'string',
          description: 'Your domain',
        },
        competitors: {
          type: 'array',
          items: { type: 'string' },
          description: 'List of competitor domains to analyze',
        },
        keywords: {
          type: 'array',
          items: { type: 'string' },
          description: 'Keywords to analyze for competitive positioning',
        },
      },
      required: ['domain', 'competitors'],
    },
  },
  {
    name: 'optimize_content',
    description: '🧙‍♂️ Use AI magic to optimize content for modern search features including AI overviews, featured snippets, and voice search.',
    inputSchema: {
      type: 'object',
      properties: {
        content: {
          type: 'string',
          description: 'The content to optimize',
        },
        targetKeywords: {
          type: 'array',
          items: { type: 'string' },
          description: 'Target keywords for optimization',
        },
        optimizationType: {
          type: 'string',
          enum: ['ai_overview', 'featured_snippet', 'voice_search', 'all'],
          description: 'Type of optimization to perform',
          default: 'all',
        },
      },
      required: ['content'],
    },
  },
  {
    name: 'validate_schema',
    description: '👤 Detect schema specters - missing or malformed structured data that haunts your search visibility.',
    inputSchema: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          description: 'URL to validate schema markup',
        },
        schemaTypes: {
          type: 'array',
          items: { type: 'string' },
          description: 'Specific schema types to validate (optional)',
        },
      },
      required: ['url'],
    },
  },
  {
    name: 'check_performance',
    description: '⚡ Analyze website performance and Core Web Vitals. Identifies performance demons that slow down your site.',
    inputSchema: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          description: 'URL to analyze performance',
        },
        device: {
          type: 'string',
          enum: ['mobile', 'desktop', 'both'],
          description: 'Device type for analysis',
          default: 'both',
        },
      },
      required: ['url'],
    },
  },
  {
    name: 'predict_rankings',
    description: '🔮 Use predictive analytics to forecast ranking changes and identify future opportunities or threats.',
    inputSchema: {
      type: 'object',
      properties: {
        domain: {
          type: 'string',
          description: 'Domain to analyze',
        },
        keywords: {
          type: 'array',
          items: { type: 'string' },
          description: 'Keywords to predict rankings for',
        },
        timeframe: {
          type: 'number',
          description: 'Prediction timeframe in days (default: 30)',
          default: 30,
        },
      },
      required: ['domain', 'keywords'],
    },
  },
  {
    name: 'detect_algorithm_impact',
    description: '🌙 Detect algorithm updates and their supernatural impact on your website rankings.',
    inputSchema: {
      type: 'object',
      properties: {
        domain: {
          type: 'string',
          description: 'Domain to analyze for algorithm impact',
        },
        dateRange: {
          type: 'object',
          properties: {
            start: { type: 'string', description: 'Start date (YYYY-MM-DD)' },
            end: { type: 'string', description: 'End date (YYYY-MM-DD)' },
          },
          required: ['start', 'end'],
        },
      },
      required: ['domain', 'dateRange'],
    },
  },
  {
    name: 'optimize_for_ai_overview',
    description: '🤖 Optimize content specifically for AI search results and overviews. Analyzes content structure, factual accuracy, and clarity to maximize visibility in AI-generated search summaries.',
    inputSchema: {
      type: 'object',
      properties: {
        content: {
          type: 'string',
          description: 'The content to analyze and optimize for AI overviews',
        },
        topic: {
          type: 'string',
          description: 'The main topic or keyword the content targets',
        },
        url: {
          type: 'string',
          description: 'Optional URL for additional context',
        },
        targetAudience: {
          type: 'string',
          description: 'Target audience (e.g., beginners, experts, general)',
          default: 'general',
        },
      },
      required: ['content', 'topic'],
    },
  },
  {
    name: 'perform_competitive_analysis',
    description: '🎯 Perform comprehensive competitive analysis including keyword gap analysis, backlink profile comparison, and content strategy analysis. Identifies opportunities to outrank competitors.',
    inputSchema: {
      type: 'object',
      properties: {
        domain: {
          type: 'string',
          description: 'Your domain to analyze',
        },
        competitors: {
          type: 'array',
          items: { type: 'string' },
          description: 'List of competitor domains to analyze',
        },
        keywords: {
          type: 'array',
          items: { type: 'string' },
          description: 'Optional keywords to analyze for gaps',
        },
        includeBacklinks: {
          type: 'boolean',
          description: 'Include backlink profile analysis (default: false)',
          default: false,
        },
        includeContentStrategy: {
          type: 'boolean',
          description: 'Include content strategy analysis (default: true)',
          default: true,
        },
      },
      required: ['domain', 'competitors'],
    },
  },
];

/**
 * Create and configure the MCP server with spooky powers! 🎃
 */
const server = new Server(
  {
    name: 'rankbeacon-seo-exorcist',
    version: '1.0.0',
  }
);

// Register tool handlers
server.setRequestHandler(ListToolsRequestSchema, async () => {
  logger.info('👻 Listing available SEO exorcism tools');
  return {
    tools: SPOOKY_SEO_TOOLS,
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  
  logger.info(`🔮 Invoking SEO tool: ${name}`, { args });

  try {
    switch (name) {
      // Communication test tools
      case 'ping':
        return await pingTool(args);
      
      case 'echo':
        return await echoTool(args);
      
      case 'status':
        return await statusTool(args);
      
      // SEO analysis tools
      case 'crawl_website':
        return await crawlWebsiteTool(args);
      
      // Temporarily disabled tools for lightweight deployment
      case 'audit_seo':
      case 'analyze_competitors':
      case 'optimize_content':
      case 'validate_schema':
      case 'check_performance':
      case 'predict_rankings':
      case 'detect_algorithm_impact':
      case 'optimize_for_ai_overview':
      case 'perform_competitive_analysis':
        return {
          content: [{
            type: 'text',
            text: `Tool ${name} is temporarily unavailable in lightweight deployment mode. Use the main backend API instead.`
          }]
        };
      
      default:
        logger.error(`💀 Unknown tool summoned: ${name}`);
        throw new Error(`Unknown tool: ${name}. The spirits don't recognize this incantation! 👻`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`💀 Tool invocation failed: ${name}`, { error: errorMessage });
    throw error;
  }
});

/**
 * Start the spooky MCP server! 🌙
 */
async function startSpookyServer() {
  logger.info('🎃 Starting RankBeacon SEO Exorcist MCP Server...');
  
  // Initialize communication layer
  logger.info('🌐 Initializing Kiro communication layer...');
  
  // Register message handlers
  messageRouter.registerHandler('ping', async (message: any) => {
    logger.info('🏓 Ping received, sending pong');
    await messageRouter.handlePing(message);
  });
  
  // Start WebSocket heartbeat
  wsManager.startHeartbeat(30000); // 30 seconds
  
  // Start periodic cleanup of inactive sessions
  setInterval(() => {
    wsManager.cleanupInactiveSessions(300000); // 5 minutes
  }, 60000); // Check every minute
  
  const transport = new StdioServerTransport();
  await server.connect(transport);
  
  logger.info('👻 SEO spirits are now active and ready to exorcise website demons!');
  logger.info('🌐 Kiro communication layer established successfully!');
  logger.info('🔮 Available tools:', { tools: SPOOKY_SEO_TOOLS.map(t => t.name) });
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  logger.info('🌙 Banishing SEO spirits back to the digital realm...');
  
  // Cleanup communication layer
  wsManager.shutdown();
  messageRouter.cleanup();
  
  process.exit(0);
});

process.on('SIGTERM', () => {
  logger.info('🌙 SEO exorcism session terminated. Spirits departing...');
  
  // Cleanup communication layer
  wsManager.shutdown();
  messageRouter.cleanup();
  
  process.exit(0);
});

// Start the server
startSpookyServer().catch((error) => {
  logger.error('💀 Failed to start SEO exorcist server:', error);
  process.exit(1);
});
