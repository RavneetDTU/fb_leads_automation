import type { LeadStatus } from '../../types';

const statusConfig: Record<LeadStatus, { label: string; className: string }> = {
  NEW: { label: 'New', className: 'bg-sky-50 text-sky-800 border border-sky-200' },
  TEMPLATE_SENT: { label: 'Template Sent', className: 'bg-indigo-50 text-indigo-800 border border-indigo-200' },
  UNREAD: { label: 'Unread', className: 'bg-terracotta-light text-terracotta-dark border border-terracotta/30' },
  WAITING_FOR_REPLY: { label: 'Waiting', className: 'bg-[#FFF4E8] text-[#9B5A20] border border-terracotta/30' },
  BOOKED: { label: 'Booked', className: 'bg-sage-light text-[#2E6A47] border border-sage/40' },
  HANDED_OFF: { label: 'Handed Off', className: 'bg-cream-light text-neutral-secondary border border-neutral-border' },
};

interface StatusBadgeProps {
  status: LeadStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status] ?? { label: status, className: 'bg-cream-light text-neutral-secondary border border-neutral-border' };
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
    <span className={`status-badge ${active ? 'bg-sage-light text-[#2E6A47] border border-sage/40' : 'bg-cream-light text-neutral-muted border border-neutral-border'}`}>
      <span className={`mr-1.5 w-1.5 h-1.5 rounded-full inline-block ${active ? 'bg-sage' : 'bg-neutral-muted'}`} />
      {active ? onLabel : offLabel}
    </span>
  );
}

interface ConnectionBadgeProps {
  connected: boolean;
}

export function ConnectionBadge({ connected }: ConnectionBadgeProps) {
  return (
    <span className={`status-badge ${connected ? 'bg-sage-light text-[#2E6A47] border border-sage/40' : 'bg-rose-50 text-rose-800 border border-rose-200'}`}>
      <span className={`mr-1.5 w-1.5 h-1.5 rounded-full inline-block ${connected ? 'bg-sage' : 'bg-rose-500'}`} />
      {connected ? 'Connected' : 'Not Connected'}
    </span>
  );
}
