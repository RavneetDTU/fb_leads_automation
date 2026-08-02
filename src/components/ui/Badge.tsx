import type { LeadStatus } from '../../types';

const statusConfig: Record<LeadStatus, { label: string; className: string }> = {
  NEW: { label: 'New', className: 'bg-blue-100 text-blue-700' },
  TEMPLATE_SENT: { label: 'Template Sent', className: 'bg-indigo-100 text-indigo-700' },
  UNREAD: { label: 'Unread', className: 'bg-red-100 text-red-700' },
  WAITING_FOR_REPLY: { label: 'Waiting', className: 'bg-amber-100 text-amber-700' },
  BOOKED: { label: 'Booked', className: 'bg-green-100 text-green-700' },
  HANDED_OFF: { label: 'Handed Off', className: 'bg-slate-100 text-slate-600' },
};

interface StatusBadgeProps {
  status: LeadStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status] ?? { label: status, className: 'bg-slate-100 text-slate-600' };
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
    <span className={`status-badge ${active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
      <span className={`mr-1 w-1.5 h-1.5 rounded-full inline-block ${active ? 'bg-green-500' : 'bg-slate-400'}`} />
      {active ? onLabel : offLabel}
    </span>
  );
}

interface ConnectionBadgeProps {
  connected: boolean;
}

export function ConnectionBadge({ connected }: ConnectionBadgeProps) {
  return (
    <span className={`status-badge ${connected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
      <span className={`mr-1 w-1.5 h-1.5 rounded-full inline-block ${connected ? 'bg-green-500' : 'bg-red-500'}`} />
      {connected ? 'Connected' : 'Not Connected'}
    </span>
  );
}
