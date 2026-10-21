import { format } from 'date-fns';
import { STATUS_LABELS } from './leadStatuses';
import type { LeadListItem } from '../types';

export const LEAD_IMPORT_HEADERS = [
  'First name',
  'Last name',
  'Preferred warehouse',
  'Phone number',
  'Email ID',
  'City',
] as const;

function csvCell(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function downloadCsv(filename: string, headers: readonly string[], rows: string[][]): void {
  const csv = [headers, ...rows]
    .map((row) => row.map((cell) => csvCell(String(cell))).join(','))
    .join('\n');
  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function downloadLeadImportTemplate(): void {
  downloadCsv('campaign-leads-template.csv', LEAD_IMPORT_HEADERS, [
    ['Jane', 'Doe', 'Blouberg Branch', '+27 82 123 4567', 'jane@example.com', 'Cape Town'],
  ]);
}

function when(value: string | null | undefined): string {
  if (!value) return '';
  return format(new Date(value), 'MMM d, yyyy HH:mm');
}

export function downloadLeadsCsv(leads: LeadListItem[]): void {
  const headers = ['Name', 'Phone', 'Campaign', 'Created', 'Status', 'Branch', 'Last reply', 'AI mode'];
  const rows = leads.map((lead) => [
    lead.full_name,
    lead.phone,
    lead.campaign_name ?? 'Direct Inbound',
    when(lead.created_at),
    STATUS_LABELS[lead.status] ?? lead.status,
    (lead.branch ?? '').replace(/ Branch$/, ''),
    when(lead.last_reply_at),
    lead.ai_mode ? 'On' : 'Off',
  ]);
  downloadCsv(`leads-${format(new Date(), 'yyyy-MM-dd')}.csv`, headers, rows);
}
