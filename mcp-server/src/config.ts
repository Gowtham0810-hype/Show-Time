import dotenv from "dotenv";
dotenv.config();

function sanitizeBaseUrl(url?: string): string {
  const target = url || process.env.CINEAI_BASE_URL || "http://localhost:8080";
  return target.trim().replace(/\/+$/, "");
}

export const config = {
  baseUrl: sanitizeBaseUrl(),
  port: parseInt(process.env.PORT || "8080", 10),
  host: process.env.HOST || "0.0.0.0",
  defaultUserEmail: process.env.CINEAI_USER_EMAIL?.trim(),
  defaultUserPassword: process.env.CINEAI_USER_PASSWORD?.trim(),
  apiTimeoutMs: parseInt(process.env.API_TIMEOUT_MS || "15000", 10),
  serverName: "cineai-mcp-server",
  serverVersion: "1.0.0",
};
