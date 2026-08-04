# Frontend Developer & Agent API Reference

This document is the complete, authoritative API specification for building the **Meta-to-WhatsApp Lead Booking Automation Platform** frontend interface. All endpoints documented here are live, fully implemented, and verified.

> **Note from architect (Claude):** This is the fixed target contract, unchanged
> from the existing frontend. See `PHASE_PLAN.md` for two flagged discrepancies
> (base domain, missing `is_old_lead` field) before treating this doc as gospel
> on those two points.

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

- **Production Base URL**: `https://hal.ayurvedicpromise.com` *(architect correction — see PHASE_PLAN.md flag #1; source doc said `wati.ayurvedicpromise.com`)*
- **Local Dev Base URL**: `http://127.0.0.1:5040`
- **Swagger / OpenAPI Interactive Docs**: `{base}/docs`
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
```json
{ "campaign_count": 107, "total_leads": 4213, "converted_leads": 812 }
```

### `GET /api/campaigns`
Query: `limit` (default 50), `offset` (default 0).
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

### `PATCH /api/campaigns/{id}`
```json
{ "is_active": false, "assigned_template_name": "hearing_intro_v2" }
```

### `GET /api/campaigns/{id}/leads`
Query: `limit`, `offset`.
```json
{ "total": 42, "items": [ { "id": "...", "full_name": "John Doe", "phone": "+27821234567", "campaign_name": "...", "status": "UNREAD", "ai_mode": true, "last_activity_at": "...", "created_at": "..." } ] }
```

### `GET /api/campaigns/{id}/available-templates`
```json
[ { "name": "hearing_intro_v2", "language": "en", "category": "UTILITY", "body_preview": "Hi {{1}}, ...", "placeholder_count": 1 } ]
```

### `POST /api/campaigns/{id}/apply-template`
```json
{ "template_name": "hearing_intro_v2" }
```
Response:
```json
{ "queued_lead_count": 39, "skipped_lead_count": 3, "skipped_lead_ids": ["uuid-1","uuid-2","uuid-3"] }
```

---

## 4. Page 2 — Leads (`/api/leads`)

### `GET /api/leads/summary` ⭐ NEW
Query: `campaign_id` (optional), `window_days` (default 30).
```json
{ "total": 340, "new": 40, "template_sent": 55, "unread": 12, "responded": 233 }
```

### `GET /api/leads`
Query: `status`, `campaign_id`, `ai_mode`, `days` (default 30), `sort` (default `last_activity_desc`), `limit`, `offset`.
```json
{ "total": 128, "limit": 50, "offset": 0, "items": [ { "id": "...", "full_name": "John Doe", "phone": "+27821234567", "campaign_name": "...", "status": "UNREAD", "ai_mode": true, "last_activity_at": "...", "created_at": "..." } ] }
```

### `GET /api/leads/{id}`
```json
{
  "id": "fe85c0a1-47ef-4369-bee0-5adf276465ff",
  "full_name": "John Doe",
  "phone": "+27821234567",
  "email": "johndoe@example.com",
  "campaign_id": "...",
  "campaign_name": "...",
  "meta_ad_id": "2385192837192",
  "meta_ad_name": "Durban North Video Ad",
  "meta_form_fields": { "full_name": "John Doe", "phone_number": "+27821234567", "nearest_city": "Durban North", "hearing_difficulty": "Yes, in crowded rooms" },
  "status": "UNREAD",
  "ai_mode": true,
  "last_activity_at": "...",
  "created_at": "...",
  "resubmission_history": [ { "id": "...", "lead_id": "...", "campaign_id": "...", "meta_lead_id": "...", "meta_ad_id": "...", "meta_ad_name": "...", "meta_form_fields": {...}, "created_at": "..." } ]
}
```
> Architect addition (Phase 1): also include `is_old_lead` (bool) and
> `_parsing_error` (string, nullable) — see PHASE_PLAN.md flag #2.

### `GET /api/leads/{id}/resubmissions` ⭐ NEW
Array of `LeadResubmission` objects.

### `PATCH /api/leads/{id}`
```json
{ "ai_mode": false, "full_name": "John Smith", "status": "WAITING_FOR_REPLY" }
```

### `GET /api/leads/{id}/notes`
```json
[ { "id": "...", "lead_id": "...", "author": "sarah@hearingaidlabs.co.za", "body": "...", "created_at": "..." } ]
```

### `POST /api/leads/{id}/notes`
```json
{ "author": "sarah@hearingaidlabs.co.za", "body": "..." }
```

### `GET /api/leads/{id}/messages`
```json
[ { "id": "...", "lead_id": "...", "direction": "inbound", "sender": "lead", "body": "...", "wati_message_id": "wamid...", "delivery_status": "received", "template_name": null, "template_params": null, "created_at": "..." } ]
```

---

## 5. Page 3 — WhatsApp Inbox (`/api/inbox`)

### `GET /api/inbox/conversations`
Query: `search`, `limit`, `offset`.
```json
[ { "lead_id": "...", "full_name": "John Doe", "phone": "+27821234567", "last_message_preview": "...", "last_activity_at": "...", "unread": true, "ai_mode": true, "status": "UNREAD" } ]
```

### `POST /api/inbox/conversations/{lead_id}/messages`
```json
{ "body": "Hi John, this is Sarah from Hearing Aid Labs." }
```
Returns `200` with created Message, or `409` if `ai_mode` is `true`:
```json
{ "detail": "AI mode is currently enabled for this lead. Disable AI mode before sending a manual message." }
```

### `POST /api/inbox/conversations/{lead_id}/sync`
```json
{ "synced_count": 4, "phone": "+27821234567" }
```

---

## 6. Page 4 — Platform Settings (`/api/settings`)

### `GET /api/settings`
```json
{
  "meta_app_id": "1515189719811504",
  "meta_access_token": "EAAV...ZDZD",
  "meta_ad_account_id": "act_1086376492854834",
  "meta_token_status": { "expires_at": "2026-10-01T12:00:00Z", "days_remaining": 59, "warning": false },
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

### `PUT /api/settings`
Masked values are ignored (secrets never overwritten accidentally).

---

## 7. Page 5 — Calendar Settings (`/api/calendars`)

### `GET /api/calendars`
```json
[ { "id": 1, "display_name": "Durban North Branch", "location": "Durban North", "google_calendar_id": "...", "token_expiry": "...", "is_connected": true } ]
```

### `POST /api/calendars`
```json
{ "display_name": "Umhlanga Branch", "location": "Durban" }
```
Returns `201` with `auth_url`.

### `GET /api/calendars/auth/url?calendar_id={id}`
Returns Google OAuth consent URL.

### `DELETE /api/calendars/{id}`
`204 No Content`.

### `GET /api/calendars/{id}/config`
```json
{
  "id": 1, "display_name": "Durban North Branch", "location": "Durban North",
  "google_calendar_id": "...",
  "config": {
    "hours": { "monday": { "open": "08:30", "close": "16:30", "closed": false }, "...": "..." },
    "services_offered": ["free_screening", "full_diagnostic", "ear_wax_removal"],
    "durations": { "free_screening": 30, "full_diagnostic": 60, "ear_wax_removal": 45 },
    "buffer_minutes": { "free_screening": 15, "full_diagnostic": 15, "ear_wax_removal": 15 },
    "closed_dates": [ { "date": "2026-12-25", "reason": "Christmas Day" } ],
    "daily_breaks": [ { "name": "Lunch Break", "start": "13:00", "end": "14:00", "recurring": true, "day": "monday" } ],
    "time_blocks": [ { "test_type": "free_screening", "start": "10:00", "end": "11:00", "recurring": true, "day": "tuesday" } ],
    "concurrent_appointments": 1,
    "min_advance_hours": 24,
    "max_advance_days": 90,
    "timezone": "Africa/Johannesburg"
  }
}
```

### `PUT /api/calendars/{id}/config`
Body: updated `config` object.
```json
{ "status": "success", "calendar_id": 1 }
```

---

## 8. Summary Table of Frontend Endpoints

| Page | Method | Endpoint Path | Description |
|---|---|---|---|
| Page 1 | GET | /api/campaigns/summary ⭐ | Header stats |
| Page 1 | GET | /api/campaigns | List campaigns (paginated) |
| Page 1 | PATCH | /api/campaigns/{id} | Toggle active / set template |
| Page 1 | GET | /api/campaigns/{id}/leads | List campaign leads |
| Page 1 | GET | /api/campaigns/{id}/available-templates | Wati approved template list |
| Page 1 | POST | /api/campaigns/{id}/apply-template | Apply template to NEW leads |
| Page 2 | GET | /api/leads/summary ⭐ | Header stats |
| Page 2 | GET | /api/leads | Paginated lead table |
| Page 2 | GET | /api/leads/{id} | Lead detail |
| Page 2 | GET | /api/leads/{id}/resubmissions ⭐ | Resubmission history |
| Page 2 | PATCH | /api/leads/{id} | Toggle AI mode / update |
| Page 2 | GET | /api/leads/{id}/notes | Human staff notes |
| Page 2 | POST | /api/leads/{id}/notes | Add human staff note |
| Page 2 | GET | /api/leads/{id}/messages | Chat thread |
| Page 3 | GET | /api/inbox/conversations | Inbox list |
| Page 3 | POST | /api/inbox/conversations/{id}/messages | Manual reply (409 if AI on) |
| Page 3 | POST | /api/inbox/conversations/{id}/sync | Sync Old Chat |
| Page 4 | GET | /api/settings | Settings view |
| Page 4 | PUT | /api/settings | Update settings |
| Page 5 | GET | /api/calendars | List store calendars |
| Page 5 | POST | /api/calendars | Create store calendar |
| Page 5 | DELETE | /api/calendars/{id} | Delete store calendar |
| Page 5 | GET | /api/calendars/{id}/config | Get hours & settings |
| Page 5 | PUT | /api/calendars/{id}/config | Update hours & settings |
| Page 5 | GET | /api/calendars/auth/url | Google OAuth URL |