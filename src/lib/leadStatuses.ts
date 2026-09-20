import type { LeadStatus } from '../types';

export const PIPELINE_STATUSES: { value: LeadStatus; label: string }[] = [
  { value: 'NEW', label: 'New Lead' },
  { value: 'TEMPLATE_SENT', label: 'Template Sent' },
  { value: 'UNREAD', label: 'Unread' },
  { value: 'WAITING_FOR_REPLY', label: 'Hot Lead / Qualified' },
  { value: 'BOOKED', label: 'Booked / Responded' },
  { value: 'HANDED_OFF', label: 'Handed Off' },
];

export const CRM_STATUSES: { value: LeadStatus; label: string }[] = [
  { value: 'INACTIVE', label: 'Inactive' },
  { value: 'INACTIVE_HEARING_AID', label: 'Inactive - Hearing Aid' },
  { value: 'INACTIVE_FULL_TEST', label: 'Inactive - Full Test' },
  { value: 'NO_ANSWER', label: 'No Answer' },
  { value: 'NOT_INTERESTED', label: 'Not interested' },
  { value: 'BOOKED_APPOINTMENT', label: 'Booked appointment' },
  { value: 'BOOKED_APPOINTMENT_FULL', label: 'Booked Appointment(Full)' },
  { value: 'PLEASE_CALL_LATER', label: 'Please call later' },
  { value: 'TRANSFER', label: 'Transfer' },
  { value: 'WILL_CALL_US', label: 'Will call us' },
  { value: 'NO_SHOW', label: 'No show' },
  { value: 'CLOSED', label: 'Closed' },
  { value: 'NO_FUNDS', label: 'No Funds' },
  { value: 'TOO_YOUNG', label: 'Too Young' },
  { value: 'TOO_FAR', label: 'Too Far' },
  { value: 'CANCELLED', label: 'Cancelled' },
  { value: 'FIRST_WHATSAPP_SENT', label: '1ST WHATSAPP SENT' },
  { value: 'RECAP_SENT', label: 'RECAP SENT' },
  { value: 'OPT_OUT', label: 'OPT OUT' },
  { value: 'REHEAT_SENT', label: 'Reheat Sent' },
  { value: 'CUSTOMER', label: 'Customer' },
  { value: 'REAPPLIED', label: 'Reapplied' },
  { value: 'OTHER_REFER_TO_NOTES', label: 'Other - Refer to Notes' },
  { value: 'INACTIVE_REFER_TO_NOTES', label: 'Inactive - Refer to Notes' },
  { value: 'MOTHERS_DAY', label: "Mother's Day" },
  { value: 'DECEASED', label: 'Deceased' },
  { value: 'RESCHEDULE', label: 'Reschedule' },
  { value: 'INTERESTED_NOT_NOW', label: 'Interested - Not Now' },
];

export const ALL_LEAD_STATUSES = [...PIPELINE_STATUSES, ...CRM_STATUSES];

export const STATUS_LABELS: Record<LeadStatus, string> = Object.fromEntries(
  ALL_LEAD_STATUSES.map((s) => [s.value, s.label]),
) as Record<LeadStatus, string>;

export type LeadSort = 'last_activity_desc' | 'created_desc' | 'created_asc' | 'name_asc';

export const LEAD_SORT_OPTIONS: { value: LeadSort; label: string }[] = [
  { value: 'last_activity_desc', label: 'Last activity' },
  { value: 'created_desc', label: 'Newest created' },
  { value: 'created_asc', label: 'Oldest created' },
  { value: 'name_asc', label: 'Name A–Z' },
];
