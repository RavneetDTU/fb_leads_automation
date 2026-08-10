# ARCHITECTURE.md — Current Frontend State

## Overview
HAL Jarvis v2 Frontend is built as a single-page React application delivering real-time monitoring and control over WhatsApp lead automation. The architecture emphasizes high-performing data polling via React Query, clean visual aesthetics using custom Tailwind design tokens, and strict separation between layout, page-level routing, and modal states.

---

## Page List & Routing Setup

All routes are defined in [`src/App.tsx`](file:///home/rpsoftwarelab/Documents/whatsApp_automation/frontend/src/App.tsx) using React Router v7 (`BrowserRouter`, `Routes`, `Route`, `Navigate`).

| Path | Page Component | Description |
|---|---|---|
| `/login` | [`LoginPage.tsx`](file:///home/rpsoftwarelab/Documents/whatsApp_automation/frontend/src/pages/LoginPage.tsx) | Unauthenticated entry page for token authentication. |
| `/campaigns` | [`CampaignsPage.tsx`](file:///home/rpsoftwarelab/Documents/whatsApp_automation/frontend/src/pages/CampaignsPage.tsx) | Overview grid of Meta & manual lead campaigns with 4 metric cards, template assignment picker, and manual campaign creation modal. |
| `/campaigns/:id/leads` | [`CampaignLeadsPage.tsx`](file:///home/rpsoftwarelab/Documents/whatsApp_automation/frontend/src/pages/CampaignLeadsPage.tsx) | Detail view listing leads for a specific campaign, search filter, header "Auto Message" toggle, and template assignment modal. |
| `/last-30-days` | [`LastThirtyDaysPage.tsx`](file:///home/rpsoftwarelab/Documents/whatsApp_automation/frontend/src/pages/LastThirtyDaysPage.tsx) | Lead activity log with 5 summary stats, campaign & status dropdown filters, per-lead AI mode toggles, and manual lead creation modal. |
| `/whatsapp` | [`WhatsAppInboxPage.tsx`](file:///home/rpsoftwarelab/Documents/whatsApp_automation/frontend/src/pages/WhatsAppInboxPage.tsx) | Dual-panel WhatsApp Web messaging inbox with live message history, AI mode toggling, and 409 conflict handling. |
| `/settings` | [`SettingsPage.tsx`](file:///home/rpsoftwarelab/Documents/whatsApp_automation/frontend/src/pages/SettingsPage.tsx) | Platform settings form (Meta Ad Account ID, Graph Access Token, WATI credentials). |
| `/settings/calendars` | [`CalendarsPage.tsx`](file:///home/rpsoftwarelab/Documents/whatsApp_automation/frontend/src/pages/CalendarsPage.tsx) | Store Branches listing page (navigated to as "Store Branches" in `Sidebar.tsx`) for branch creation, deletion, and Google OAuth URL initiation. |
| `/settings/calendars/:id` | [`CalendarConfigPage.tsx`](file:///home/rpsoftwarelab/Documents/whatsApp_automation/frontend/src/pages/CalendarConfigPage.tsx) | Store branch calendar availability and configuration management page. |
| `*` | Redirection | Catches all unknown routes and redirects to `/campaigns`. |

---

## Component Structure & Hierarchy

```
App Layout Container (AppLayout.tsx)
├── Sidebar Navigation (Sidebar.tsx)
│   ├── Brand Header (Logo.tsx)
│   ├── Nav Links (Campaigns, Last 30 Days, WhatsApp Inbox [Live], Settings)
│   ├── Calendar & Branch Nav (Store Branches -> /settings/calendars)
│   └── Footer (Sign out action clearing AuthContext token)
└── Main Page Content Area (Rendered via <Outlet />)
```

### Key Shared Components
- **`LeadModal`** ([`src/components/leads/LeadModal.tsx`](file:///home/rpsoftwarelab/Documents/whatsApp_automation/frontend/src/components/leads/LeadModal.tsx)): Drawer modal providing detailed lead inspection, raw Meta form fields payload, lead notes timeline (add note feature), message log view, and status updates.
- **`TemplatePicker`** ([`src/components/campaigns/TemplatePicker.tsx`](file:///home/rpsoftwarelab/Documents/whatsApp_automation/frontend/src/components/campaigns/TemplatePicker.tsx)): Modal dialog for fetching available WATI WhatsApp templates and applying a template to a campaign.
- **`UI Components`** ([`src/components/ui/`](file:///home/rpsoftwarelab/Documents/whatsApp_automation/frontend/src/components/ui/)):
  - `Badge.tsx`: Status badges (`StatusBadge`, `ActiveBadge`, `OldLeadBadge`).
  - `Toggle.tsx`: Reusable toggle switch component with custom color variants (`emerald`, `indigo`).
  - `Pagination.tsx`: Pagination control with Previous/Next and page indicator buttons.
  - `Spinner.tsx` & `States.tsx`: Loading indicators, skeleton cards/tables, `ErrorState`, and `EmptyState`.
  - `Modal.tsx`: Reusable modal wrapper with backdrop blur and responsive layout.

---

## Data-Fetching & State Management

### Data-Fetching Architecture
Data fetching is managed by **TanStack React Query v5** (`@tanstack/react-query`) interacting with a custom HTTP client in [`src/lib/api.ts`](file:///home/rpsoftwarelab/Documents/whatsApp_automation/frontend/src/lib/api.ts).

```
Component -> TanStack useQuery / useMutation -> src/lib/api.ts -> fetch(BASE_URL + path) -> Backend REST API
```

- **HTTP Client Specs** (`api.ts`):
  - Resolves `BASE_URL` from `import.meta.env.VITE_API_BASE_URL` (defaults to `https://wati.ayurvedicpromise.com`).
  - Automatically attaches `Content-Type: application/json` and `Authorization: Bearer <token>`.
  - Throws typed `ApiError` instances containing HTTP status codes and detail messages.
- **Query Cache Policies**:
  - `LastThirtyDaysPage` and `WhatsAppInboxPage` enforce a **10-second polling interval** (`refetchInterval: 10_000`) for real-time lead logs and conversation sync.
  - Mutations leverage optimistic updates via React Query's `onMutate` cache manipulation and `onSettled` cache invalidation.

### Global State Management
1. **`AuthContext`** ([`src/context/AuthContext.tsx`](file:///home/rpsoftwarelab/Documents/whatsApp_automation/frontend/src/context/AuthContext.tsx)):
   - Stores the active HTTP Bearer authentication token in React component state.
   - **In-memory only**: The token is never written to `localStorage` or `sessionStorage` for security.
2. **`ToastContext`** ([`src/context/ToastContext.tsx`](file:///home/rpsoftwarelab/Documents/whatsApp_automation/frontend/src/context/ToastContext.tsx)):
   - Manages floating toast alert notifications (`success`, `error`, `info`).

---

## WhatsApp Inbox Functional State (`/whatsapp`)

`WhatsAppInboxPage.tsx` implements a fully functional native WhatsApp Web dual-panel user interface:

1. **Left Contact Panel (35% width)**:
   - Header with `🟢 WhatsApp Web Connected` status badge and contact search bar.
   - Queries `GET /api/inbox/conversations?limit=50&search=...` (polls every 10 seconds).
   - Renders avatar initials, lead full name, last message preview, distance timestamps, and unread indicators.
2. **Right Active Chat Container (65% width)**:
   - Header with contact details, `StatusBadge`, `OldLeadBadge`, and an **AI Mode toggle**.
   - Queries `GET /api/inbox/conversations/:id/messages` (polls every 10 seconds).
   - Wallpaper chat thread displaying message bubbles with explicit sender tags (`🤖 Jarvis AI`, `Human Agent`, `Lead`), timestamp, and double checkmarks (`CheckCheck`).
   - Sticky bottom message input bar:
     - Disabled with warning banner if `is_old_lead: true` ("Outbound WhatsApp messaging is strictly disabled for historical/backfilled leads").
     - Disabled with notification banner if `ai_mode: true` ("Jarvis AI mode is active. Turn off AI mode in the header to send manual agent messages").
3. **409 AI Conflict Handling**:
   - If a manual message send mutation encounters an HTTP `409 Conflict` response from the backend, `WhatsAppInboxPage` pops the `aiConflictModal` explaining that Jarvis AI is actively automating replies and requires manual override.
