// ============================================================
// TypeScript types exactly matching the updated API_DOC.md schemas
// ============================================================

// --- Enums ---

export type LeadStatus =
  | 'NEW'
  | 'TEMPLATE_SENT'
  | 'UNREAD'
  | 'WAITING_FOR_REPLY'
  | 'BOOKED'
  | 'HANDED_OFF';

export type MessageSender = 'lead' | 'ai' | 'human' | 'system';
export type MessageDirection = 'inbound' | 'outbound';

// --- Campaigns ---

export type LeadSource = 'meta_live' | 'meta_backfill' | 'manual';

// --- Campaigns ---

export interface CampaignSummary {
  campaign_count: number;
  total_leads: number;
  whatsapp_messages_sent: number;
  converted_leads: number;
}

export interface Campaign {
  id: string;
  meta_campaign_id: string;
  name: string;
  status?: string | null;
  is_active: boolean;
  assigned_template_name: string | null;
  assigned_template_set_at: string | null;
  synced_at?: string | null;
  lead_count: number;
  messages_sent_count?: number;
  messages_read_count?: number;
  converted_count?: number;
  created_at: string;
  updated_at: string;
}

export interface CampaignUpdate {
  is_active?: boolean | null;
  name?: string | null;
  assigned_template_name?: string | null;
}

export interface WatiTemplate {
  name: string;
  language: string;
  category: string;
  body_preview: string;
  placeholder_count: number;
}

export interface ApplyTemplateResponse {
  queued_lead_count: number;
  skipped_lead_count: number;
  skipped_lead_ids: string[];
}

// --- Leads ---

export interface LeadSummary {
  total: number;
  new: number;
  template_sent: number;
  unread: number;
  responded: number;
}

export interface LeadListItem {
  id: string;
  full_name: string;
  phone: string;
  campaign_name: string | null;
  status: LeadStatus;
  source?: LeadSource;
  is_old_lead?: boolean;
  old_lead_reason?: string | null;
  imported_at?: string | null;
  ai_mode: boolean;
  last_activity_at: string;
  created_at: string;
}

export interface LeadPaginatedResponse {
  total: number;
  limit: number;
  offset: number;
  items: LeadListItem[];
}

export interface LeadResubmission {
  id: string;
  lead_id: string;
  campaign_id: string;
  meta_lead_id: string;
  meta_ad_id: string | null;
  meta_ad_name: string | null;
  meta_form_fields: Record<string, unknown>;
  created_at: string;
}

export interface LeadDetail {
  id: string;
  full_name: string;
  phone: string;
  email: string | null;
  campaign_id: string;
  campaign_name: string | null;
  meta_ad_id: string | null;
  meta_ad_name: string | null;
  meta_form_fields: Record<string, unknown>;
  status: LeadStatus;
  source?: LeadSource;
  is_old_lead?: boolean;
  old_lead_reason?: string | null;
  imported_at?: string | null;
  ai_mode: boolean;
  last_activity_at: string;
  created_at: string;
  resubmission_history: LeadResubmission[];
}

export interface LeadUpdate {
  ai_mode?: boolean | null;
  full_name?: string | null;
  email?: string | null;
  status?: LeadStatus | null;
}

// --- Notes ---

export interface Note {
  id: string;
  lead_id: string;
  author: string;
  body: string;
  created_at: string;
}

export interface NoteCreate {
  author: string;
  body: string;
}

// --- Messages ---

export interface Message {
  id: string;
  lead_id: string;
  direction: MessageDirection;
  sender: MessageSender;
  body: string;
  wati_message_id: string | null;
  delivery_status: string | null;
  template_name: string | null;
  template_params: Record<string, unknown> | null;
  created_at: string;
}

// --- Inbox ---

export interface ConversationListItem {
  lead_id: string;
  full_name: string;
  phone: string;
  last_message_preview: string | null;
  last_activity_at: string;
  unread: boolean;
  ai_mode: boolean;
  status: LeadStatus;
  source?: LeadSource;
  is_old_lead?: boolean;
  old_lead_reason?: string | null;
}

// --- Settings ---

export interface MetaTokenStatus {
  expires_at: string | null;
  days_remaining: number | null;
  warning: boolean;
}

export interface PlatformSettings {
  meta_app_id: string | null;
  meta_access_token: string | null;
  meta_ad_account_id: string | null;
  meta_token_status: MetaTokenStatus;
  wati_api_endpoint: string | null;
  wati_access_token: string | null;
  wati_instance_id: string | null;
  openai_api_key: string | null;
  openai_model: string;
  openai_model_for_templates: string;
  poll_interval_minutes: number;
  supervisor_email: string | null;
  supervisor_email_cc: string | null;
  smtp_host: string;
  smtp_port: number;
  smtp_user: string | null;
  smtp_from_name: string;
}

export interface PlatformSettingsUpdate {
  meta_app_id?: string | null;
  meta_app_secret?: string | null;
  meta_access_token?: string | null;
  meta_ad_account_id?: string | null;
  meta_token_expires_at?: string | null;
  wati_api_endpoint?: string | null;
  wati_access_token?: string | null;
  wati_instance_id?: string | null;
  openai_api_key?: string | null;
  openai_model?: string | null;
  openai_model_for_templates?: string | null;
  poll_interval_minutes?: number | null;
  supervisor_email?: string | null;
  supervisor_email_cc?: string | null;
  smtp_host?: string | null;
  smtp_port?: number | null;
  smtp_user?: string | null;
  smtp_password?: string | null;
  smtp_from_name?: string | null;
}

// --- Calendars ---

export interface CalendarResponse {
  id: number;
  display_name: string;
  location: string;
  google_calendar_id: string | null;
  token_expiry: string | null;
  is_connected: boolean;
}

export interface DayHours {
  open: string;
  close: string;
  closed: boolean;
}

export interface ClosedDate {
  date: string;   // YYYY-MM-DD
  reason: string;
}

export interface DailyBreak {
  name: string;
  start: string;
  end: string;
  recurring: boolean;
  day: string;
}

export interface TimeBlock {
  test_type: string;
  start: string;
  end: string;
  recurring: boolean;
  day: string;
}

export interface CalendarContact {
  phone?: string;
  google_maps_url?: string;
  address?: string;
  directions?: string;
}

export interface CalendarConfig {
  hours: Record<string, DayHours>;
  services_offered: string[];
  durations: Record<string, number>;
  buffer_minutes: Record<string, number>;
  concurrent_appointments: number;
  min_advance_hours: number;
  max_advance_days: number;
  timezone: string;
  closed_dates: ClosedDate[];
  daily_breaks: DailyBreak[];
  time_blocks: TimeBlock[];
  contact?: CalendarContact;
  custom_confirmation_note?: string;
}

export interface CalendarConfigResponse {
  id: number;
  display_name: string;
  location: string;
  google_calendar_id: string | null;
  config: CalendarConfig;
}

// --- Paginated list response for campaigns ---
export interface CampaignLeadsPaginatedResponse {
  total: number;
  items: LeadListItem[];
}
