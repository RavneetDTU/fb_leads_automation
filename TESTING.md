# TESTING.md — Frontend Invariants & QA Checklist

## Automated Testing Status

> [!NOTE]
> **No Automated Test Framework Presently Configured**:
> The `package.json` file currently contains scripts for development, building (`tsc -b && vite build`), previewing, and linting (`oxlint`). There is **no automated testing framework** (such as Vitest, React Testing Library, Jest, Playwright, or Cypress) installed in the repository at this time.

All frontend testing currently relies on manual QA workflows and strict adherence to structural invariants. Setting up an automated component/E2E test suite is tracked in [`TODO_BACKLOG.md`](file:///home/rpsoftwarelab/Documents/whatsApp_automation/frontend/TODO_BACKLOG.md).

---

## Non-Negotiable System Invariants

1. **Auth Token Security Isolation**:
   - The authentication token MUST reside solely within React memory in [`AuthContext.tsx`](file:///home/rpsoftwarelab/Documents/whatsApp_automation/frontend/src/context/AuthContext.tsx). It must never be written to `localStorage` or `sessionStorage`.
2. **Old Lead Outbound Message Lockdown**:
   - Outbound WhatsApp message input MUST be locked whenever `is_old_lead` is `true`. The amber warning banner ("Outbound WhatsApp messaging is strictly disabled for historical/backfilled leads") must be rendered.
3. **AI Mode Manual Send Guard**:
   - Outbound messaging input MUST be locked whenever `ai_mode` is `true`. Attempting to send a message when AI mode is active must trigger an HTTP 409 error, which MUST open `aiConflictModal` requiring manual override.
4. **Visual Parity Invariant**:
   - Manually created campaigns (`source: "manual"`) and manually created leads (`source: "manual"`) MUST render with zero visual distinction from Meta-sourced ones (no badges or visual tags indicating manual creation).
5. **Response Shape Safety**:
   - Data consumers MUST account for API shape differences:
     - `GET /api/leads` returns `{ total, limit, offset, items }`.
     - `GET /api/campaigns/{id}/leads` returns `{ total, items }` (without `limit` or `offset` fields).

---

## Manual QA Verification Checklist

### 1. Authentication & Access Control
- [ ] Navigating to unauthenticated routes redirects appropriately.
- [ ] Entering valid token on `/login` sets `AuthContext` and redirects to `/campaigns`.
- [ ] Clicking "Sign out" in `Sidebar.tsx` clears `AuthContext` token.

### 2. Campaigns Overview (`/campaigns`)
- [ ] 4 top metric cards render summary data accurately (`GET /api/campaigns/summary`).
- [ ] Campaign cards render grid items with name, Meta campaign ID, lead count, and status badge (`ActiveBadge`).
- [ ] Clicking "Assign WhatsApp Template" opens `TemplatePicker` modal and updates template selection.
- [ ] Clicking "+ Create Manual Campaign" opens `CreateCampaignModal`, submits `POST /api/campaigns`, and refetches campaigns on success.
- [ ] Clicking anywhere on a campaign card navigates to `/campaigns/:id/leads`.

### 3. Campaign Leads Detail (`/campaigns/:id/leads`)
- [ ] Breadcrumb correctly links back to `/campaigns`.
- [ ] Header "Auto Message" toggle successfully sends `PATCH /api/campaigns/:id` with `{ is_active }`.
- [ ] Search input dynamically filters table rows by name or phone.
- [ ] Table headers render `['Name', 'Phone', 'Status', 'Date']` without an AI Mode toggle column.
- [ ] Clicking a lead row opens `LeadModal` drawer displaying form fields, notes, and activity timeline.

### 4. Lead Activity Logs (`/last-30-days`)
- [ ] Stat bar displays total inbound, new, template sent, unread, and responded counts.
- [ ] Campaign filter dropdown and Status filter dropdown update query params and trigger refetch (`refetchInterval: 10_000`).
- [ ] Per-lead "AI Mode" column toggle sends `PATCH /api/leads/:id` with `{ ai_mode }`.
- [ ] Clicking "+ Add a lead" opens `AddLeadModal`, submits `POST /api/leads`, and refetches logs.

### 5. WhatsApp Inbox (`/whatsapp`)
- [ ] Left contact panel polls `GET /api/inbox/conversations` every 10 seconds.
- [ ] Selecting a conversation loads message history (`GET /api/inbox/conversations/:id/messages`).
- [ ] Chat bubbles distinguish `🤖 Jarvis AI`, `Human Agent`, and `Lead` senders with correct timestamps and checkmarks.
- [ ] Toggling AI Mode in the header sends `PATCH /api/leads/:id` and updates input state.
- [ ] Attempting manual send while AI mode is enabled opens `aiConflictModal` (409 Conflict).
- [ ] Selecting a conversation where `is_old_lead: true` disables input and displays the amber warning banner.

### 6. Store Branches & Calendars (`/settings/calendars` & `/settings/calendars/:id`)
- [ ] Navigating via "Store Branches" in `Sidebar.tsx` opens `/settings/calendars`.
- [ ] Clicking "+ Add Store Branch" creates new calendar branch entry.
- [ ] Clicking "Connect Google Calendar" fetches auth URL (`/api/calendars/auth/url`) and redirects.
- [ ] Clicking a branch row opens `CalendarConfigPage` (`/settings/calendars/:id`).
