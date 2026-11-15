# CINE-AI Model Context Protocol (MCP) Server

[![MCP](https://img.shields.io/badge/MCP-1.32.2-blue.svg)](https://modelcontextprotocol.io/)
[![Node.js](https://img.shields.io/badge/Node.js-20%2B-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-purple.svg)](LICENSE)

The official **Model Context Protocol (MCP)** server for the **CINE-AI** theatrical discovery, seat reservation, and ticketing platform. 

This service allows **Claude Desktop**, Claude Web, Antigravity, and any MCP-compatible AI client to converse with the CINE-AI ecosystem to:
- 🎬 Search movies (now showing vs. upcoming)
- 🏛 Browse Chennai theaters and screen formats (IMAX, 4DX, Dolby Atmos)
- 🎟 Explore real-time showtimes and live seat availability
- 🎯 Receive intelligent seat recommendations (central view, VIP, aisle, adjacent seats)
- ⏱ Place 5-minute atomic seat holds in Redis
- 💳 Confirm and commit bookings with ACID transactions in PostgreSQL
- 🔔 Create release alerts for upcoming blockbuster titles
- 👤 Register and log in dynamically via chat with full session-aware JWT persistence

---

## 🚀 Quick Setup: Connecting to Claude

### Option A: Hosted on Railway (HTTPS / SSE — Recommended)

No custom domain is needed. Railway provides a free public HTTPS domain with trusted SSL certificates out of the box.

1. **Deploy to Railway**:
   - In your Railway project, click **+ New Service** → **GitHub Repo**.
   - Select your CINE-AI repository.
   - Set **Root Directory** to `/mcp-server`.
   - In **Settings** → **Networking**, click **Generate Domain**.
   - Note your domain, for example: `https://cineai-mcp-production.up.railway.app`.

2. **Add Environment Variables in Railway**:
   | Variable | Value | Description |
   |---|---|---|
   | `CINEAI_BASE_URL` | `https://<your-backend>.up.railway.app` | Public or internal URL of your CINE-AI Spring Boot backend |
   | `PORT` | `8080` | Port Railway routes traffic to (default 8080) |
   | `CINEAI_USER_EMAIL` | *(optional)* | Default account email to pre-authenticate on startup |
   | `CINEAI_USER_PASSWORD` | *(optional)* | Default account password |

3. **Connect in Claude**:
   - When Claude prompts for the HTTPS address where the server accepts MCP requests, enter:
     ```text
     https://<your-railway-mcp-domain>.up.railway.app/mcp
     ```
   - That's it! Claude will establish the persistent SSE connection, load all 17 tools, and be ready to chat.

---

### Option B: Local Claude Desktop (`claude_desktop_config.json`)

If you prefer running the MCP server locally on your laptop connecting to your live Railway backend:

1. Build the MCP server locally:
   ```bash
   cd d:\LLD\CINE-AI\mcp-server
   npm install
   npm run build
   ```

2. Add this block to your `claude_desktop_config.json` (located at `%APPDATA%\Claude\claude_desktop_config.json` on Windows):
   ```json
   {
     "mcpServers": {
       "cineai": {
         "command": "node",
         "args": ["d:/LLD/CINE-AI/mcp-server/dist/index.js", "--stdio"],
         "env": {
           "CINEAI_BASE_URL": "https://<your-railway-backend-domain>.up.railway.app"
         }
       }
     }
   }
   ```

---

## 🛠 Complete Tool Reference (17 Tools)

### 1. Authentication & Session Management
All authenticated actions (holding seats, booking, alerts) automatically use the active session's JWT token.

| Tool | Parameters | Description |
|---|---|---|
| `register_account` | `fullName`, `email`, `password` | Registers a new customer account on CINE-AI and stores the JWT in session memory. |
| `login_account` | `email`, `password` | Logs into an existing account and activates JWT for the session. |
| `get_current_user` | *(none)* | Checks who is currently authenticated in this chat session. |
| `logout_account` | *(none)* | Clears credentials from the session cache. |

### 2. Movies & Discovery (Public)
| Tool | Parameters | Description |
|---|---|---|
| `search_movies` | `query?`, `status?`, `genre?`, `language?` | Find films currently showing or upcoming in Chennai. |
| `get_movie_details` | `movieId` | Full film breakdown: synopsis, cast, director, runtime, poster link. |

### 3. Theaters & Showtimes (Public)
| Tool | Parameters | Description |
|---|---|---|
| `list_theaters` | *(none)* | Lists all Chennai cinema venues with screen counts and addresses. |
| `search_showtimes` | `movieId?`, `movieTitle?`, `theaterId?`, `date?` | Live show schedules, ticket prices, formats (IMAX, 4DX), and availability. |
| `get_seat_map` | `showtimeId` | Complete seat map breakdown by status (available, held, booked) and tier (VIP, Premium, Regular). |
| `recommend_seats` | `showtimeId`, `count?`, `preference?` | Smart seat algorithm recommending contiguous central or VIP seats. |

### 4. Seat Holds & Bookings (Authenticated)
| Tool | Parameters | Description |
|---|---|---|
| `hold_seats` | `showtimeId`, `seatIds` | Places an atomic 5-minute Redis hold on seats during checkout. |
| `confirm_booking` | `holdToken?`, `showtimeId?`, `seatIds?` | Completes transaction, records booking in PostgreSQL, and generates ticket code. |
| `get_my_bookings` | *(none)* | View your active and past reservations. |
| `get_booking_details` | `reference` | Full ticket voucher with QR reference and venue details. |
| `cancel_booking` | `reference` | Cancels a booking and releases seats back to the venue. |

### 5. Movie Release Alerts (Authenticated)
| Tool | Parameters | Description |
|---|---|---|
| `create_alert` | `movieTitle`, `theaterName?`, `city?`, `screenType?` | Subscribes to real-time notification when an upcoming film opens for booking. |
| `get_my_alerts` | *(none)* | Lists user's alerts and their current status (Active vs Tickets Open). |
| `cancel_alert` | `alertId` | Removes a release alert subscription. |

---

## 💬 Example Natural Language Conversations with Claude

### Example 1: Full Booking Flow
> **User**: *"What action movies are showing in Chennai today?"*  
> **Claude**: *(calls `search_movies(genre="Action", status="NOW_SHOWING")`)*  
> Shows list of action films.  
>  
> **User**: *"Find showtimes for Oppenheimer at AGS tonight."*  
> **Claude**: *(calls `search_showtimes(movieTitle="Oppenheimer", theaterName="AGS")`)*  
> Shows 7:30 PM IMAX and 10:15 PM shows.  
>  
> **User**: *"Recommend 2 good seats for the 7:30 PM show."*  
> **Claude**: *(calls `recommend_seats(showtimeId=42, count=2, preference="BEST_VIEW")`)*  
> Suggests seats E5 and E6 in the center row.  
>  
> **User**: *"Hold them and confirm my booking."*  
> **Claude**: *(calls `hold_seats(...)` then `confirm_booking(...)`)*  
> Returns booking confirmation reference `BK-A2Q5LR`!

### Example 2: Dynamic In-Chat Registration
> **User**: *"Register an account for me: John Doe, email john@example.com, password pass123"*  
> **Claude**: *(calls `register_account(...)`)*  
> "✅ Account registered and logged in as john@example.com!"  
>  
> **User**: *"Set an alert for Marty Supreme at PVR Chennai."*  
> **Claude**: *(calls `create_alert(...)` using John's new JWT)*  
> "🔔 Alert created! You'll be notified as soon as tickets open."
