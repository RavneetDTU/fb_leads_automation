# TODO_BACKLOG.md — Open Task Queue

This file tracks unresolved work, missing API contract documentation, and functional gaps in the frontend application. The moment an item is resolved, it must be removed from this list.

---

## 1. `is_active` Campaign Control Gap on Overview Grid
- **What**: Removing the "Auto Mode" toggle from `CampaignCard` on [`CampaignsPage.tsx`](file:///home/rpsoftwarelab/Documents/whatsApp_automation/frontend/src/pages/CampaignsPage.tsx) leaves no inline way to toggle `is_active` directly on the `/campaigns` grid cards.
- **Why It Matters**: To activate or deactivate a campaign, users must click into `/campaigns/:id/leads` and toggle "Auto Message" in the page header, adding extra clicks for quick multi-campaign status adjustments.
- **Blocked On**: Product/UX design decision on whether to introduce a card context menu or restore an explicit inline switch.
- **When Noticed**: 2026-08-04 following toggle removal refactor.

---

## 2. Undocumented Backend API Endpoints (Gaps in `API_CONTRACTS.md`)
- **What**: The frontend calls several backend REST API endpoints that are currently missing from the shared [`API_CONTRACTS.md`](file:///home/rpsoftwarelab/Documents/whatsApp_automation/frontend/API_CONTRACTS.md) specification:
  - `PATCH /api/campaigns/{id}` — update campaign `is_active` state (called in `CampaignLeadsPage.tsx`).
  - `GET /api/campaigns/{id}/available-templates` — fetch WATI templates for campaign (called in `TemplatePicker.tsx`).
  - `POST /api/campaigns/{id}/apply-template` — apply WATI template to campaign (called in `TemplatePicker.tsx`).
  - `PATCH /api/leads/{id}` — update lead `ai_mode` state (called in `WhatsAppInboxPage.tsx`, `LastThirtyDaysPage.tsx`, `LeadModal.tsx`).
  - `GET /api/leads/{id}/notes` & `POST /api/leads/{id}/notes` — lead notes management (called in `LeadModal.tsx`).
  - `GET /api/leads/{id}/messages` — fetch lead message timeline (called in `LeadModal.tsx`).
  - `GET /api/settings` & `PUT /api/settings` — platform credentials & settings (called in `SettingsPage.tsx`).
  - `GET /api/calendars`, `POST /api/calendars`, `DELETE /api/calendars/{id}`, `GET /api/calendars/auth/url`, `GET /api/calendars/{id}/config`, `PUT /api/calendars/{id}/config` — store branch calendar management (called in `CalendarsPage.tsx`, `CalendarConfigPage.tsx`).
  - `GET /api/inbox/conversations`, `GET /api/inbox/conversations/{id}/messages`, `POST /api/inbox/conversations/{id}/messages` — native WhatsApp Web inbox (called in `WhatsAppInboxPage.tsx`).
- **Why It Matters**: Violates the single-source-of-truth rule. QA blind testing and backend API reconciliation require every consumed endpoint to be fully documented with request/response JSON schemas in `API_CONTRACTS.md`.
- **Blocked On**: Backend team updating `API_CONTRACTS.md` in backend repo and syncing verbatim.
- **When Noticed**: 2026-08-05 during codebase contract reconciliation.

---

## 3. Automated Test Framework Setup
- **What**: Configure Vitest and React Testing Library (or Playwright for E2E) in `package.json`.
- **Why It Matters**: Currently, `package.json` contains no test runner (`npm test`), leaving all regression checks dependent on manual QA workflows.
- **Blocked On**: Prioritization against Phase 2 backend features.
- **When Noticed**: 2026-08-05 during doc set audit.
