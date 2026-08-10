# DECISIONS.md — Chronological Decision Log

This document records architectural, UX, and technical judgment calls made on the frontend application. Entries are **append-only** to preserve historical context and prevent old decisions from being unintentionally reverted.

---

## [2026-08-04] Removal of Campaign-Card "Auto Mode" Toggle and Per-Lead "AI Mode" Column

### Context
Originally, the `CampaignCard` on the main `/campaigns` overview grid featured an inline "Auto Mode" toggle switch. Additionally, the leads table on `CampaignLeadsPage.tsx` contained an "AI Mode" toggle column for every lead row.

### Decision
Following architect confirmation, the campaign-card "Auto Mode" toggle and the per-lead "AI Mode" table column on `CampaignLeadsPage.tsx` were **deliberately removed**.
- Campaign automation status was mapped conceptually to `campaign.is_active` (rendered visually as an `<ActiveBadge />`).
- The per-lead toggle on `LastThirtyDaysPage.tsx` and the campaign header "Auto Message" toggle on `CampaignLeadsPage.tsx` were **deliberately retained** — this was not an oversight.

### Rationale & Alternatives Considered
1. **Redundancy & UX Noise**: Having toggles at card level, detail header level, and individual lead row level created conflicting user mental models regarding whether AI automation was controlled globally per campaign or individually per lead.
2. **Control Gap Tradeoff**: Removing the card-level toggle means users cannot change `campaign.is_active` directly on the `/campaigns` grid cards; they must click into `/campaigns/:id/leads` to toggle `is_active` in the page header. This minor control gap is acknowledged and logged in [`TODO_BACKLOG.md`](file:///home/rpsoftwarelab/Documents/whatsApp_automation/frontend/TODO_BACKLOG.md).

---

## [2026-08-04] Zero Visual Distinction for Manual Records

### Context
Both campaigns and leads can originate either automatically via Meta Graph API integration or manually via user entry ("Create Manual Campaign" and "Add a lead" modals).

### Decision
Manually created campaigns and leads render with **zero visual distinction** from Meta-sourced ones across all overview cards and data tables.

### Rationale
- **UI Parity**: Adding badges like "MANUAL" or "META" to every row created visual clutter and hierarchy imbalance.
- **Backend Tracking**: Provenance is explicitly tracked on the backend via the `source` field (`meta` vs `manual` for campaigns; `meta_realtime`, `meta_backfill`, vs `manual` for leads). The frontend intentionally chooses not to render distinct visual badges for these sources, keeping cards and tables clean and uniform.

---

## [2026-08-05] In-Memory Auth Token Storage in AuthContext

### Context
All backend API routes require HTTP Bearer token authentication.

### Decision
The auth token is stored exclusively in React memory inside [`src/context/AuthContext.tsx`](file:///home/rpsoftwarelab/Documents/whatsApp_automation/frontend/src/context/AuthContext.tsx). It is **never** saved to browser `localStorage` or `sessionStorage`.

### Rationale
- **XSS Defense**: Storing access tokens in web storage exposes them to exfiltration by malicious scripts or third-party dependencies during XSS exploits. Keeping the token in React closure memory isolates it from storage inspection tools.
- **Tradeoff**: Reloading the page clears the token, requiring the user to log in again. This tradeoff was accepted as necessary for admin security compliance.

---

## [2026-08-05] WhatsApp Inbox Messaging Locks and 409 Conflict Handling

### Context
In `WhatsAppInboxPage.tsx`, human agent manual messaging must coexist with automated AI sequences and backfilled historical leads.

### Decision
1. **Old Lead Lock**: Outbound messaging is hard-disabled for leads with `is_old_lead: true`, accompanied by an inline amber warning banner.
2. **AI Mode Lock**: When `ai_mode` is enabled for a lead, the input bar is disabled with an inline indigo notice.
3. **409 Conflict Handling**: If an agent attempts to send a message while AI mode is active on the backend, the backend responds with HTTP status 409. The frontend catches this specific error in `sendMutation.onError` and opens `aiConflictModal` instructing the user to turn off AI mode before sending.

---

## [2026-08-08] SessionStorage Auth Token Persistence (Supersedes In-Memory Guidance)

### Context
Previous guidance mandated strictly in-memory token storage to mitigate XSS risks. However, clearing the token on every page refresh caused significant usability friction during navigation and administration.

### Decision
The earlier in-memory guidance is **superseded**. Per `FRONTEND_PATCH_3_PROMPT.md`, auth token persistence in [`src/context/AuthContext.tsx`](file:///home/rpsoftwarelab/Documents/whatsApp_automation/frontend/src/context/AuthContext.tsx) was deliberately updated to use `sessionStorage`.

### Rationale & Mechanism
- **UX Requirement**: `sessionStorage` preserves authentication across page reloads and tab navigations while scoping token lifetime to the active browser tab session.
- **Scope**: `sessionStorage` avoids writing tokens to persistent `localStorage` while ensuring uninterrupted admin sessions across page refreshes.

---

## [2026-08-10] User ID & Password Login Authentication Flow

### Context
Asking end users to manually copy and paste 64-character raw hex Bearer tokens into the login form creates friction and UX confusion.

### Decision
1. **User ID & Password Login Endpoint**: Introduced `POST /api/auth/login` accepting `{ username, password }` and returning the system Bearer access token.
2. **Single-Admin Credential Scope**: For V1, the system supports a single hardcoded admin credential pair (`ADMIN_USERNAME` / `ADMIN_PASSWORD`) defined in service environment configuration. Multiple user accounts or per-user database tables are explicitly out of scope for V1.
3. **Constant-Time Comparison**: Password authentication uses constant-time string comparison (`secrets.compare_digest`) to prevent side-channel timing attacks.
4. **Brute-Force Protection**: Implemented IP-based sliding window rate limiting. If an IP accumulates 5 failed login attempts within 15 minutes, the endpoint responds with HTTP 429 Too Many Requests.

