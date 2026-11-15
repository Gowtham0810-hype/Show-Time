import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { requestBackend } from "../api-client.js";

export function registerShowtimeTools(server: McpServer, sessionId?: string): void {
  // 1. list_theaters
  server.tool(
    "list_theaters",
    "List all cinema venues and theaters in Chennai available on CINE-AI.",
    {},
    async () => {
      try {
        const theaters: any[] = await requestBackend({
          method: "GET",
          path: "/api/theaters",
          sessionId,
        });

        if (!Array.isArray(theaters) || theaters.length === 0) {
          return {
            content: [{ type: "text", text: "No theaters currently found in the system." }],
          };
        }

        const rows = theaters.map(
          (t) => `| **#${t.id}** | **${t.name}** | ${t.location || "Chennai"} | ${t.totalScreens || t.screens || 1} screens |`
        );

        const text =
          `### 🏛 Cinema Theaters in Chennai (${theaters.length} Venues)\n\n` +
          `| ID | Theater Name | Location | Screens |\n` +
          `|---|---|---|---|\n` +
          rows.join("\n") +
          `\n\n*Tip: Call \`search_showtimes(theaterId: ...)\` to see movie schedules at any specific venue.*`;

        return { content: [{ type: "text", text }] };
      } catch (err: any) {
        return {
          isError: true,
          content: [{ type: "text", text: `❌ Failed to list theaters: ${err.message}` }],
        };
      }
    }
  );

  // 2. search_showtimes
  server.tool(
    "search_showtimes",
    "Search for movie showtimes across Chennai theaters. Can filter by movie title, movie ID, theater ID, or date (YYYY-MM-DD).",
    {
      movieId: z.number().optional().describe("Filter by Movie ID"),
      movieTitle: z.string().optional().describe("Filter by partial movie title (resolves ID automatically)"),
      theaterId: z.number().optional().describe("Filter by Theater ID"),
      date: z.string().optional().describe("Filter by show date (YYYY-MM-DD format)"),
    },
    async ({ movieId, movieTitle, theaterId, date }) => {
      try {
        let resolvedMovieId = movieId;

        // Auto-resolve movieId from movieTitle if needed
        if (!resolvedMovieId && movieTitle) {
          const movies: any[] = await requestBackend({
            method: "GET",
            path: "/api/movies",
            sessionId,
          });
          const match = movies?.find((m) =>
            m.title?.toLowerCase().includes(movieTitle.toLowerCase())
          );
          if (match) {
            resolvedMovieId = match.id;
          }
        }

        const params: Record<string, any> = {};
        if (resolvedMovieId) params.movieId = resolvedMovieId;
        if (theaterId) params.theaterId = theaterId;
        if (date) params.date = date;

        const showtimes: any[] = await requestBackend({
          method: "GET",
          path: "/api/showtimes",
          params,
          sessionId,
        });

        if (!Array.isArray(showtimes) || showtimes.length === 0) {
          return {
            content: [
              {
                type: "text",
                text: `No showtimes found matching the criteria.` +
                  (movieTitle ? ` (searched for movie: "${movieTitle}")` : "") +
                  (date ? ` (date: "${date}")` : ""),
              },
            ],
          };
        }

        const rows = showtimes.map((s) => {
          const movie = s.movie?.title || s.movieTitle || `Movie #${s.movieId}`;
          const theater = s.theater?.name || s.theaterName || `Theater #${s.theaterId}`;
          const time = s.startTime || s.time || "TBA";
          const screen = s.screenName || s.screenType || s.format || "Standard";
          const price = s.basePrice || s.ticketPrice || s.price ? `₹${s.basePrice || s.ticketPrice || s.price}` : "₹200";
          const avail = s.availableSeats !== undefined ? `${s.availableSeats} left` : "Available";

          return `| **#${s.id}** | **${movie}** | ${theater} | ${s.showDate || date || "Today"} | **${time}** | ${screen} | ${price} | ${avail} |`;
        });

        const text =
          `### 🎟 Found ${showtimes.length} Showtimes\n\n` +
          `| Showtime ID | Movie | Theater | Date | Time | Screen | Price | Availability |\n` +
          `|---|---|---|---|---|---|---|---|\n` +
          rows.join("\n") +
          `\n\n*Tip: Call \`get_seat_map(showtimeId)\` or \`recommend_seats(showtimeId, count: 2)\` to select seats.*`;

        return { content: [{ type: "text", text }] };
      } catch (err: any) {
        return {
          isError: true,
          content: [{ type: "text", text: `❌ Failed to search showtimes: ${err.message}` }],
        };
      }
    }
  );

  // 3. get_seat_map
  server.tool(
    "get_seat_map",
    "Get live seat availability, seat numbers, categories (VIP, Premium, Regular), and pricing for a specific showtime.",
    {
      showtimeId: z.number().describe("ID of the showtime to inspect seats for"),
    },
    async ({ showtimeId }) => {
      try {
        const mapRes: any = await requestBackend({
          method: "GET",
          path: `/api/showtimes/${showtimeId}/seats`,
          sessionId,
        });

        const rawSeats: any[] = Array.isArray(mapRes) ? mapRes : mapRes?.seats || [];
        const basePrice = Number(mapRes?.basePrice || 200);

        if (rawSeats.length === 0) {
          return {
            content: [{ type: "text", text: `No seat records found for showtime #${showtimeId}.` }],
          };
        }

        const seats = rawSeats.map((s) => {
          const category = s.seatCategory || s.seatType || s.category || "REGULAR";
          const seatNumber = s.label || `${s.seatRow || "A"}${s.seatNumber || s.id}`;
          const price =
            s.price ||
            (category === "VIP"
              ? Math.round(basePrice * 1.5)
              : category === "PREMIUM"
              ? Math.round(basePrice * 1.25)
              : basePrice);
          return {
            id: s.id,
            seatRow: s.seatRow || (s.label ? s.label.charAt(0) : "A"),
            seatNumber,
            category,
            status: s.status || "AVAILABLE",
            price,
          };
        });

        const total = seats.length;
        const available = seats.filter((s) => s.status === "AVAILABLE");
        const booked = seats.filter((s) => s.status === "BOOKED");
        const held = seats.filter((s) => s.status === "HELD" || s.status === "LOCKED");

        // Group available seats by category
        const byType: Record<string, any[]> = {};
        for (const s of available) {
          const type = s.category;
          if (!byType[type]) byType[type] = [];
          byType[type].push(s);
        }

        const categoryBreakdown = Object.entries(byType)
          .map(([type, list]) => {
            const price = list[0]?.price ? ` (₹${list[0].price})` : "";
            const sampleSeatNumbers = list.slice(0, 12).map((s) => `${s.seatNumber}[#${s.id}]`).join(", ");
            const more = list.length > 12 ? ` ... +${list.length - 12} more` : "";
            return `- **${type}**${price}: ${list.length} available\n  *Available Seats:* ${sampleSeatNumbers}${more}`;
          })
          .join("\n\n");

        const movieTitle = mapRes?.movieTitle ? ` for **${mapRes.movieTitle}**` : "";
        const theaterName = mapRes?.theaterName ? ` at **${mapRes.theaterName}**` : "";

        const text =
          `## 🪑 Seat Availability for Showtime #${showtimeId}${movieTitle}${theaterName}\n\n` +
          `- **Total Seats:** ${total}\n` +
          `- **🟢 Available:** ${available.length}\n` +
          `- **🔴 Booked:** ${booked.length}\n` +
          `- **🟡 Held (Pending Checkout):** ${held.length}\n\n` +
          `### Available Categories & Seats:\n${categoryBreakdown}\n\n` +
          `💡 **Quick Action:** Use \`recommend_seats(showtimeId: ${showtimeId}, count: 2, preference: "BEST_VIEW")\` to pick optimal seats, or call \`hold_seats(showtimeId: ${showtimeId}, seatIds: [...])\` to reserve them.`;

        return { content: [{ type: "text", text }] };
      } catch (err: any) {
        return {
          isError: true,
          content: [{ type: "text", text: `❌ Failed to fetch seat map: ${err.message}` }],
        };
      }
    }
  );

  // 4. recommend_seats
  server.tool(
    "recommend_seats",
    "Intelligently recommend the best available seats for a showtime based on user preference (BEST_VIEW, VIP, PREMIUM, BUDGET, TOGETHER).",
    {
      showtimeId: z.number().describe("ID of the showtime"),
      count: z.number().min(1).max(10).default(2).describe("Number of seats needed (default 2)"),
      preference: z
        .enum(["BEST_VIEW", "VIP", "PREMIUM", "BUDGET", "TOGETHER"])
        .default("BEST_VIEW")
        .describe("Seat selection preference"),
    },
    async ({ showtimeId, count = 2, preference = "BEST_VIEW" }) => {
      try {
        const mapRes: any = await requestBackend({
          method: "GET",
          path: `/api/showtimes/${showtimeId}/seats`,
          sessionId,
        });

        const rawSeats: any[] = Array.isArray(mapRes) ? mapRes : mapRes?.seats || [];
        const basePrice = Number(mapRes?.basePrice || 200);

        if (rawSeats.length === 0) {
          return {
            content: [{ type: "text", text: `No seat records found for showtime #${showtimeId}.` }],
          };
        }

        const seats = rawSeats.map((s) => {
          const category = s.seatCategory || s.seatType || s.category || "REGULAR";
          const seatNumber = s.label || `${s.seatRow || "A"}${s.seatNumber || s.id}`;
          const price =
            s.price ||
            (category === "VIP"
              ? Math.round(basePrice * 1.5)
              : category === "PREMIUM"
              ? Math.round(basePrice * 1.25)
              : basePrice);
          return {
            id: s.id,
            seatRow: s.seatRow || (s.label ? s.label.charAt(0) : "A"),
            seatNumber,
            category,
            status: s.status || "AVAILABLE",
            price,
          };
        });

        const available = seats.filter((s) => s.status === "AVAILABLE");

        if (available.length < count) {
          return {
            content: [
              {
                type: "text",
                text: `❌ Only ${available.length} seats are currently available for showtime #${showtimeId}, but ${count} were requested.`,
              },
            ],
          };
        }

        // Group available seats by row
        const rowMap = new Map<string, any[]>();
        for (const seat of available) {
          const row = seat.seatRow;
          if (!rowMap.has(row)) rowMap.set(row, []);
          rowMap.get(row)!.push(seat);
        }

        // Sort each row's seats by seat number numeric part
        for (const [_, rowSeats] of rowMap) {
          rowSeats.sort((a, b) => {
            const numA = parseInt(a.seatNumber?.replace(/\D/g, "") || String(a.id), 10);
            const numB = parseInt(b.seatNumber?.replace(/\D/g, "") || String(b.id), 10);
            return numA - numB;
          });
        }

        let chosenSeats: any[] = [];

        // 1. If preference is VIP or PREMIUM or BUDGET, filter candidates
        let candidateRows = Array.from(rowMap.entries());

        if (preference === "VIP") {
          candidateRows = candidateRows.filter(([_, list]) =>
            list.some((s) => s.category === "VIP")
          );
        } else if (preference === "PREMIUM") {
          candidateRows = candidateRows.filter(([_, list]) =>
            list.some((s) => s.category === "PREMIUM")
          );
        } else if (preference === "BUDGET") {
          candidateRows = candidateRows.filter(([_, list]) =>
            list.some((s) => s.category === "REGULAR")
          );
        }

        // Fallback to all rows if specific filter produced no matches
        if (candidateRows.length === 0) {
          candidateRows = Array.from(rowMap.entries());
        }

        // Find contiguous seats in a single row
        for (const [_, rowSeats] of candidateRows) {
          if (rowSeats.length >= count) {
            // Find contiguous block
            for (let i = 0; i <= rowSeats.length - count; i++) {
              const window = rowSeats.slice(i, i + count);
              let isContiguous = true;
              for (let j = 0; j < window.length - 1; j++) {
                const currentNum = parseInt(window[j].seatNumber?.replace(/\D/g, "") || "0", 10);
                const nextNum = parseInt(window[j + 1].seatNumber?.replace(/\D/g, "") || "0", 10);
                if (nextNum !== currentNum + 1) {
                  isContiguous = false;
                  break;
                }
              }
              if (isContiguous) {
                chosenSeats = window;
                break;
              }
            }
          }
          if (chosenSeats.length > 0) break;
        }

        // Fallback: take best available in the first matching row
        if (chosenSeats.length === 0) {
          for (const [_, rowSeats] of candidateRows) {
            if (rowSeats.length >= count) {
              chosenSeats = rowSeats.slice(0, count);
              break;
            }
          }
        }

        // Ultimate fallback: take any available seats across rows
        if (chosenSeats.length === 0) {
          chosenSeats = available.slice(0, count);
        }

        const seatNames = chosenSeats.map((s) => s.seatNumber).join(", ");
        const seatIds = chosenSeats.map((s) => s.id);
        const totalPrice = chosenSeats.reduce((sum, s) => sum + (s.price || 200), 0);
        const category = chosenSeats[0]?.category || "STANDARD";

        const text =
          `### 🎯 Recommended Seats for Showtime #${showtimeId}\n\n` +
          `- **Preference Applied:** \`${preference}\`\n` +
          `- **Seats:** **${seatNames}**\n` +
          `- **Seat IDs:** \`[${seatIds.join(", ")}]\`\n` +
          `- **Category:** ${category}\n` +
          `- **Total Price:** ₹${totalPrice} (₹${chosenSeats[0]?.price || 200} each)\n\n` +
          `👉 **Would you like me to hold these seats for 5 minutes?**\n` +
          `Reply *"Yes"* or call \`hold_seats(showtimeId: ${showtimeId}, seatIds: [${seatIds.join(", ")}])\`.`;

        return { content: [{ type: "text", text }] };
      } catch (err: any) {
        return {
          isError: true,
          content: [{ type: "text", text: `❌ Seat recommendation error: ${err.message}` }],
        };
      }
    }
  );
}
