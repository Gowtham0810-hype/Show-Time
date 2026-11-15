import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { requestBackend } from "../api-client.js";

export function registerAlertTools(server: McpServer, sessionId?: string): void {
  // 1. create_alert
  server.tool(
    "create_alert",
    "Subscribe to a release alert for an upcoming movie. As soon as showtimes are published at your preferred theater or in Chennai, the alert triggers.",
    {
      movieTitle: z.string().describe("Exact or partial title of the upcoming movie (e.g. 'Marty Supreme')"),
      theaterName: z.string().optional().describe("Specific theater name to watch (e.g. 'AGS Cinemas'), or omit for any theater"),
      city: z.string().optional().default("Chennai").describe("City name (defaults to 'Chennai')"),
      screenType: z.string().optional().describe("Preferred screen format (e.g. 'IMAX', '4DX', '2D')"),
    },
    async ({ movieTitle, theaterName, city = "Chennai", screenType }) => {
      try {
        const body: Record<string, any> = {
          movieTitle: movieTitle.trim(),
          city,
        };
        if (theaterName) body.theaterName = theaterName.trim();
        if (screenType) body.screenType = screenType.trim();

        const alert = await requestBackend({
          method: "POST",
          path: "/api/alerts",
          body,
          sessionId,
          requiresAuth: true,
        });

        const alertId = alert.id;
        const theaterDisplay = alert.theaterName || theaterName || "Any Theater in Chennai";
        const screenDisplay = alert.screenType || screenType ? ` (${alert.screenType || screenType})` : "";

        const text =
          `### 🔔 Release Alert Created Successfully!\n\n` +
          `- **Alert ID:** #${alertId}\n` +
          `- **Movie:** **${alert.movieTitle || movieTitle}**\n` +
          `- **Venue Preference:** ${theaterDisplay}${screenDisplay}\n` +
          `- **City:** ${alert.city || city}\n` +
          `- **Status:** 🟢 **ACTIVE**\n\n` +
          `Whenever the theater schedules showtimes for this movie, CINE-AI's real-time alert matcher will automatically flip your alert to **TICKETS OPEN**!`;

        return { content: [{ type: "text", text }] };
      } catch (err: any) {
        return {
          isError: true,
          content: [{ type: "text", text: `❌ Could not create alert for "${movieTitle}": ${err.message}` }],
        };
      }
    }
  );

  // 2. get_my_alerts
  server.tool(
    "get_my_alerts",
    "List all movie release alerts created by the authenticated user, along with their current status (ACTIVE, TICKETS_OPEN, TRIGGERED).",
    {},
    async () => {
      try {
        const alerts: any[] = await requestBackend({
          method: "GET",
          path: "/api/alerts",
          sessionId,
          requiresAuth: true,
        });

        if (!Array.isArray(alerts) || alerts.length === 0) {
          return {
            content: [
              {
                type: "text",
                text: "You currently have no active release alerts. Use `create_alert(movieTitle: \"...\")` to subscribe to upcoming movies!",
              },
            ],
          };
        }

        const rows = alerts.map((a) => {
          const status = a.status === "TRIGGERED" || a.uiStatus === "TICKETS_OPEN"
            ? "🎟 **TICKETS OPEN!**"
            : a.status === "CANCELLED"
            ? "⚪ Cancelled"
            : "🟢 ACTIVE";

          const theater = a.theaterName || "Any Chennai Theater";
          const screen = a.screenType ? ` (${a.screenType})` : "";

          return `| **#${a.id}** | **${a.movieTitle}** | ${theater}${screen} | ${status} |`;
        });

        const text =
          `### 🔔 Your Movie Alerts (${alerts.length})\n\n` +
          `| Alert ID | Movie | Preferred Venue | Status |\n` +
          `|---|---|---|---|\n` +
          rows.join("\n") +
          `\n\n*Tip: Call \`cancel_alert(alertId)\` to remove an alert you no longer need.*`;

        return { content: [{ type: "text", text }] };
      } catch (err: any) {
        return {
          isError: true,
          content: [{ type: "text", text: `❌ Failed to retrieve your alerts: ${err.message}` }],
        };
      }
    }
  );

  // 3. cancel_alert
  server.tool(
    "cancel_alert",
    "Cancel and remove an active movie release alert.",
    {
      alertId: z.number().describe("ID of the alert to cancel"),
    },
    async ({ alertId }) => {
      try {
        await requestBackend({
          method: "DELETE",
          path: `/api/alerts/${alertId}`,
          sessionId,
          requiresAuth: true,
        });

        return {
          content: [
            {
              type: "text",
              text: `✅ **Alert #${alertId} Cancelled Successfully**: You will no longer receive notifications for this alert.`,
            },
          ],
        };
      } catch (err: any) {
        return {
          isError: true,
          content: [{ type: "text", text: `❌ Could not cancel alert #${alertId}: ${err.message}` }],
        };
      }
    }
  );
}
