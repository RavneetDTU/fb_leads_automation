# Frontend Developer & Agent API Reference

This document is the complete, authoritative API specification for building the **Meta-to-WhatsApp Lead Booking Automation Platform** frontend interface. All endpoints documented here are live, fully implemented, and verified.

---

## 📢 Round 2 Patch Changelog (What Changed / What's New)

1. **New Summary Endpoints**:
   - `GET /api/campaigns/summary` → Returns `{ campaign_count, total_leads, converted_leads }`.
   - `GET /api/leads/summary?campaign_id=&window_days=30` → Returns `{ total, new, template_sent, unread, responded }`.
   - **Definition of "responded"**: Any lead with status **not in** `{NEW, TEMPLATE_SENT}` (i.e. lead has generated at least one inbound WhatsApp message or progressed to `UNREAD`, `WAITING_FOR_REPLY`, `BOOKED`, or `HANDED_OFF`).
2. **Resubmission History**:
   - Added `GET /api/leads/{id}/resubmissions` and embedded `resubmission_history: []` in `GET /api/leads/{id}` detail payload.
   - Removed all automated system notes from `Note` table. `Note` table is now strictly human-authored staff notes only (`author` = human staff email/name).
3. **Calendar Configuration Parity**:
   - `GET /api/calendars/{id}/config` and `PUT /api/calendars/{id}/config` include `buffer_minutes`, `closed_dates`, `daily_breaks`, and `time_blocks`.
4. **Pagination**:
   - `GET /api/campaigns` and `GET /api/leads` support pagination via `limit` (default 50) and `offset` (default 0).

---

## 1. Base Configuration & Authentication

- **Production Base URL**: `https://wati.ayurvedicpromise.com`
- **Local Dev Base URL**: `http://127.0.0.1:5040`
- **Swagger / OpenAPI Interactive Docs**: `https://wati.ayurvedicpromise.com/docs`
- **Authentication**: Include Bearer Token header on all `/api/...` requests:
  ```http
  Authorization: Bearer hal-admin-secret-token-2026
  ```

---

## 2. Core Data Models & Enums

### `LeadStatus` (Enum String)
- `NEW`: Newly ingested Meta lead; initial template message not yet sent.
- `TEMPLATE_SENT`: Initial WhatsApp template message sent to lead.
- `UNREAD`: Customer sent a new WhatsApp message (needs agent/AI attention).
- `WAITING_FOR_REPLY`: AI or human sent a response; waiting for customer reply.
- `BOOKED`: Hearing test appointment successfully booked in Google Calendar.
- `HANDED_OFF`: Conversation handed off to human supervisor via email notification.

### `MessageSender` (Enum String)
- `lead`: Customer / lead sent the message.
- `ai`: AI Bot (Riche / GPT-4o) sent the message.
- `human`: Human agent sent manual reply from inbox.
- `system`: Automated system template message.

### `MessageDirection` (Enum String)
- `inbound`: Message from lead to business.
- `outbound`: Message from business to lead.

---

## 3. Page 1 — Campaigns (`/api/campaigns`)

### `GET /api/campaigns/summary` ⭐ NEW
Gets header summary statistics across all campaigns.

**Response `200 OK`**:
```json
{
  "campaign_count": 107,
  "total_leads": 4213,
  "converted_leads": 812
}
```

---

### `GET /api/campaigns`
Lists Meta ad campaigns with lead counts (paginated).

**Query Parameters**:
- `limit` (int, default 50)
- `offset` (int, default 0)

**Response `200 OK`**:
```json
[
  {
    "id": "c7806cd5-225e-464a-b132-20a9b019ace3",
    "meta_campaign_id": "1202058372619",
    "name": "Free Hearing Test SA Campaign",
    "is_active": true,
    "assigned_template_name": "hearing_intro_v2",
    "assigned_template_set_at": "2026-08-02T19:30:00Z",
    "lead_count": 42,
    "created_at": "2026-08-01T10:00:00Z",
    "updated_at": "2026-08-02T19:30:00Z"
  }
]
```

---

### `PATCH /api/campaigns/{id}`
Toggles campaign active status or updates assigned template.

**Request Body**:
```json
{
  "is_active": false,
  "assigned_template_name": "hearing_intro_v2"
}
```

