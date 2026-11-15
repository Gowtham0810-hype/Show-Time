import express, { Request, Response } from "express";
import cors from "cors";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { config } from "./config.js";
import { sessionStore } from "./session-store.js";
import { initializeDefaultAuth } from "./api-client.js";

import { registerAuthTools } from "./tools/auth.js";
import { registerMovieTools } from "./tools/movies.js";
import { registerShowtimeTools } from "./tools/showtimes.js";
import { registerBookingTools } from "./tools/bookings.js";
import { registerAlertTools } from "./tools/alerts.js";

/** Factory to instantiate an MCP Server instance with all tools registered */
export function createMcpServer(sessionId?: string): McpServer {
  const server = new McpServer({
    name: config.serverName,
    version: config.serverVersion,
  });

  registerAuthTools(server, sessionId);
  registerMovieTools(server, sessionId);
  registerShowtimeTools(server, sessionId);
  registerBookingTools(server, sessionId);
  registerAlertTools(server, sessionId);

  return server;
}

// Check if running in local stdio mode (e.g. `node dist/index.js --stdio`)
const isStdio = process.argv.includes("--stdio");

if (isStdio) {
  // Local stdio mode for Claude Desktop running locally
  console.error(`[CINE-AI MCP] Starting in stdio mode (connecting to ${config.baseUrl})...`);
  const server = createMcpServer();
  const transport = new StdioServerTransport();

  initializeDefaultAuth().catch((err) => {
    console.error(`[CINE-AI MCP] Auth initialization warning:`, err);
  });

  server.connect(transport).catch((err) => {
    console.error(`[CINE-AI MCP] Fatal error in stdio transport:`, err);
    process.exit(1);
  });
} else {
  // HTTP / SSE mode for cloud hosting on Railway
  const app = express();

  app.use(
    cors({
      origin: "*",
      methods: ["GET", "POST", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "x-session-id"],
    })
  );

  app.use(express.json({ limit: "5mb" }));

  // Map to store active SSE transports by sessionId
  const sseTransports = new Map<string, SSEServerTransport>();

  // 1. Healthcheck for Railway and monitoring
  app.get("/health", (_req: Request, res: Response) => {
    res.json({
      status: "UP",
      service: config.serverName,
      version: config.serverVersion,
      backendUrl: config.baseUrl,
      activeSessions: sseTransports.size,
      authenticated: sessionStore.isAuthenticated(),
      timestamp: new Date().toISOString(),
    });
  });

  // 2. Friendly root landing page
  app.get("/", (_req: Request, res: Response) => {
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>CINE-AI MCP Server</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0b0f19; color: #f1f5f9; padding: 40px; max-width: 800px; margin: auto; line-height: 1.6; }
            h1 { color: #38bdf8; }
            code { background: #1e293b; padding: 3px 8px; border-radius: 4px; color: #a5f3fc; font-size: 0.95em; }
            .card { background: #111827; border: 1px solid #1f2937; border-radius: 8px; padding: 20px; margin-top: 20px; }
            .badge { display: inline-block; background: #065f46; color: #34d399; font-weight: bold; padding: 4px 10px; border-radius: 9999px; font-size: 0.85em; }
          </style>
        </head>
        <body>
          <span class="badge">● SERVICE ACTIVE</span>
          <h1>🎬 CINE-AI Model Context Protocol (MCP) Server</h1>
          <p>This service provides the Model Context Protocol endpoint for <strong>Claude Desktop</strong>, Claude Web, and MCP-compatible AI clients to discover, hold, and book cinema tickets on CINE-AI.</p>
          
          <div class="card">
            <h3>🔗 How to Connect from Claude</h3>
            <p>In Claude's Remote MCP configuration, enter the HTTPS endpoint:</p>
            <p><code>https://${_req.headers.host || "your-domain.up.railway.app"}/mcp</code></p>
          </div>

          <div class="card">
            <h3>⚙️ Current Status</h3>
            <ul>
              <li><strong>Backend Target:</strong> <code>${config.baseUrl}</code></li>
              <li><strong>Active SSE Sessions:</strong> ${sseTransports.size}</li>
              <li><strong>Registered Tools:</strong> 17 (Auth, Movies, Theaters, Showtimes, Seat Maps, Recommendations, Holds, Bookings, Alerts)</li>
            </ul>
          </div>
        </body>
      </html>
    `);
  });

  // 3. SSE Transport Handshake: GET /mcp or GET /sse
  const handleSse = async (req: Request, res: Response) => {
    console.log(`[MCP] New incoming SSE connection from ${req.ip} (${req.headers["user-agent"] || "unknown"})...`);

    // Initialize transport directing POST messages to /mcp/messages
    const transport = new SSEServerTransport("/mcp/messages", res);
    const sessionId = transport.sessionId;

    const mcpServer = createMcpServer(sessionId);
    sseTransports.set(sessionId, transport);

    console.log(`[MCP] Session created: ${sessionId} (Active sessions: ${sseTransports.size})`);

    // Clean up when client disconnects
    res.on("close", () => {
      console.log(`[MCP] SSE connection closed for session: ${sessionId}`);
      sseTransports.delete(sessionId);
      sessionStore.clear(sessionId);
      mcpServer.close().catch(() => {});
    });

    try {
      await mcpServer.connect(transport);
    } catch (err: any) {
      console.error(`[MCP] Error connecting session ${sessionId}:`, err);
      if (!res.headersSent) {
        res.status(500).end("Failed to establish SSE transport");
      }
    }
  };

  app.get("/mcp", handleSse);
  app.get("/sse", handleSse);

  // 4. JSON-RPC Message Handler: POST /mcp/messages or POST /messages
  const handleMessages = async (req: Request, res: Response) => {
    const sessionId = (req.query.sessionId as string) || (req.headers["x-session-id"] as string);

    if (!sessionId) {
      res.status(400).json({ error: "Missing sessionId query parameter or x-session-id header." });
      return;
    }

    const transport = sseTransports.get(sessionId);

    if (!transport) {
      console.warn(`[MCP] Message received for unknown or expired session: ${sessionId}`);
      res.status(404).json({
        error: `Session ${sessionId} not found or expired. Please re-open the SSE connection to /mcp.`,
      });
      return;
    }

    try {
      await transport.handlePostMessage(req, res, req.body);
    } catch (err: any) {
      console.error(`[MCP] Error handling message for session ${sessionId}:`, err);
      if (!res.headersSent) {
        res.status(500).json({ error: "Failed to process message." });
      }
    }
  };

  app.post("/mcp/messages", handleMessages);
  app.post("/messages", handleMessages);

  // Start HTTP Server
  app.listen(config.port, config.host, () => {
    console.log(`=======================================================`);
    console.log(`🎬 CINE-AI MCP Server running at http://${config.host}:${config.port}`);
    console.log(`📡 Remote MCP endpoint: http://${config.host}:${config.port}/mcp`);
    console.log(`🎯 Connected to CINE-AI Backend: ${config.baseUrl}`);
    console.log(`=======================================================`);

    // Auto-login default credentials if configured
    initializeDefaultAuth().catch((err) => {
      console.warn(`[AUTH] Background auth failed:`, err);
    });
  });
}
