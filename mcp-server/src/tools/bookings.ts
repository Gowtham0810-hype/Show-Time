import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { requestBackend } from "../api-client.js";
import { sessionStore } from "../session-store.js";

export function registerBookingTools(server: McpServer, sessionId?: string): void {
  // 1. hold_seats
  server.tool(
    "hold_seats",
    "Temporarily reserve (hold) one or more seats for 5 minutes in Redis while user confirms checkout. Prevents other users from booking these seats.",
    {
      showtimeId: z.number().describe("Showtime ID"),
      seatIds: z.array(z.union([z.number(), z.string()])).min(1).describe("List of Seat IDs or seat codes (e.g. [101, 102] or ['F5', 'F6'])"),
    },
    async ({ showtimeId, seatIds }) => {
      try {
        const res = await requestBackend({
          method: "POST",
          path: "/api/holds",
          body: { showtimeId, seatIds },
          sessionId,
          requiresAuth: true,
        });

        const holdToken = res.holdToken || res.token || res.id;
        const expiresIn = res.expiresInSeconds || res.holdDurationSeconds || 300;

        if (holdToken) {
          sessionStore.setHoldToken(sessionId, holdToken, expiresIn);
        }

        const seatList = Array.isArray(seatIds) ? seatIds.join(", ") : String(seatIds);
        const text =
          `### ⏱ Seats Successfully Held for 5 Minutes!\n\n` +
          `- **Showtime ID:** #${showtimeId}\n` +
          `- **Seats Held:** ${seatList}\n` +
          `- **Hold Token:** \`${holdToken}\`\n` +
          `- **Time to Complete:** 5 minutes (via Redis distributed TTL)\n\n` +
          `👉 **Would you like me to confirm and book these tickets now?**\n` +
          `Just reply *"Yes, confirm booking"* or call \`confirm_booking(holdToken: "${holdToken}")\`.`;

        return { content: [{ type: "text", text }] };
      } catch (err: any) {
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: `❌ **Failed to Hold Seats**: ${err.message}\n` +
                `*Tip: If these seats were just held or booked by another user, please run \`get_seat_map(showtimeId: ${showtimeId})\` to pick alternative seats.*`,
            },
          ],
        };
      }
    }
  );

  // 2. confirm_booking
  server.tool(
    "confirm_booking",
    "Complete and finalize the ticket booking. Can use an existing holdToken (or the session's active hold) or directly specify showtimeId and seatIds.",
    {
      holdToken: z.string().optional().describe("Hold token from a previous hold_seats call (uses active hold if omitted)"),
      showtimeId: z.number().optional().describe("Showtime ID (if booking directly without holdToken)"),
      seatIds: z.array(z.number()).optional().describe("List of Seat IDs (if booking directly without holdToken)"),
    },
    async ({ holdToken, showtimeId, seatIds }) => {
      try {
        const session = sessionStore.get(sessionId);
        const activeHoldToken = holdToken || session?.lastHoldToken;

        const body: Record<string, any> = {};
        if (activeHoldToken) {
          body.holdToken = activeHoldToken;
        } else if (showtimeId && seatIds && seatIds.length > 0) {
          body.showtimeId = showtimeId;
          body.seatIds = seatIds;
        } else {
          return {
            isError: true,
            content: [
              {
                type: "text",
                text: "❌ Cannot confirm booking: No active hold found in this session, and no showtimeId/seatIds were provided. Please hold seats first using `hold_seats`.",
              },
            ],
          };
        }

        const booking = await requestBackend({
          method: "POST",
          path: "/api/bookings",
          body,
          sessionId,
          requiresAuth: true,
        });

        // Clear hold token since booking completed
        if (session) {
          delete session.lastHoldToken;
          delete session.lastHoldExpiresAt;
        }

        const ref = booking.bookingReference || booking.reference || `BK-${booking.id}`;
        const movie = booking.movieTitle || booking.movie?.title || "Movie";
        const theater = booking.theaterName || booking.theater?.name || "Theater";
        const seats = Array.isArray(booking.seatNumbers) ? booking.seatNumbers.join(", ") : booking.seats || "Selected Seats";
        const total = booking.totalAmount !== undefined ? `₹${booking.totalAmount}` : "Confirmed";

        const text =
          `## 🎉 Booking Confirmed!\n\n` +
          `Your tickets have been secured and committed with ACID durability in PostgreSQL.\n\n` +
          `| Booking Reference | **${ref}** |\n` +
          `|---|---|\n` +
          `| **Movie** | **${movie}** |\n` +
          `| **Theater** | ${theater} |\n` +
          `| **Showtime** | ${booking.showDate || "Today"} at **${booking.startTime || "Scheduled Time"}** |\n` +
          `| **Seats** | **${seats}** |\n` +
          `| **Total Paid** | **${total}** |\n` +
          `| **Status** | 🟢 **${booking.status || "CONFIRMED"}** |\n\n` +
          `📲 *Your digital ticket is available on CINE-AI. Call \`get_my_bookings\` at any time to review your reservations.*`;

        return { content: [{ type: "text", text }] };
      } catch (err: any) {
        return {
          isError: true,
          content: [{ type: "text", text: `❌ **Booking Failed**: ${err.message}` }],
        };
      }
    }
  );

  // 3. get_my_bookings
  server.tool(
    "get_my_bookings",
    "View all ticket reservations and bookings made by the currently logged-in user.",
    {},
    async () => {
      try {
        const bookings: any[] = await requestBackend({
          method: "GET",
          path: "/api/bookings",
          sessionId,
          requiresAuth: true,
        });

        if (!Array.isArray(bookings) || bookings.length === 0) {
          return {
            content: [
              {
                type: "text",
                text: "You currently have no bookings on record. Search movies with `search_movies` to get started!",
              },
            ],
          };
        }

        const rows = bookings.map((b) => {
          const ref = b.bookingReference || b.reference || `#${b.id}`;
          const movie = b.movieTitle || b.movie?.title || "Movie";
          const theater = b.theaterName || b.theater?.name || "Theater";
          const date = b.showDate || "N/A";
          const time = b.startTime || "N/A";
          const seats = Array.isArray(b.seatNumbers) ? b.seatNumbers.join(", ") : b.seats || "Seats";
          const total = b.totalAmount !== undefined ? `₹${b.totalAmount}` : "Paid";
          const status = b.status === "CONFIRMED" ? "🟢 CONFIRMED" : b.status === "CANCELLED" ? "🔴 CANCELLED" : b.status;

          return `| **${ref}** | **${movie}** | ${theater} | ${date} ${time} | ${seats} | ${total} | ${status} |`;
        });

        const text =
          `### 🎟 Your Ticket Bookings (${bookings.length})\n\n` +
          `| Reference | Movie | Theater | Date & Time | Seats | Total | Status |\n` +
          `|---|---|---|---|---|---|---|\n` +
          rows.join("\n") +
          `\n\n*Tip: Call \`get_booking_details(reference: "...")\` to view the full voucher, or \`cancel_booking(reference: "...")\` to cancel.*`;

        return { content: [{ type: "text", text }] };
      } catch (err: any) {
        return {
          isError: true,
          content: [{ type: "text", text: `❌ Failed to retrieve your bookings: ${err.message}` }],
        };
      }
    }
  );

  // 4. get_booking_details
  server.tool(
    "get_booking_details",
    "Look up full ticket details for a specific booking reference (e.g. 'BK-A2Q5LR').",
    {
      reference: z.string().describe("Booking reference number (e.g. 'BK-A2Q5LR')"),
    },
    async ({ reference }) => {
      try {
        const b = await requestBackend({
          method: "GET",
          path: `/api/bookings/${reference.trim()}`,
          sessionId,
        });

        const movie = b.movieTitle || b.movie?.title || "Movie";
        const theater = b.theaterName || b.theater?.name || "Theater";
        const seats = Array.isArray(b.seatNumbers) ? b.seatNumbers.join(", ") : b.seats || "Seats";
        const total = b.totalAmount !== undefined ? `₹${b.totalAmount}` : "Paid";
        const status = b.status === "CONFIRMED" ? "🟢 CONFIRMED" : b.status === "CANCELLED" ? "🔴 CANCELLED" : b.status;

        const text =
          `## 🎟 Ticket Voucher: ${reference}\n\n` +
          `- **Status:** ${status}\n` +
          `- **Movie:** **${movie}**\n` +
          `- **Theater:** ${theater}\n` +
          `- **Screen:** ${b.screenName || b.format || "Standard Screen"}\n` +
          `- **Show Date & Time:** ${b.showDate || "Date"} at **${b.startTime || "Time"}**\n` +
          `- **Seats Allocated:** **${seats}**\n` +
          `- **Total Amount:** ${total}\n` +
          `- **Booked On:** ${b.createdAt ? new Date(b.createdAt).toLocaleString() : "Recently"}\n\n` +
          (b.status === "CONFIRMED"
            ? `💡 *Need to cancel? You can call \`cancel_booking(reference: "${reference}")\`.*`
            : "");

        return { content: [{ type: "text", text }] };
      } catch (err: any) {
        return {
          isError: true,
          content: [{ type: "text", text: `❌ Booking reference "${reference}" not found: ${err.message}` }],
        };
      }
    }
  );

  // 5. cancel_booking
  server.tool(
    "cancel_booking",
    "Cancel a confirmed ticket reservation and release the booked seats.",
    {
      reference: z.string().describe("Booking reference code to cancel (e.g. 'BK-A2Q5LR')"),
    },
    async ({ reference }) => {
      try {
        const res = await requestBackend({
          method: "DELETE",
          path: `/api/bookings/${reference.trim()}`,
          sessionId,
          requiresAuth: true,
        });

        const text =
          `### 🛑 Booking Cancelled Successfully\n\n` +
          `- **Reference:** \`${reference}\`\n` +
          `- **Status:** 🔴 CANCELLED\n` +
          `- **Refund Status:** Processed to original payment method\n\n` +
          `The seats have been released back to general availability.`;

        return { content: [{ type: "text", text }] };
      } catch (err: any) {
        return {
          isError: true,
          content: [{ type: "text", text: `❌ Could not cancel booking ${reference}: ${err.message}` }],
        };
      }
    }
  );
}