**Response `200 OK`**: Returns updated Campaign object.

---

### `GET /api/campaigns/{id}/leads`
Lists leads belonging to a specific campaign.

**Query Parameters**:
- `limit` (int, default 50)
- `offset` (int, default 0)

**Response `200 OK`**:
```json
{
  "total": 42,
  "items": [
    {
      "id": "fe85c0a1-47ef-4369-bee0-5adf276465ff",
      "full_name": "John Doe",
      "phone": "+27821234567",
      "campaign_name": "Free Hearing Test SA Campaign",
      "status": "UNREAD",
      "ai_mode": true,
      "last_activity_at": "2026-08-03T03:30:00Z",
      "created_at": "2026-08-02T14:20:00Z"
    }
  ]
}
```

---

### `GET /api/campaigns/{id}/available-templates`
Lists available approved WhatsApp templates from Wati cache.

**Response `200 OK`**:
```json
[
  {
    "name": "hearing_intro_v2",
    "language": "en",
    "category": "UTILITY",
    "body_preview": "Hi {{1}}, thank you for responding to our Hearing Aid Labs offer!",
    "placeholder_count": 1
  }
]
```

---

### `POST /api/campaigns/{id}/apply-template`
Applies a chosen WhatsApp template to all `NEW` leads in the campaign and triggers automated sending.

**Request Body**:
```json
{
  "template_name": "hearing_intro_v2"
}
```

**Response `200 OK`**:
```json
{
  "queued_lead_count": 39,
  "skipped_lead_count": 3,
  "skipped_lead_ids": ["uuid-1", "uuid-2", "uuid-3"]
}
```

---

## 4. Page 2 — Leads (`/api/leads`)

### `GET /api/leads/summary` ⭐ NEW
Gets header summary statistics for leads.

**Query Parameters**:
- `campaign_id` (UUID, optional): Filter by campaign.
- `window_days` (int, default 30): Date window filter.

> ℹ️ **"responded" Definition**: Total count of leads whose `status` is NOT in `{NEW, TEMPLATE_SENT}` (i.e. customer has sent an inbound message or progressed to `UNREAD`, `WAITING_FOR_REPLY`, `BOOKED`, or `HANDED_OFF`).

**Response `200 OK`**:
```json
{
  "total": 340,
  "new": 40,
  "template_sent": 55,
  "unread": 12,
  "responded": 233
}
```

---

### `GET /api/leads`
Paginated master lead table across all campaigns with filtering.

**Query Parameters**:
- `status` (string, optional): Filter by `LeadStatus` enum (`NEW`, `TEMPLATE_SENT`, `UNREAD`, `WAITING_FOR_REPLY`, `BOOKED`, `HANDED_OFF`).
- `campaign_id` (UUID, optional): Filter by campaign.
- `ai_mode` (boolean, optional): `true` or `false`.
- `days` (int, default 30): Filter by created_at window.
- `sort` (string, default `last_activity_desc`): `last_activity_desc` or `created_at_desc`.
- `limit` (int, default 50)
- `offset` (int, default 0)

**Response `200 OK`**:
```json
{
  "total": 128,
  "limit": 50,
  "offset": 0,
  "items": [
    {
      "id": "fe85c0a1-47ef-4369-bee0-5adf276465ff",
      "full_name": "John Doe",
      "phone": "+27821234567",
      "campaign_name": "Free Hearing Test SA Campaign",
      "status": "UNREAD",
      "ai_mode": true,
      "last_activity_at": "2026-08-03T03:30:00Z",
      "created_at": "2026-08-02T14:20:00Z"
    }
  ]
}
```

---

### `GET /api/leads/{id}`
Get detailed lead info (Lead Modal Tab 1), including Meta lead form Q&A fields and resubmission history.

