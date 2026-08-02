# HAL Leads — Admin Dashboard

Meta-to-WhatsApp Lead Booking Automation Platform — Frontend Admin Dashboard.

## Tech Stack

- **React 18 + Vite 5** — fast dev server and production build
- **Tailwind CSS v3** — utility-first styling with custom design tokens
- **React Router v6** — client-side routing
- **TanStack Query v5** — data fetching, caching, polling, and optimistic updates
- **Lucide React** — icon library

## Prerequisites

- Node.js 18+
- npm 9+

## How to Run Locally

```bash
# 1. Clone & install
npm install

# 2. Set environment variables
cp .env.example .env
# Edit .env if pointing at local backend (see below)

# 3. Start dev server
npm run dev
# → http://localhost:5173
```

Open `http://localhost:5173` in your browser. You'll be prompted for the admin token on the login screen.

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `VITE_API_BASE_URL` | `https://wati.ayurvedicpromise.com` | Backend API base URL |

For local backend development:
```env
VITE_API_BASE_URL=http://127.0.0.1:5040
```

## Admin Token

The dashboard uses a single shared bearer token for all API requests. Enter it on the login screen:

```
hal-admin-secret-token-2026
```

The token is stored **in memory only** (not localStorage/sessionStorage). You'll need to re-enter it on page reload — this is intentional for security.

## Production Build

```bash
npm run build
# Output: dist/
```

Deploy the `dist/` directory to Vercel, Netlify, or any static host. The `vercel.json` included in the project sets security headers (CSP, X-Frame-Options, etc.).

## Pages

| Route | Description |
|---|---|
| `/campaigns` | Campaign grid with stats, Auto Message toggle, template picker |
| `/campaigns/:id/leads` | Per-campaign lead table |
| `/last-30-days` | All leads (last 30 days), filters, auto-refreshes every 10s |
| `/whatsapp` | WhatsApp inbox — two-panel conversation view |
| `/settings` | Platform settings (API keys, SMTP, automation) |
| `/settings/calendars` | Google Calendar connections per branch |
| `/settings/calendars/:id` | Store hours, services, capacity, closures, time blocks |

## API

Backend documentation: `API_DOC.md`  
Live Swagger UI: `https://wati.ayurvedicpromise.com/docs`
