# JarvisCalling.ai — Lead Management & CRM Dashboard

A production-ready React SPA for managing Meta Ads leads, WhatsApp conversations, campaign tracking, and Google Calendar-based appointment booking.

**Live URL:** [https://www.jarviscalling.ai/](https://www.jarviscalling.ai)

---

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [Getting Started](#getting-started)
- [Routing Reference](#routing-reference)
- [API Reference](#api-reference)
- [Code Reference](#code-reference)

---

## Architecture Overview

```
Browser (React SPA)
        │
        ├── Leads API (leadsautoapis.jarviscalling.ai)   ← Meta Ads leads, campaigns, WhatsApp
        │
        ├── WATI API (live-mt-server.wati.io)            ← WhatsApp message templates
        │
        └── Google Calendar API (googleapis.com)         ← Direct from browser with access token
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | React 19 (ESM, Vite) |
| Routing | React Router v7 |
| State Management | Zustand |
| Styling | Tailwind CSS v4 |
| Icons | Lucide React |
| Google Auth | Google Identity Services (GIS) — Authorization Code Flow |
| Build Tool | Vite 7 |

---

## Project Structure

```
.
├── index.html                      # Vite entry HTML; loads Google Identity Services script
├── vite.config.js                  # Vite config with React plugin
├── vercel.json                     # Vercel SPA routing fallback config
└── src/
    ├── main.jsx                    # React DOM entry point
    ├── App.jsx                     # Root router — public and dashboard route groups
    ├── config/
    │   └── index.js                # Centralised env config (API URLs, Google Client ID)
    ├── layouts/
    │   ├── DashboardLayout.jsx     # Authenticated layout with Sidebar
    │   └── PublicLayout.jsx        # Public layout for login / landing pages
    ├── pages/
    │   ├── Login.jsx               # Login page
    │   ├── Signup.jsx              # Signup page
    │   ├── LandingPage.jsx         # Landing page route
    │   ├── Leads.jsx               # All-leads view with search and filters
    │   ├── DailyLeads.jsx          # Leads filtered by selected date
    │   ├── Last30DaysLeads.jsx     # Leads from the past 30 days
    │   ├── PromotedLeads.jsx       # Promoted / in-store leads view
    │   ├── Campaigns.jsx           # Campaign listing with template assignment
    │   ├── Whatsapp.jsx            # Full WhatsApp inbox — contacts + chat thread
    │   ├── CalendarPage.jsx        # Google Calendar daily view for a specific store
    │   ├── CalendarSettings.jsx    # Calendar availability / hours settings
    │   ├── BookCalendarEvent.jsx   # Standalone event booking page (moved into LeadModal)
    │   ├── Home.jsx                # Dashboard home / stats page
    │   └── Setting.jsx             # User / account settings
    ├── components/
    │   ├── Sidebar.jsx             # Navigation sidebar with dynamic calendar links
    │   ├── Navigation.jsx          # Top navigation bar
    │   ├── AddCalendarModal.jsx    # Modal to add a new Google Calendar store
    │   ├── TemplateModal.jsx       # Modal to browse and assign WhatsApp templates
    │   ├── AutoMessageCampaignsModal.jsx  # Modal to configure auto-message campaigns
    │   ├── CalendarSettingsModal.jsx      # Inline calendar hours settings modal
    │   ├── DemoLeadModal.jsx       # Modal to create a demo/test lead
    │   ├── landingpage.jsx         # Landing page component tree
    │   ├── landingpage/            # Landing page sub-components (privacy policy, ToS)
    │   ├── ui/                     # Shared primitive UI components
    │   └── LeadModal/              # Lead detail modal (tabbed interface)
    │       ├── index.jsx           # Modal shell + tab controller
    │       ├── constants.js        # Tab definitions and status options
    │       ├── helpers.js          # WhatsApp link builder, date formatters
    │       └── tabs/
    │           ├── BasicInfoTab.jsx        # Lead name, phone, email, status
    │           ├── NotesTab.jsx            # Lead notes (up to 10, ordered)
    │           ├── CallsTab.jsx            # Call log for a lead
    │           ├── QuestionsTab.jsx        # Hearing test Q&A for a lead
    │           ├── WhatsAppTab.jsx         # In-modal WhatsApp chat thread
    │           ├── BookEventTab.jsx        # Google Calendar event booking inline
    │           └── SendConversionTab.jsx   # Send conversion data tab
    ├── services/
    │   ├── auth.js                 # Auth service (mock login/signup; stub for real API)
    │   ├── leads.js                # Leads API — daily, campaign, 30-day, notes, answers
    │   ├── campaigns.js            # Campaigns API — list, active, paused, template update
    │   ├── whatsapp.js             # WhatsApp API — contacts, messages, send, sync
    │   ├── templates.js            # WATI API — fetch approved WhatsApp templates
    │   └── google.js               # Google Calendar service — auth, events, create, disconnect
    ├── store/
    │   └── useAuthStore.js         # Zustand store — user state + isAuthenticated flag
    ├── utils/
    │   ├── apiClient.js            # Fetch wrapper with error handling + HTTP helpers
    │   └── calendarManager.js      # localStorage CRUD for connected calendar stores
    └── hooks/
        └── use-media-query.js      # Custom hook for responsive breakpoints
```

---

## Environment Variables

Create a `.env` file in the project root:

```env
VITE_API_BASE_URL=http://localhost:3000
VITE_LEADS_API_BASE_URL=https://leadsautoapis.jarviscalling.ai
VITE_BACKEND_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=your-google-oauth-client-id
VITE_WATI_API_TOKEN=your-wati-bearer-token
```

---

## Getting Started

```bash
# Install dependencies
npm install

# Start Vite dev server
npm run dev

# Build for production
npm run build
```

The dev server runs on `http://localhost:5173` by default.

---

## Routing Reference

### Public Routes

| Path | Component | Description |
|---|---|---|
| `/` | `LandingPage` | Marketing landing page |
| `/login` | `Login` | User login |
| `/signup` | `Signup` | User registration |
| `/privacy-policy` | `PrivacyPolicy` | Privacy policy page |
| `/terms-of-service` | `TermsOfService` | Terms of service page |

### Dashboard Routes (authenticated, with Sidebar)

| Path | Component | Description |
|---|---|---|
| `/campaigns` | `Campaigns` | All campaigns with template + auto-message controls |
| `/leads` | `Leads` | Full lead list with modal detail view |
| `/daily-leads` | `DailyLeads` | Leads filtered by a selected date |
| `/last-30-days` | `Last30DaysLeads` | Leads from the past 30 days |
| `/promoted-leads` | `PromotedLeads` | In-store / promoted leads |
| `/whatsapp` | `Whatsapp` | WhatsApp inbox and chat threads |
| `/calendar/:calendarId` | `CalendarPage` | Daily calendar view for a specific store |
| `/calendar/:calendarId/settings` | `CalendarSettings` | Availability hours for a calendar |
| `/settings` | `Settings` | Account settings |

---

## API Reference

### External APIs (called from frontend)

| Service | Endpoint | Description |
|---|---|---|
| Leads API | `GET /leads/date/:date` | Daily leads |
| Leads API | `GET /leads/campaign/:campaignId` | Campaign leads |
| Leads API | `GET /leads/last-30-days` | Last 30 days leads |
| Leads API | `GET /leads/:leadId/detail` | Lead detail |
| Leads API | `PUT /leads/:leadId/detail` | Update lead detail |
| Leads API | `GET /leads/:leadId/notes` | Lead notes |
| Leads API | `POST /leads/:leadId/notes` | Add lead note |
| Leads API | `GET /leads/:leadId/answers` | Lead Q&A answers |
| Leads API | `PUT /leads/:leadId/answers` | Update lead answers |
| Leads API | `POST /leads/demo` | Create demo lead |
| Campaigns API | `GET /campaigns/` | All campaigns |
| Campaigns API | `GET /campaigns/active` | Active campaigns |
| Campaigns API | `GET /campaigns/paused` | Paused campaigns |
| Campaigns API | `POST /campaigns/:id/template` | Set campaign template |
| Campaigns API | `POST /campaigns/:id/auto-message` | Toggle auto-message |
| WhatsApp API | `GET /whatsapp/contacts` | Paginated contact list |
| WhatsApp API | `GET /whatsapp/messages/:phone` | Chat history for a contact |
| WhatsApp API | `POST /whatsapp/send-template` | Send template message |
| WhatsApp API | `POST /whatsapp/send-message` | Send session message |
| WhatsApp API | `POST /whatsapp/sync-chats/:phone` | Sync historical messages |
| WATI API | `GET /api/v1/getMessageTemplates` | Fetch approved templates |
| Google Calendar | `GET /calendars/primary/events` | List events for a date |
| Google Calendar | `POST /calendars/primary/events` | Create a new event |

---

## Code Reference

### `src/App.jsx`

Root router component. Declares two layout groups — `PublicLayout` (no auth) and `DashboardLayout` (with sidebar). All route-to-page mappings are defined here.

---

### `src/config/index.js`

Centralized runtime config. Reads all `VITE_*` env vars and exports a single `config` object consumed across all services.

| Export | Keys | Purpose |
|---|---|---|
| `config` | `apiBaseUrl`, `leadsApiBaseUrl`, `googleClientId`, `backendUrl`, `appName`, `version` | Single source of truth for all base URLs and keys |

---

### `src/store/useAuthStore.js`

| Export | State / Actions | Purpose |
|---|---|---|
| `useAppStore` | `user`, `isAuthenticated`, `setUser(user)`, `logout()` | Global Zustand store for authenticated user state |

---

### `src/utils/apiClient.js`

| Function / Export | Input | Output | Purpose |
|---|---|---|---|
| `apiRequest(url, options)` | URL path or full URL + fetch options | `Promise<any>` | Centralised fetch wrapper; prepends `leadsApiBaseUrl` for relative paths; throws `APIError` on non-2xx |
| `api.get(url)` | URL | `Promise<any>` | Shorthand GET |
| `api.post(url, data)` | URL + body object | `Promise<any>` | Shorthand POST with JSON body |
| `api.put(url, data)` | URL + body object | `Promise<any>` | Shorthand PUT with JSON body |
| `api.delete(url)` | URL | `Promise<any>` | Shorthand DELETE |
| `extractTime(isoString)` | ISO datetime string | `"h:mm AM/PM"` string | Formats ISO timestamp to 12-hour time |
| `extractDate(isoString)` | ISO datetime string | `"YYYY-MM-DD"` string | Extracts date part from ISO timestamp |
| `capitalizeStatus(str)` | Raw API status string | Display-friendly label | Maps `new` → `New`, `contacted` → `Contacted`, etc. |
| `APIError` | `(message, status, data)` | Error instance | Custom error class with HTTP status and response data |

---

### `src/utils/calendarManager.js`

localStorage-backed CRUD for connected Google Calendar stores. Keyed under `mets_calendars`.

| Method | Input | Output | Purpose |
|---|---|---|---|
| `getAll()` | — | `Array<Calendar>` | Returns all stored calendars |
| `getById(id)` | `string` calendarId | `Calendar \| undefined` | Finds a single calendar by ID |
| `create(storeName)` | `string` storeName | `Calendar` object | Creates calendar with auto-generated slug ID; saves to localStorage |
| `update(id, updates)` | `string` ID + partial object | Updated `Calendar \| null` | Merges updates into existing calendar entry |
| `delete(id)` | `string` calendarId | `true` | Removes calendar and its associated Google token from localStorage |

---

### `src/services/auth.js`

| Method | Input | Output | Purpose |
|---|---|---|---|
| `authService.signup(userData)` | `{ name, email, password }` | `Promise<{ success, token, user }>` | User registration (currently mock; real endpoint stubbed) |
| `authService.login(credentials)` | `{ email, password }` | `Promise<{ success, token, user }>` | User login with strict credential check (currently mock) |

---

### `src/services/leads.js`

| Method | Input | Output | Purpose |
|---|---|---|---|
| `leadsService.getDailyLeads(date)` | `"YYYY-MM-DD"` | `Promise<{ leads, stats }>` | Fetches and transforms leads for a specific date |
| `leadsService.getLeadsByCampaign(campaignId)` | Campaign ID string | `Promise<Array>` | Fetches and transforms leads for a campaign |
| `leadsService.getLast30DaysLeads()` | — | `Promise<{ leads, stats }>` | Fetches leads from the past 30 days |
| `leadsService.getPromotedLeads(date, page, limit)` | Date + pagination | `Promise<{ leads, pagination }>` | Returns promoted/in-store leads (mock data; API pending) |
| `leadsService.createDemoLead(demoLead)` | Demo lead object | `Promise<Object>` | Creates a test lead via `POST /leads/demo` |
| `leadsService.getLeadDetail(leadId)` | Lead ID string | `Promise<Object>` | Fetches full detail for a single lead |
| `leadsService.updateLeadDetail(leadId, detail)` | Lead ID + `{ branch_name, status, name, email, phone_number, city }` | `Promise<Object>` | Updates editable lead fields |
| `leadsService.getLeadNotes(leadId)` | Lead ID string | `Promise<Array>` | Fetches ordered notes (1→10) for a lead |
| `leadsService.addLeadNote(leadId, content)` | Lead ID + note string | `Promise<Object>` | Appends a new note to a lead |
| `leadsService.getLeadAnswers(leadId)` | Lead ID string | `Promise<Object>` | Fetches hearing test Q&A answers for a lead |
| `leadsService.updateLeadAnswers(leadId, answers)` | Lead ID + answers object | `Promise<Object>` | Updates Q&A answers for a lead |
| `transformLeadData(apiLead)` *(internal)* | Raw API lead object | UI-formatted lead object | Normalizes field names, formats dates/times, capitalizes status |

---

### `src/services/campaigns.js`

| Method | Input | Output | Purpose |
|---|---|---|---|
| `campaignsService.getCampaigns(sync)` | `boolean` sync flag | `Promise<Array>` | Fetches all campaigns; optionally syncs with Meta |
| `campaignsService.getActiveCampaigns()` | — | `Promise<Array>` | Fetches only active campaigns |
| `campaignsService.getPausedCampaigns()` | — | `Promise<Array>` | Fetches only paused campaigns |
| `campaignsService.updateCampaignTemplate(campaignId, templateName)` | Campaign ID + template name | `Promise<Object>` | Assigns a WhatsApp template to a campaign |
| `campaignsService.updateAutoMessageStatus(campaignId, enabled)` | Campaign ID + boolean | `Promise<Object>` | Toggles automated messaging on/off for a campaign |
| `campaignsService.getAutoMessageEnabledCampaigns()` | — | `Promise<Array>` | Returns campaigns with auto-message currently enabled |
| `transformCampaignData(apiCampaign)` *(internal)* | Raw API campaign object | UI-formatted campaign object | Normalizes platform casing, status, template name |

---

### `src/services/whatsapp.js`

| Function | Input | Output | Purpose |
|---|---|---|---|
| `normalisePhone(raw)` | Raw phone string | E.164-style string (no `+`) | Strips formatting; prepends South Africa `27` country code if missing |
| `sendTemplateMessage(campaignId, rawPhone)` | Campaign ID + raw phone | `Promise<Object>` | Sends a campaign WhatsApp template message to a number |
| `getContacts(page, pageSize)` | Page number + page size | `Promise<Array>` | Fetches paginated WhatsApp contacts; empty array signals end of list |
| `getMessages(phone)` | Phone string with country code | `Promise<Array>` | Fetches full message history for a contact |
| `sendMessage(phone, messageText)` | Phone + text string | `Promise<Object>` | Sends a free-form session message to a contact |
| `syncChats(phone)` | Phone string | `Promise<Object>` | Triggers a historical message sync for a contact |

---

### `src/services/templates.js`

| Method | Input | Output | Purpose |
|---|---|---|---|
| `templatesService.getTemplates(pageSize, pageNumber)` | Page size + page number | `Promise<{ templates, pagination, result }>` | Fetches WATI message templates with pagination |
| `templatesService.getTemplatesByUrl(url)` | Full pagination URL | `Promise<{ templates, pagination, result }>` | Fetches the next page of templates using a direct link |
| `templatesService.filterApprovedTemplates(templates)` | Template array | Filtered array | Returns only templates with `status === 'APPROVED'` |

---

### `src/services/google.js`

| Method | Input | Output | Purpose |
|---|---|---|---|
| `googleService.getTokenForCalendar(calendarId)` | Calendar ID string | Token object \| `null` | Reads stored access token from localStorage |
| `googleService.checkSession(calendarId)` | Calendar ID string | `boolean` | Returns `true` if a token exists for the calendar |
| `googleService.login(calendarId, storeName)` | Calendar ID + store name | `Promise<Object>` | Initiates Google OAuth2 code flow; exchanges code with backend; saves token |
| `googleService.refreshAccessToken(calendarId)` | Calendar ID string | `Promise<string>` — new access token | Calls backend token refresh endpoint; updates localStorage token |
| `googleService.fetchWithRetry(calendarId, url, options)` | Calendar ID + fetch args | `Promise<Response>` | Fetch wrapper that auto-retries with refreshed token on 401 |
| `googleService.getEvents(date, calendarId)` | `Date` object + calendar ID | `Promise<{ date, count, events }>` | Fetches and formats Google Calendar events for a day |
| `googleService.createEvent(calendarId, eventData)` | Calendar ID + Google event object | `Promise<Object>` — created event | Creates a new Google Calendar event with attendee notifications |
| `googleService.getConnectedStores()` | — | `Array<{ id, name }>` | Scans localStorage for all connected calendar sessions |
| `googleService.saveCalendarSettings(calendarId, { openTime, closeTime })` | Calendar ID + hours | `Promise<Object>` | PATCHes store operating hours |
| `googleService.disconnectCalendar(calendarId)` | Calendar ID string | `Promise<true>` | Calls disconnect endpoint + clears localStorage token; fires `calendarsUpdated` event |
| `googleService.logout(calendarId)` | Calendar ID string | — | Removes token for a specific calendar from localStorage |
| `googleService.syncUserCalendars()` | — | — | On app load: fetches all user's stores and primes localStorage tokens |