**Response `200 OK`**:
```json
{
  "id": "fe85c0a1-47ef-4369-bee0-5adf276465ff",
  "full_name": "John Doe",
  "phone": "+27821234567",
  "email": "johndoe@example.com",
  "campaign_id": "c7806cd5-225e-464a-b132-20a9b019ace3",
  "campaign_name": "Free Hearing Test SA Campaign",
  "meta_ad_id": "2385192837192",
  "meta_ad_name": "Durban North Video Ad",
  "meta_form_fields": {
    "full_name": "John Doe",
    "phone_number": "+27821234567",
    "nearest_city": "Durban North",
    "hearing_difficulty": "Yes, in crowded rooms"
  },
  "status": "UNREAD",
  "ai_mode": true,
  "last_activity_at": "2026-08-03T03:30:00Z",
  "created_at": "2026-08-02T14:20:00Z",
  "resubmission_history": [
    {
      "id": "resub-uuid-1",
      "lead_id": "fe85c0a1-47ef-4369-bee0-5adf276465ff",
      "campaign_id": "c7806cd5-225e-464a-b132-20a9b019ace3",
      "meta_lead_id": "meta-lead-999",
      "meta_ad_id": "2385192837192",
      "meta_ad_name": "Durban North Video Ad",
      "meta_form_fields": { "nearest_city": "Durban North" },
      "created_at": "2026-08-03T02:00:00Z"
    }
  ]
}
```

---

### `GET /api/leads/{id}/resubmissions` ⭐ NEW
Gets resubmission event history for a lead.

**Response `200 OK`**: Array of `LeadResubmission` objects (same shape as embedded `resubmission_history`).

---

### `PATCH /api/leads/{id}`
Toggle AI mode on/off or update basic lead details.

**Request Body**:
```json
{
  "ai_mode": false,
  "full_name": "John Smith",
  "status": "WAITING_FOR_REPLY"
}
```

**Response `200 OK`**: Returns updated Lead Detail object.

---

### `GET /api/leads/{id}/notes`
List internal human staff notes for lead (Lead Modal Tab 2).  
*(Note: System events no longer appear in this table; all returned rows are human-authored).*

**Response `200 OK`**:
```json
[
  {
    "id": "n101-uuid",
    "lead_id": "fe85c0a1-47ef-4369-bee0-5adf276465ff",
    "author": "sarah@hearingaidlabs.co.za",
    "body": "Customer requested Saturday morning slot.",
    "created_at": "2026-08-03T01:15:00Z"
  }
]
```

---

### `POST /api/leads/{id}/notes`
Add internal human staff note for lead (Lead Modal Tab 2).

**Request Body**:
```json
{
  "author": "sarah@hearingaidlabs.co.za",
  "body": "Customer requested Saturday morning slot."
}
```

**Response `201 Created`**: Returns created Note object.

---

### `GET /api/leads/{id}/messages`
Get full WhatsApp chat message thread (Lead Modal Tab 3).

**Response `200 OK`**:
```json
[
  {
    "id": "m1-uuid",
    "lead_id": "fe85c0a1-47ef-4369-bee0-5adf276465ff",
    "direction": "inbound",
    "sender": "lead",
    "body": "Hi, I want to book a hearing test!",
    "wati_message_id": "wamid.HBgM2782123...",
    "delivery_status": "received",
    "template_name": null,
    "template_params": null,
    "created_at": "2026-08-03T03:25:00Z"
  }
]
```

---

## 5. Page 3 — WhatsApp Inbox (`/api/inbox`)

### `GET /api/inbox/conversations`
List inbox conversations sorted by last message time.

**Query Parameters**:
- `search` (string, optional): Search by customer name or phone number.
- `limit` (int, default 50)
- `offset` (int, default 0)

**Response `200 OK`**:
```json
[
  {
    "lead_id": "fe85c0a1-47ef-4369-bee0-5adf276465ff",
    "full_name": "John Doe",
    "phone": "+27821234567",
    "last_message_preview": "Hi, I want to book a hearing test!",
    "last_activity_at": "2026-08-03T03:25:00Z",
    "unread": true,
    "ai_mode": true,
    "status": "UNREAD"
  }
]
```

---

### `POST /api/inbox/conversations/{lead_id}/messages`
Send manual human WhatsApp reply.

> ⚠️ **CRITICAL BEHAVIOR**:
> If `ai_mode` is `true` for the lead, the API returns **HTTP `409 Conflict`**.
> **UI Rule**: Display a modal/alert prompting the agent: *"AI mode is currently enabled for this conversation. Disable AI mode before sending a manual message."*

**Request Body**:
```json
{
  "body": "Hi John, this is Sarah from Hearing Aid Labs. How can I assist you today?"
}
```

