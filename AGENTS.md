# AGENTS.md — Frontend Orientation & Ground Rules

## Project Summary
HAL Jarvis v2 Frontend is a single-page application (SPA) built for managing Meta ad lead generation campaigns and automated WhatsApp conversational flows. It provides high-level metrics, per-campaign lead management, historical lead logs, native dual-panel WhatsApp Web inbox messaging, store branch calendar configuration, and platform settings.

## Technology Stack
- **Core Framework**: React 19 (`react`, `react-dom`)
- **Build Tool / Bundler**: Vite 8 (`vite`, `@vitejs/plugin-react`)
- **Routing**: React Router v7 (`react-router-dom`)
- **Data Fetching & Caching**: TanStack React Query v5 (`@tanstack/react-query`)
- **Styling**: TailwindCSS v3 (`tailwindcss`, `@tailwindcss/forms`, `autoprefixer`)
- **Icons**: Lucide React (`lucide-react`)
- **Date Formatting**: date-fns (`date-fns`)
- **Linter**: Oxlint (`oxlint`)
- **Deployment Platform**: Vercel (`https://jarvis.translateme.network`)

## Directory Map
```
frontend/
├── .env                     # Local environment variables (VITE_API_BASE_URL)
├── .env.example             # Example environment variable template
├── vercel.json              # Vercel deployment configuration & security/CSP headers
├── vite.config.ts           # Vite configuration
├── package.json             # Dependencies and scripts
├── src/
│   ├── main.tsx             # Application entry point (QueryClient & AuthProvider)
│   ├── App.tsx              # React Router route definitions
│   ├── App.css              # Custom styling overrides
│   ├── index.css            # Base Tailwind imports & CSS components
│   ├── lib/
│   │   ├── api.ts           # Typed fetch wrapper with Bearer token authentication & ApiError handling
│   │   └── queryClient.ts   # TanStack QueryClient instance definition
│   ├── context/
│   │   ├── AuthContext.tsx  # In-memory authentication state (Bearer token management)
│   │   └── ToastContext.tsx # Application-wide toast notification system
│   ├── types/
│   │   └── index.ts         # Shared TypeScript interfaces and domain types
│   ├── components/
│   │   ├── layout/          # AppLayout container & Sidebar navigation
│   │   ├── campaigns/       # TemplatePicker modal component
│   │   ├── leads/           # LeadModal detail drawer component
│   │   └── ui/              # Reusable UI elements (Badge, Modal, Pagination, Spinner, States, Toggle)
│   └── pages/
│       ├── LoginPage.tsx            # Login route (/login)
│       ├── CampaignsPage.tsx        # Campaigns overview route (/campaigns)
│       ├── CampaignLeadsPage.tsx    # Per-campaign leads detail route (/campaigns/:id/leads)
│       ├── LastThirtyDaysPage.tsx   # Lead logs & summary stats route (/last-30-days)
│       ├── WhatsAppInboxPage.tsx    # Native WhatsApp Web inbox route (/whatsapp)
│       ├── SettingsPage.tsx         # Platform settings route (/settings)
│       ├── CalendarsPage.tsx        # Store branches listing route (/settings/calendars)
│       └── CalendarConfigPage.tsx   # Store branch config route (/settings/calendars/:id)
```

## Concrete Commands

### Development Server
```bash
npm run dev
```

### Production Build
```bash
npm run build
```

### Linting
```bash
npm run lint
```

### Preview Build Locally
```bash
npm run preview
```

## Non-Negotiable Rules
- **SessionStorage Auth Token Persistence**: Auth tokens MUST be persisted in `sessionStorage` within [`AuthContext.tsx`](file:///home/rpsoftwarelab/Documents/whatsApp_automation/frontend/src/context/AuthContext.tsx) to preserve session state across page reloads — never write tokens to `localStorage`. For rationale, see [`DECISIONS.md#2026-08-08-sessionstorage-auth-token-persistence-supersedes-in-memory-guidance`](file:///home/rpsoftwarelab/Documents/whatsApp_automation/frontend/DECISIONS.md#2026-08-08-sessionstorage-auth-token-persistence-supersedes-in-memory-guidance).
- **Zero Visual Distinction for Manual Records**: Manually created campaigns and leads MUST render with zero visual distinction from Meta-sourced ones (no badges or labels marking them as manual). For rationale, see [`DECISIONS.md#zero-visual-distinction-for-manual-records`](file:///home/rpsoftwarelab/Documents/whatsApp_automation/frontend/DECISIONS.md#zero-visual-distinction-for-manual-records).
- **Campaign Active Mapping**: Campaign-card toggles and per-lead lead-table toggles were deliberately removed to map campaign automation conceptually to `campaign.is_active`. For rationale, see [`DECISIONS.md#removal-of-campaign-card-auto-mode-toggle-and-per-lead-ai-mode-column`](file:///home/rpsoftwarelab/Documents/whatsApp_automation/frontend/DECISIONS.md#removal-of-campaign-card-auto-mode-toggle-and-per-lead-ai-mode-column).
- **Messaging Restrictions for Old Leads & AI Mode**: Outbound messaging inputs MUST remain disabled when `is_old_lead` is `true` or when `ai_mode` is `true`. For rationale, see [`DECISIONS.md#whatsapp-inbox-messaging-locks-and-409-conflict-handling`](file:///home/rpsoftwarelab/Documents/whatsApp_automation/frontend/DECISIONS.md#whatsapp-inbox-messaging-locks-and-409-conflict-handling).
- **Shared API Contract Integrity**: The frontend MUST consume endpoints consistent with `API_CONTRACTS.md`. Do not modify local endpoint signatures without updating the shared contract. For rationale, see [`VIBE_CODING_GUIDE.md`](file:///home/rpsoftwarelab/Documents/whatsApp_automation/frontend/VIBE_CODING_GUIDE.md).
