import type { LeadStatus } from '../../types';
import { STATUS_LABELS } from '../../lib/leadStatuses';

const PIPELINE_COLORS: Partial<Record<LeadStatus, string>> = {
  NEW: 'bg-cyan-50 text-cyan-800 border border-cyan-200/80',
  TEMPLATE_SENT: 'bg-indigo-50 text-indigo-800 border border-indigo-200/80',
  UNREAD: 'bg-cyan-50 text-cyan-800 border border-cyan-200/80',
  WAITING_FOR_REPLY: 'bg-amber-50 text-amber-900 border border-amber-200/80 font-bold',
  BOOKED: 'bg-emerald-50 text-emerald-800 border border-emerald-200/80',
  HANDED_OFF: 'bg-slate-100 text-slate-700 border border-slate-200',
};

const CRM_POSITIVE = 'bg-emerald-50 text-emerald-800 border border-emerald-200/80';
const CRM_OUTREACH = 'bg-indigo-50 text-indigo-800 border border-indigo-200/80';
const CRM_LATER = 'bg-amber-50 text-amber-900 border border-amber-200/80';
const CRM_CLOSED = 'bg-slate-100 text-slate-700 border border-slate-200';
const CRM_NEGATIVE = 'bg-rose-50 text-rose-800 border border-rose-200/80';

const CRM_COLORS: Partial<Record<LeadStatus, string>> = {
  INACTIVE: CRM_CLOSED,
  INACTIVE_HEARING_AID: CRM_CLOSED,
  INACTIVE_FULL_TEST: CRM_CLOSED,
  NO_ANSWER: CRM_CLOSED,
  NOT_INTERESTED: CRM_NEGATIVE,
  BOOKED_APPOINTMENT: CRM_POSITIVE,
  BOOKED_APPOINTMENT_FULL: CRM_POSITIVE,
  PLEASE_CALL_LATER: CRM_LATER,
  TRANSFER: CRM_LATER,
  WILL_CALL_US: CRM_LATER,
  NO_SHOW: CRM_NEGATIVE,
  CLOSED: CRM_CLOSED,
  NO_FUNDS: CRM_NEGATIVE,
  TOO_YOUNG: CRM_CLOSED,
  TOO_FAR: CRM_CLOSED,
  CANCELLED: CRM_NEGATIVE,
  FIRST_WHATSAPP_SENT: CRM_OUTREACH,
  RECAP_SENT: CRM_OUTREACH,
  OPT_OUT: CRM_NEGATIVE,
  REHEAT_SENT: CRM_OUTREACH,
  CUSTOMER: CRM_POSITIVE,
  REAPPLIED: CRM_POSITIVE,
  OTHER_REFER_TO_NOTES: CRM_OUTREACH,
  INACTIVE_REFER_TO_NOTES: CRM_CLOSED,
  MOTHERS_DAY: CRM_LATER,
  DECEASED: CRM_CLOSED,
  RESCHEDULE: CRM_LATER,
  INTERESTED_NOT_NOW: CRM_LATER,
};

const FALLBACK = 'bg-slate-100 text-slate-700 border border-slate-200';

interface StatusBadgeProps {
  status: LeadStatus | string;
  compact?: boolean;
}

export function StatusBadge({ status, compact = false }: StatusBadgeProps) {
  const label = STATUS_LABELS[status as LeadStatus] ?? status;
  const className = PIPELINE_COLORS[status as LeadStatus] ?? CRM_COLORS[status as LeadStatus] ?? FALLBACK;
  return (
    <span
      className={`status-badge ${className} ${compact ? 'text-[10px] px-1.5 py-0 max-w-[140px] truncate' : ''}`}
      title={label}
    >
      {label}
    </span>
  );
}

interface ActiveBadgeProps {
  active: boolean;
  onLabel?: string;
  offLabel?: string;
}

export function ActiveBadge({ active, onLabel = 'Auto ON', offLabel = 'Auto OFF' }: ActiveBadgeProps) {
  return (
    <span className={`status-badge ${active ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80 font-bold' : 'bg-slate-100 text-slate-500 border border-slate-200'}`}>
      <span className={`mr-1.5 w-1.5 h-1.5 rounded-full inline-block ${active ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
      {active ? onLabel : offLabel}
    </span>
  );
}

interface ConnectionBadgeProps {
  connected: boolean;
}

export function ConnectionBadge({ connected }: ConnectionBadgeProps) {
  return (
    <span className={`status-badge ${connected ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/80 font-bold' : 'bg-rose-50 text-rose-800 border border-rose-200/80 font-bold'}`}>
      <span className={`mr-1.5 w-1.5 h-1.5 rounded-full inline-block ${connected ? 'bg-emerald-500' : 'bg-rose-500'}`} />
      {connected ? '🟢 Connected' : '🔴 Not Connected'}
    </span>
  );
}

interface OldLeadBadgeProps {
  reason?: string | null;
}

export function OldLeadBadge({ reason }: OldLeadBadgeProps) {
  return (
    <span
      className="status-badge bg-amber-50 text-amber-900 border border-amber-300 font-bold inline-flex items-center gap-1"
      title={reason || 'Historical lead imported via backfill — auto & manual messaging disabled for safety.'}
    >
      ⚠️ Old Lead
    </span>
  );
}