**Response `200 OK`**: Returns created Message object.  
**Response `409 Conflict`**:
```json
{
  "detail": "AI mode is currently enabled for this lead. Disable AI mode before sending a manual message."
}
```

---

### `POST /api/inbox/conversations/{lead_id}/sync`
"Sync Old Chat" header button action. Re-fetches conversation history from Wati and backfills missing messages.

**Response `200 OK`**:
```json
{
  "synced_count": 4,
  "phone": "+27821234567"
}
```

---

## 6. Page 4 — Platform Settings (`/api/settings`)

### `GET /api/settings`
Returns platform configuration settings with secrets masked and computed 60-day Meta token expiry status.

**Response `200 OK`**:
```json
{
  "meta_app_id": "1515189719811504",
  "meta_access_token": "EAAV...ZDZD",
  "meta_ad_account_id": "act_1086376492854834",
  "meta_token_status": {
    "expires_at": "2026-10-01T12:00:00Z",
    "days_remaining": 59,
    "warning": false
  },
  "wati_api_endpoint": "https://live-mt-server.wati.io/361402",
  "wati_access_token": "Bear...3jzE",
  "wati_instance_id": "361402",
  "openai_api_key": "sk-p...t0A",
  "openai_model": "gpt-4o",
  "openai_model_for_templates": "gpt-4o-mini",
  "poll_interval_minutes": 10,
  "supervisor_email": "ryan@hearingaidlabs.co.za",
  "supervisor_email_cc": "mailravneetpunia@gmail.com",
  "smtp_host": "smtp.gmail.com",
  "smtp_port": 587,
  "smtp_user": "ravneet.dtu@gmail.com",
  "smtp_from_name": "HAL Leads Whatsapp Automation"
}
```

---

### `PUT /api/settings`
Updates platform configuration settings. Masked values (`sk-p...t0A`) are safely ignored so secrets are never overwritten accidentally.

**Request Body**:
```json
{
  "poll_interval_minutes": 10,
  "openai_model": "gpt-4o",
  "supervisor_email": "ryan@hearingaidlabs.co.za"
}
```

**Response `200 OK`**: Returns updated settings object (same shape as GET).

---

## 7. Page 5 — Calendar Settings (`/api/calendars`)

### `GET /api/calendars`
Lists all store branch Google Calendar configurations and their connection status.

**Response `200 OK`**:
```json
[
  {
    "id": 1,
    "display_name": "Durban North Branch",
    "location": "Durban North",
    "google_calendar_id": "c_1882930192@group.calendar.google.com",
    "token_expiry": "2026-08-04T10:00:00Z",
    "is_connected": true
  }
]
```

---

### `POST /api/calendars`
Creates a new store calendar entry and returns OAuth URL.

**Request Body**:
```json
{
  "display_name": "Umhlanga Branch",
  "location": "Durban"
}
```

**Response `201 Created`**:
```json
{
  "id": 2,
  "display_name": "Umhlanga Branch",
  "location": "Durban",
  "auth_url": "/api/calendars/auth/url?calendar_id=2"
}
```

---

### `GET /api/calendars/auth/url?calendar_id={id}`
Returns Google OAuth consent URL for a store branch calendar. Frontend opens this URL in popup window for Google authorization.

**Response `200 OK`**:
```json
{
  "url": "https://accounts.google.com/o/oauth2/v2/auth?client_id=...&redirect_uri=...&scope=...&state=2"
}
```

---

### `DELETE /api/calendars/{id}`
Deletes a store calendar entry.

**Response `204 No Content`**

---

### `GET /api/calendars/{id}/config`
Get detailed store operating hours and service configuration (includes `buffer_minutes`, `closed_dates`, `daily_breaks`, and `time_blocks`).

