import type { LeadStatus } from '../../types';

const statusConfig: Record<LeadStatus, { label: string; className: string }> = {
  NEW: { label: 'New', className: 'bg-blue-50 text-blue-700 border border-blue-200/60' },
  TEMPLATE_SENT: { label: 'Template Sent', className: 'bg-indigo-50 text-indigo-700 border border-indigo-200/60' },
  UNREAD: { label: 'Unread', className: 'bg-rose-50 text-rose-700 border border-rose-200/60' },
  WAITING_FOR_REPLY: { label: 'Waiting', className: 'bg-amber-50 text-amber-700 border border-amber-200/60' },
  BOOKED: { label: 'Booked', className: 'bg-emerald-50 text-emerald-800 border border-emerald-200/60' },
  HANDED_OFF: { label: 'Handed Off', className: 'bg-slate-100 text-slate-600 border border-slate-200/60' },
};

interface StatusBadgeProps {
  status: LeadStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status] ?? { label: status, className: 'bg-slate-100 text-slate-600 border border-slate-200/60' };
  return (
    <span className={`status-badge ${config.className}`}>
      {config.label}
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
    <span className={`status-badge ${active ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/60' : 'bg-slate-100 text-slate-500 border border-slate-200/60'}`}>
      <span className={`mr-1.5 w-1.5 h-1.5 rounded-full inline-block ${active ? 'bg-emerald-500' : 'bg-slate-400'}`} />
      {active ? onLabel : offLabel}
    </span>
  );
}

interface ConnectionBadgeProps {
  connected: boolean;
}

export function ConnectionBadge({ connected }: ConnectionBadgeProps) {
  return (
    <span className={`status-badge ${connected ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/60' : 'bg-rose-50 text-rose-700 border border-rose-200/60'}`}>
      <span className={`mr-1.5 w-1.5 h-1.5 rounded-full inline-block ${connected ? 'bg-emerald-500' : 'bg-rose-500'}`} />
      {connected ? 'Connected' : 'Not Connected'}
    </span>
  );
}
