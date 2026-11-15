import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { requestBackend } from "../api-client.js";
import { sessionStore } from "../session-store.js";

export function registerAuthTools(server: McpServer, sessionId?: string): void {
  // 1. register_account
  server.tool(
    "register_account",
    "Register a new CINE-AI customer account and automatically log in for this session. Use when the user asks to sign up or create an account.",
    {
      fullName: z.string().min(2).describe("Full name of the user (e.g. 'Adam Goya')"),
      email: z.string().email().describe("Valid email address"),
      password: z.string().min(6).describe("Password (at least 6 characters)"),
    },
    async ({ fullName, email, password }) => {
      try {
        const res = await requestBackend({
          method: "POST",
          path: "/api/auth/register",
          body: { fullName, email, password },
          sessionId,
        });

        const token = res.token;
        const user = res.user;

        sessionStore.set(sessionId, { token, user });

        return {
          content: [
            {
              type: "text",
              text: `✅ **Account Successfully Registered & Logged In!**\n\n` +
                `- **User ID:** ${user.id}\n` +
                `- **Full Name:** ${user.fullName}\n` +
                `- **Email:** ${user.email}\n` +
                `- **Role:** ${user.role}\n\n` +
                `Your session is now active. You can now hold seats, complete bookings, view ticket history, and set release alerts.`,
            },
          ],
        };
      } catch (err: any) {
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: `❌ **Registration Failed**: ${err.message}`,
            },
          ],
        };
      }
    }
  );

  // 2. login_account
  server.tool(
    "login_account",
    "Log in to an existing CINE-AI account using email and password. Automatically stores the JWT auth token for all subsequent booking and alert actions.",
    {
      email: z.string().email().describe("Registered email address"),
      password: z.string().describe("Account password"),
    },
    async ({ email, password }) => {
      try {
        const res = await requestBackend({
          method: "POST",
          path: "/api/auth/login",
          body: { email, password },
          sessionId,
        });

        const token = res.token;
        const user = res.user;

        sessionStore.set(sessionId, { token, user });

        return {
          content: [
            {
              type: "text",
              text: `✅ **Login Successful!**\n\n` +
                `- **Welcome back:** ${user.fullName}\n` +
                `- **Email:** ${user.email}\n` +
                `- **Role:** ${user.role}\n\n` +
                `You are now authenticated for this session. All booking, hold, and alert operations will use this account.`,
            },
          ],
        };
      } catch (err: any) {
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: `❌ **Login Failed**: ${err.message}`,
            },
          ],
        };
      }
    }
  );

  // 3. get_current_user
  server.tool(
    "get_current_user",
    "Check who is currently authenticated in this CINE-AI session.",
    {},
    async () => {
      const current = sessionStore.get(sessionId);
      if (!current || !current.token) {
        return {
          content: [
            {
              type: "text",
              text: `ℹ **Not Authenticated**: You are not currently logged into any CINE-AI account.\n\n` +
                `Public browsing (movies, theaters, showtimes, seats) is available. To hold seats or book tickets, please log in with \`login_account\` or register with \`register_account\`.`,
            },
          ],
        };
      }

      try {
        const profile = await requestBackend({
          method: "GET",
          path: "/api/auth/me",
          sessionId,
          requiresAuth: true,
        });

        return {
          content: [
            {
              type: "text",
              text: `👤 **Current User Profile:**\n\n` +
                `- **User ID:** ${profile.id}\n` +
                `- **Full Name:** ${profile.fullName}\n` +
                `- **Email:** ${profile.email}\n` +
                `- **Role:** ${profile.role}\n` +
                `- **Active Session:** Authenticated via JWT Bearer Token`,
            },
          ],
        };
      } catch {
        // Fallback to local session cache if /api/auth/me transiently fails
        return {
          content: [
            {
              type: "text",
              text: `👤 **Current User (Session Cache):**\n\n` +
                `- **User ID:** ${current.user.id}\n` +
                `- **Full Name:** ${current.user.fullName}\n` +
                `- **Email:** ${current.user.email}\n` +
                `- **Role:** ${current.user.role}`,
            },
          ],
        };
      }
    }
  );

  // 4. logout_account
  server.tool(
    "logout_account",
    "Log out of the current CINE-AI session and clear cached authentication tokens.",
    {},
    async () => {
      sessionStore.clear(sessionId);
      return {
        content: [
          {
            type: "text",
            text: `👋 **Logged Out Successfully**: Your session credentials have been cleared.`,
          },
        ],
      };
    }
  );
}