**Response `200 OK`**:
```json
{
  "id": 1,
  "display_name": "Durban North Branch",
  "location": "Durban North",
  "google_calendar_id": "c_1882930192@group.calendar.google.com",
  "config": {
    "hours": {
      "monday": { "open": "08:30", "close": "16:30", "closed": false },
      "tuesday": { "open": "08:30", "close": "16:30", "closed": false },
      "wednesday": { "open": "08:30", "close": "16:30", "closed": false },
      "thursday": { "open": "08:30", "close": "16:30", "closed": false },
      "friday": { "open": "08:30", "close": "16:00", "closed": false },
      "saturday": { "open": "09:00", "close": "12:00", "closed": false },
      "sunday": { "open": "00:00", "close": "00:00", "closed": true }
    },
    "services_offered": ["free_screening", "full_diagnostic", "ear_wax_removal"],
    "durations": {
      "free_screening": 30,
      "full_diagnostic": 60,
      "ear_wax_removal": 45
    },
    "buffer_minutes": {
      "free_screening": 15,
      "full_diagnostic": 15,
      "ear_wax_removal": 15
    },
    "closed_dates": [
      { "date": "2026-12-25", "reason": "Christmas Day" }
    ],
    "daily_breaks": [
      { "name": "Lunch Break", "start": "13:00", "end": "14:00", "recurring": true, "day": "monday" }
    ],
    "time_blocks": [
      { "test_type": "free_screening", "start": "10:00", "end": "11:00", "recurring": true, "day": "tuesday" }
    ],
    "concurrent_appointments": 1,
    "min_advance_hours": 24,
    "max_advance_days": 90,
    "timezone": "Africa/Johannesburg"
  }
}
```

---

### `PUT /api/calendars/{id}/config`
Updates operating hours, service durations, buffer minutes, closed dates, or breaks for a store branch.

**Request Body**: Pass updated `config` object (same keys as GET).

**Response `200 OK`**:
```json
{
  "status": "success",
  "calendar_id": 1
}
```

---

## 8. Summary Table of Frontend Endpoints

| Page | Method | Endpoint Path | Description |
|---|---|---|---|
| Page 1 | `GET` | `/api/campaigns/summary` ⭐ | Header stats (campaign count, total leads, converted leads) |
| Page 1 | `GET` | `/api/campaigns` | List campaigns (paginated) |
| Page 1 | `PATCH` | `/api/campaigns/{id}` | Toggle campaign active status / set template |
| Page 1 | `GET` | `/api/campaigns/{id}/leads` | List campaign leads |
| Page 1 | `GET` | `/api/campaigns/{id}/available-templates` | Get Wati approved template list |
| Page 1 | `POST` | `/api/campaigns/{id}/apply-template` | Apply template to `NEW` campaign leads |
| Page 2 | `GET` | `/api/leads/summary` ⭐ | Header stats (total, new, template_sent, unread, responded) |
| Page 2 | `GET` | `/api/leads` | Paginated lead table (filters: status, campaign, ai_mode, 30d window) |
| Page 2 | `GET` | `/api/leads/{id}` | Lead Detail Modal Tab 1 (Basic info, form Q&A, resubmission history) |
| Page 2 | `GET` | `/api/leads/{id}/resubmissions` ⭐ | Get lead resubmission event history |
| Page 2 | `PATCH` | `/api/leads/{id}` | Toggle AI mode on/off or update status/name |
| Page 2 | `GET` | `/api/leads/{id}/notes` | Lead Detail Modal Tab 2 (Human staff notes list) |
| Page 2 | `POST` | `/api/leads/{id}/notes` | Lead Detail Modal Tab 2 (Add human staff note) |
| Page 2 | `GET` | `/api/leads/{id}/messages` | Lead Detail Modal Tab 3 (Get chat thread) |
| Page 3 | `GET` | `/api/inbox/conversations` | Inbox conversation list sorted by activity time |
| Page 3 | `POST` | `/api/inbox/conversations/{id}/messages` | Send manual reply (returns 409 if AI mode is ON) |
| Page 3 | `POST` | `/api/inbox/conversations/{id}/sync` | Header action: Sync Old Chat from Wati |
| Page 4 | `GET` | `/api/settings` | Settings view (masked secrets + 60d Meta token status) |
| Page 4 | `PUT` | `/api/settings` | Update settings |
| Page 5 | `GET` | `/api/calendars` | List store branch Google Calendars |
| Page 5 | `POST` | `/api/calendars` | Create store calendar entry |
| Page 5 | `DELETE`| `/api/calendars/{id}` | Delete store calendar entry |
| Page 5 | `GET` | `/api/calendars/{id}/config` | Get store operating hours & settings (includes buffers, breaks) |
| Page 5 | `PUT` | `/api/calendars/{id}/config` | Update store operating hours & settings |
| Page 5 | `GET` | `/api/calendars/auth/url` | Get Google OAuth authorization URL |
