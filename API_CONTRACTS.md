# API_CONTRACTS.md — Black-Box Interface Contract

> [!IMPORTANT]
> This document is the single source of truth for the HTTP API interface contract. It is shared verbatim with the frontend application. No implementation details belong here — strictly endpoint paths, authentication headers, request payloads, response schemas, and enums.

## Authentication
All `/api/*` endpoints require HTTP Bearer Token authentication.
```http
Authorization: Bearer <API_BEARER_TOKEN>
```
Default token value: `admin` (or configured via `API_BEARER_TOKEN` environment variable).

---

## Shared Enums

### `CampaignSourceEnum`
- `"meta"`: Campaign discovered automatically via Meta Graph API.
- `"manual"`: Campaign created manually by a user via the API.

### `LeadSourceEnum`
- `"meta_realtime"`: Lead ingested from Meta poll/webhook after initial system setup.
- `"meta_backfill"`: Historical lead ingested during system initial first-sync run.
- `"manual"`: Lead created manually by a user via the API.

### `LeadStatusEnum`
- `"NEW"`: Initial state upon lead creation.
- `"TEMPLATE_SENT"`: Initial WhatsApp template message successfully sent.
- `"UNREAD"`: Inbound message received from lead, unread by agent.
- `"WAITING_FOR_REPLY"`: Outbound message sent, waiting for lead response.
- `"BOOKED"`: Appointment successfully scheduled.
- `"HANDED_OFF"`: Conversation handed off to a human agent.

### `SyncRunTypeEnum`
- `"poll"`: Meta lead polling sync run.
- `"discovery"`: Meta campaign & lead gen form discovery walk.

### `SyncRunStatusEnum`
- `"completed"`: Sync run completed cleanly with zero errors.
- `"completed_with_errors"`: Sync run completed, but one or more API errors were logged.
- `"failed"`: Sync run failed to complete execution.

---

## Additive Field Callouts
- **`is_old_lead`** (`boolean`): Additive field present on all lead objects. Indicates if the lead was ingested during initial historical backfill (`true`) or real-time (`false`). Immutable, read-only.
- **`_parsing_error`** (`string` | `null`): Additive field present on all lead objects. Indicates any field extraction anomaly (e.g. `"missing_phone"`).

---

## Endpoint Specifications

### 1. Campaigns API

#### `GET /api/campaigns/summary`
Returns high-level aggregate statistics across all campaigns.

- **Auth Required**: Yes
- **Response `200 OK`**:
```json
{
  "campaign_count": 4,
  "total_leads": 198,
  "converted_leads": 12
}
```

#### `GET /api/campaigns`
Lists all campaigns sorted by creation date descending.

- **Auth Required**: Yes
- **Query Parameters**:
  - `limit` (optional, default `50`, min `1`, max `100`): Integer
  - `offset` (optional, default `0`, min `0`): Integer
- **Response `200 OK`**:
```json
[
  {
    "id": "c1f8a7e0-912b-4d43-85f2-9c1234567890",
    "meta_campaign_id": "120244622450380086",
    "name": "MAY 2 Campaign",
    "is_active": true,
    "source": "meta",
    "assigned_template_name": "welcome_offer_v1",
    "assigned_template_set_at": "2026-08-04T12:00:00Z",
    "lead_count": 198,
    "created_at": "2026-08-04T12:08:42Z",
    "updated_at": "2026-08-04T12:08:42Z"
  },
  {
    "id": "e9b2c3d4-85a1-4f12-98e3-1a2b3c4d5e6f",
    "meta_campaign_id": "manual:d8e7f6a5-4b3c-2d1e-0f9a-8b7c6d5e4f3a",
    "name": "Manual VIP Campaign",
    "is_active": true,
    "source": "manual",
    "assigned_template_name": null,
    "assigned_template_set_at": null,
    "lead_count": 5,
    "created_at": "2026-08-04T15:30:00Z",
    "updated_at": "2026-08-04T15:30:00Z"
  }
]
```

