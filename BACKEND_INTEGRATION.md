# BACKEND_INTEGRATION.md — Operational Glue (Frontend View)

This document details the operational configuration, environment variables, authentication mechanics, CORS policies, and integration nuances connecting the frontend application to the backend API server.

---

## Service Endpoints & Target Domains

| Environment | Component | URL | Notes |
|---|---|---|---|
| Production | Frontend | `https://jarvis.translateme.network` | Hosted on Vercel SPA deployment |
| Production | Backend | `https://wati.ayurvedicpromise.com` | FastAPI / Uvicorn backend server |

---

## Environment Variables

The frontend application expects the following environment variable configured during build/runtime:

```bash
VITE_API_BASE_URL=https://wati.ayurvedicpromise.com
```

- Defined in local `.env` and configured in Vercel project environment settings.
- Fallback logic in [`src/lib/api.ts`](file:///home/rpsoftwarelab/Documents/whatsApp_automation/frontend/src/lib/api.ts#L4):
  ```typescript
  const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'https://wati.ayurvedicpromise.com';
  ```

---

## Security, CORS & Authentication Mechanics

### Content Security Policy (CSP) & CORS
- **Vercel Security Headers** ([`vercel.json`](file:///home/rpsoftwarelab/Documents/whatsApp_automation/frontend/vercel.json)):
  ```json
  {
    "key": "Content-Security-Policy",
    "value": "default-src 'self'; connect-src 'self' https://wati.ayurvedicpromise.com; style-src 'self' 'unsafe-inline'; img-src 'self' data:; frame-ancestors 'none';"
  }
  ```
- **Backend CORS Allow-List**: The backend server explicitly allows cross-origin requests from `https://jarvis.translateme.network`. Standard browser `fetch` requests succeed directly without custom CORS proxies.

### HTTP Bearer Authentication Header
All endpoints under `/api/*` require an HTTP Bearer Token.
```http
Authorization: Bearer <API_BEARER_TOKEN>
```
- Injected automatically by `request<T>()` helper in `src/lib/api.ts`.
- Default fallback token in development: `admin`.

---

## Known Integration Nuances & Response Shape Differences

### 1. Paginated Response Shape Asymmetry
- **`GET /api/leads`**: Returns top-level `total`, `limit`, and `offset` pagination keys along with `items`:
  ```json
  {
    "total": 198,
    "limit": 50,
    "offset": 0,
    "items": [...]
  }
  ```
- **`GET /api/campaigns/{id}/leads`**: Deliberately returns **only** `total` and `items` without `limit` and `offset` wrapper fields:
  ```json
  {
    "total": 198,
    "items": [...]
  }
  ```
  *Note*: This difference in response shape between global lead lists and campaign-specific lead lists is intentional on the backend. Components consuming campaign leads map this shape explicitly in `CampaignLeadsPaginatedResponse`.

### 2. Additive Lead Fields (`is_old_lead` & `_parsing_error`)
- All lead objects returned by backend endpoints include additive fields:
  - `is_old_lead` (`boolean`): Indicates whether the lead was backfilled during initial sync (`true`) or ingested in real-time (`false`).
  - `_parsing_error` (`string | null`): Captures field extraction issues during lead parsing.
- **Messaging Restrictions**: Outbound WhatsApp messaging is locked in `WhatsAppInboxPage.tsx` when `is_old_lead: true`.

### 3. HTTP 409 Conflict Handling on Message Send
- Attempting to post a message (`POST /api/inbox/conversations/{id}/messages`) to a lead while `ai_mode` is enabled causes the backend to respond with HTTP `409 Conflict`.
- The frontend catches `status === 409` in `WhatsAppInboxPage.tsx` and renders `aiConflictModal` to prompt the human agent to turn off AI mode.
