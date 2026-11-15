import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { requestBackend } from "../api-client.js";

export function registerMovieTools(server: McpServer, sessionId?: string): void {
  // 1. search_movies
  server.tool(
    "search_movies",
    "Search for movies currently showing or upcoming in Chennai theaters. Filter by title query, genre, language, or status.",
    {
      query: z.string().optional().describe("Search term matching movie title, director, or cast"),
      status: z.enum(["ALL", "NOW_SHOWING", "UPCOMING"]).optional().default("ALL").describe("Filter by showing status"),
      genre: z.string().optional().describe("Filter by genre (e.g. 'Action', 'Drama', 'Sci-Fi')"),
      language: z.string().optional().describe("Filter by language (e.g. 'Tamil', 'English', 'Telugu')"),
    },
    async ({ query, status = "ALL", genre, language }) => {
      try {
        const params: Record<string, string> = {};
        if (status && status !== "ALL") {
          params.status = status;
        }

        const movies: any[] = await requestBackend({
          method: "GET",
          path: "/api/movies",
          params,
          sessionId,
        });

        if (!Array.isArray(movies) || movies.length === 0) {
          return {
            content: [{ type: "text", text: "No movies found matching the requested criteria." }],
          };
        }

        // Apply local filtering
        let filtered = movies;
        if (query) {
          const q = query.toLowerCase();
          filtered = filtered.filter(
            (m) =>
              m.title?.toLowerCase().includes(q) ||
              m.director?.toLowerCase().includes(q) ||
              m.castInfo?.toLowerCase().includes(q) ||
              m.synopsis?.toLowerCase().includes(q)
          );
        }

        if (genre) {
          const g = genre.toLowerCase();
          filtered = filtered.filter((m) => {
            if (Array.isArray(m.genres)) {
              return m.genres.some((item: string) => item.toLowerCase().includes(g));
            }
            return String(m.genre || "").toLowerCase().includes(g);
          });
        }

        if (language) {
          const l = language.toLowerCase();
          filtered = filtered.filter((m) => m.language?.toLowerCase().includes(l));
        }

        if (filtered.length === 0) {
          return {
            content: [
              {
                type: "text",
                text: `No movies matched your query (query: "${query || ""}", genre: "${genre || ""}", status: "${status}").`,
              },
            ],
          };
        }

        // Format as Markdown table
        const rows = filtered.map((m) => {
          const genres = Array.isArray(m.genres) ? m.genres.join(", ") : m.genre || "N/A";
          const duration = m.durationMins ? `${m.durationMins}m` : "N/A";
          const statusBadge = m.status === "NOW_SHOWING" ? "🟢 NOW SHOWING" : "🟡 UPCOMING";
          return `| **#${m.id}** | **${m.title}** | ${genres} | ${m.language || "N/A"} | ${duration} | ${statusBadge} | ${m.releaseDate || "TBA"} |`;
        });

        const header =
          `### 🎬 Found ${filtered.length} Movies\n\n` +
          `| ID | Title | Genre | Language | Duration | Status | Release Date |\n` +
          `|---|---|---|---|---|---|---|\n` +
          rows.join("\n") +
          `\n\n*Tip: Use \`get_movie_details(movieId)\` to read synopsis and cast, or \`search_showtimes(movieId)\` to view show times.*`;

        return {
          content: [{ type: "text", text: header }],
        };
      } catch (err: any) {
        return {
          isError: true,
          content: [{ type: "text", text: `❌ Failed to search movies: ${err.message}` }],
        };
      }
    }
  );

  // 2. get_movie_details
  server.tool(
    "get_movie_details",
    "Get full details for a specific movie including synopsis, director, full cast, duration, poster image URL, and current status.",
    {
      movieId: z.number().describe("ID of the movie"),
    },
    async ({ movieId }) => {
      try {
        const m = await requestBackend({
          method: "GET",
          path: `/api/movies/${movieId}`,
          sessionId,
        });

        const genres = Array.isArray(m.genres) ? m.genres.join(", ") : m.genre || "N/A";
        const statusBadge = m.status === "NOW_SHOWING" ? "🟢 NOW SHOWING" : "🟡 UPCOMING";

        const text =
          `## 🎬 ${m.title} (${m.language || "N/A"})\n\n` +
          `- **Status:** ${statusBadge}\n` +
          `- **Movie ID:** ${m.id}\n` +
          `- **Genre:** ${genres}\n` +
          `- **Duration:** ${m.durationMins ? `${m.durationMins} minutes` : "N/A"}\n` +
          `- **Release Date:** ${m.releaseDate || "TBA"}\n` +
          `- **Director:** ${m.director || "N/A"}\n` +
          `- **Cast:** ${m.castInfo || "N/A"}\n` +
          (m.posterUrl ? `- **Poster:** [View Poster](${m.posterUrl})\n` : "") +
          `\n### Synopsis\n${m.synopsis || "No synopsis available."}\n\n` +
          (m.status === "NOW_SHOWING"
            ? `🎟 **Next step:** Call \`search_showtimes(movieId: ${m.id})\` to view available tickets in Chennai.`
            : `🔔 **Next step:** Call \`create_alert(movieId: ${m.id})\` to get notified the second tickets open!`);

        return {
          content: [{ type: "text", text }],
        };
      } catch (err: any) {
        return {
          isError: true,
          content: [{ type: "text", text: `❌ Could not find movie details for ID #${movieId}: ${err.message}` }],
        };
      }
    }
  );
}