#### `POST /api/campaigns`
Creates a new manual campaign.

- **Auth Required**: Yes
- **Request Body**:
```json
{
  "name": "Manual Walk-in Campaign",
  "is_active": true
}
```
- **Response `201 Created`**:
```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "meta_campaign_id": "manual:f47ac10b-58cc-4372-a567-0e02b2c3d4e5",
  "name": "Manual Walk-in Campaign",
  "is_active": true,
  "source": "manual",
  "assigned_template_name": null,
  "assigned_template_set_at": null,
  "lead_count": 0,
  "created_at": "2026-08-05T10:15:00Z",
  "updated_at": "2026-08-05T10:15:00Z"
}
```

#### `GET /api/campaigns/{campaign_id}/leads`
Returns all leads attributed to a specific campaign.

> [!NOTE]
> **Shape Distinction Callout**: This endpoint deliberately returns `{ "total": int, "items": [...] }` without `limit` and `offset` wrapper fields, whereas `GET /api/leads` returns `{ "total": int, "limit": int, "offset": int, "items": [...] }`.

- **Auth Required**: Yes
- **Path Parameters**:
  - `campaign_id` (UUID): Campaign unique identifier
- **Query Parameters**:
  - `limit` (optional, default `50`): Integer
  - `offset` (optional, default `0`): Integer
- **Response `200 OK`**:
```json
{
  "total": 198,
  "items": [
    {
      "id": "8f3b2a10-4c5d-6e7f-8a9b-0c1d2e3f4a5b",
      "full_name": "Sipho Dlamini",
      "phone": "+27632808239",
      "campaign_name": "MAY 2 Campaign",
      "status": "NEW",
      "ai_mode": true,
      "is_old_lead": true,
      "source": "meta_backfill",
      "_parsing_error": null,
      "last_activity_at": "2026-08-05T09:00:00Z",
      "created_at": "2026-05-02T14:22:00Z"
    }
  ]
}
```

---

### 2. Leads API

#### `GET /api/leads/summary`
Returns aggregate lead counts filtered by optional campaign ID and time window.

- **Auth Required**: Yes
- **Query Parameters**:
  - `campaign_id` (optional, UUID)
  - `window_days` (optional, default `30`): Integer
- **Response `200 OK`**:
```json
{
  "total": 198,
  "new": 180,
  "template_sent": 10,
  "unread": 5,
  "responded": 3
}
```

#### `GET /api/leads`
Lists leads with optional filtering by campaign ID and lead status.

- **Auth Required**: Yes
- **Query Parameters**:
  - `campaign_id` (optional, UUID)
  - `status` (optional, `LeadStatusEnum`)
  - `limit` (optional, default `50`): Integer
  - `offset` (optional, default `0`): Integer
- **Response `200 OK`**:
```json
{
  "total": 198,
  "limit": 50,
  "offset": 0,
  "items": [
    {
      "id": "8f3b2a10-4c5d-6e7f-8a9b-0c1d2e3f4a5b",
      "full_name": "Sipho Dlamini",
      "phone": "+27632808239",
      "campaign_name": "MAY 2 Campaign",
      "status": "NEW",
      "ai_mode": true,
      "is_old_lead": true,
      "source": "meta_backfill",
      "_parsing_error": null,
      "last_activity_at": "2026-08-05T09:00:00Z",
      "created_at": "2026-05-02T14:22:00Z"
    }
  ]
}
```

#### `POST /api/leads`
Creates a manual lead entry.

- **Auth Required**: Yes
- **Request Body**:
```json
{
  "campaign_id": "c1f8a7e0-912b-4d43-85f2-9c1234567890",
  "full_name": "Thandi Nkosi",
  "phone": "0821234567",
  "email": "thandi@example.com"
}
```
- **Response `201 Created`**:
```json
{
  "id": "b2c3d4e5-f6a7-8901-bcde-f23456789012",
  "full_name": "Thandi Nkosi",
  "phone": "+27821234567",
  "email": "thandi@example.com",
  "campaign_id": "c1f8a7e0-912b-4d43-85f2-9c1234567890",
  "campaign_name": "MAY 2 Campaign",
  "meta_ad_id": null,
  "meta_ad_name": null,
  "meta_form_fields": [],
  "status": "NEW",
  "ai_mode": true,
  "is_old_lead": false,
  "source": "manual",
  "_parsing_error": null,
  "last_activity_at": "2026-08-05T10:30:00Z",
  "created_at": "2026-08-05T10:30:00Z",
  "resubmission_history": []
}
```

#### `GET /api/leads/{lead_id}`
Returns detailed lead information including form fields payload and complete resubmission history.

- **Auth Required**: Yes
- **Path Parameters**:
  - `lead_id` (UUID)
- **Response `200 OK`**:
```json
{
  "id": "8f3b2a10-4c5d-6e7f-8a9b-0c1d2e3f4a5b",
  "full_name": "Sipho Dlamini",
  "phone": "+27632808239",
  "email": "sipho@example.com",
  "campaign_id": "c1f8a7e0-912b-4d43-85f2-9c1234567890",
  "campaign_name": "MAY 2 Campaign",
  "meta_ad_id": "2385192837192",
  "meta_ad_name": "MAY 2 Ad",
  "meta_form_fields": [
    {"name": "full_name", "values": ["Sipho Dlamini"]},
    {"name": "phone_number", "values": ["+27632808239"]}
  ],
  "status": "NEW",
  "ai_mode": true,
  "is_old_lead": true,
  "source": "meta_backfill",
  "_parsing_error": null,
  "last_activity_at": "2026-08-05T09:00:00Z",
  "created_at": "2026-05-02T14:22:00Z",
  "resubmission_history": [
    {
      "id": "7a8b9c0d-1e2f-3a4b-5c6d-7e8f9a0b1c2d",
      "lead_id": "8f3b2a10-4c5d-6e7f-8a9b-0c1d2e3f4a5b",
      "campaign_id": "c1f8a7e0-912b-4d43-85f2-9c1234567890",
      "meta_lead_id": "1518386116271606",
      "meta_ad_id": "2385192837192",
      "meta_ad_name": "MAY 2 Ad",
      "meta_form_fields": [
        {"name": "full_name", "values": ["Sipho Dlamini"]},
        {"name": "phone_number", "values": ["+27632808239"]}
      ],
      "created_at": "2026-08-05T09:00:00Z"
    }
  ]
}
```

---

### 3. Admin & Sync API

#### `POST /api/admin/meta/sync/trigger`
Triggers an immediate Meta poll or discovery sync run.

- **Auth Required**: Yes
- **Request Body**:
```json
{
  "run_type": "poll"
}
```
- **Response `200 OK`**:
```json
{
  "id": "581d7664-711e-4ca1-a0de-0571ca7e7c0e",
  "run_type": "poll",
  "started_at": "2026-08-05T11:26:48Z",
  "finished_at": "2026-08-05T11:26:48Z",
  "status": "completed",
  "leads_created": 0,
  "resubmissions_created": 0,
  "forms_synced": 1,
  "errors": [],
  "is_first_run": false
}
```

#### `GET /api/admin/meta/sync/runs`
Returns history of recent sync runs.

- **Auth Required**: Yes
- **Query Parameters**:
  - `limit` (optional, default `20`): Integer
- **Response `200 OK`**:
```json
[
  {
    "id": "581d7664-711e-4ca1-a0de-0571ca7e7c0e",
    "run_type": "poll",
    "started_at": "2026-08-05T11:26:48Z",
    "finished_at": "2026-08-05T11:26:48Z",
    "status": "completed",
    "leads_created": 0,
    "resubmissions_created": 0,
    "forms_synced": 1,
    "errors": [],
    "is_first_run": false
  }
]
```
