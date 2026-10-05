import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronDown, ChevronUp, Search, UserPlus, X } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { get, post } from '../lib/api';
import { BRANCH_OPTIONS } from '../lib/branches';
import { ErrorState, EmptyState } from '../components/ui/States';
import { TableSkeleton } from '../components/ui/Spinner';

const SAST = 'Africa/Johannesburg';
const POLL_MS = 15_000;

interface StandLead {
  id: number;
  first_name: string;
  last_name: string;
  phone: string;
  email: string | null;
  city: string;
  warehouse_name: string;
  marketing_source: string;
  jarvis_status: string;
  jarvis_error: string | null;
  created_at: string;
  send_mode: string;
  send_at: string | null;
}

interface StandForm {
  warehouse_name: string;
  first_name: string;
  last_name: string;
  dial: '+27' | '+91';
  phone_national: string;
  email: string;
  city: string;
  send_mode: 'now' | 'scheduled';
  send_at: string;
}

const EMPTY_FORM: StandForm = {
  warehouse_name: '',
  first_name: '',
  last_name: '',
  dial: '+27',
  phone_national: '',
  email: '',
  city: '',
  send_mode: 'now',
  send_at: '',
};

function formatSast(iso: string | null | undefined): { date: string; time: string } | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return {
    date: new Intl.DateTimeFormat('en-GB', {
      timeZone: SAST,
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date),
    time: new Intl.DateTimeFormat('en-ZA', {
      timeZone: SAST,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(date),
  };
}

function EmailAddress({ value }: { value: string | null }) {
  if (!value) return <span className="text-slate-300">—</span>;
  const at = value.indexOf('@');
  if (at < 1) return <span className="block truncate" title={value}>{value}</span>;
  return (
    <span className="block leading-tight text-xs" title={value}>
      <span className="block truncate">{value.slice(0, at)}</span>
      <span className="block truncate text-slate-500">@{value.slice(at + 1)}</span>
    </span>
  );
}

function When({ iso }: { iso: string | null | undefined }) {
  const parts = formatSast(iso);
  if (!parts) return <span className="text-slate-300">—</span>;
  const day = parts.date.replace(/\s+\d{4}$/, '').replace('Sept', 'Sep');
  return <span className="whitespace-nowrap tabular-nums">{day}, {parts.time}</span>;
}

function remainingLabel(iso: string, now: number): string {
  const ms = new Date(iso).getTime() - now;
  if (Number.isNaN(ms)) return '';
  if (ms <= 0) return 'due now';
  const totalSec = Math.floor(ms / 1000);
  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  const secs = totalSec % 60;
  if (days > 0) return `in ${days}d ${hours}h`;
  if (hours > 0) return `in ${hours}h ${mins}m`;
  if (mins > 0) return `in ${mins}m ${secs}s`;
  return `in ${secs}s`;
}

function sastLocalDefault(): string {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: SAST,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date(Date.now() + 60 * 60 * 1000));
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? '';
  return `${get('year')}-${get('month')}-${get('day')}T${get('hour')}:${get('minute')}`;
}

function nationalDigits(raw: string): string {
  let digits = raw.replace(/\D/g, '');
  if (digits.startsWith('0')) digits = digits.slice(1);
  return digits;
}

function sendAtIso(value: string): string | null {
  if (!value) return null;
  const normalized = value.length === 16 ? `${value}:00` : value;
  const date = new Date(`${normalized}+02:00`);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

const JARVIS_PILL: Record<string, string> = {
  sent: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  failed: 'bg-rose-50 text-rose-700 border-rose-200',
  scheduled: 'bg-amber-50 text-amber-800 border-amber-200',
  sending: 'bg-sky-50 text-sky-700 border-sky-200',
  pending: 'bg-slate-100 text-slate-600 border-slate-200',
};

function JarvisStatus({ lead }: { lead: StandLead }) {
  const status = lead.jarvis_status || 'pending';
  return (
    <div className="min-w-0">
      <span className={`status-badge border ${JARVIS_PILL[status] ?? JARVIS_PILL.pending}`}>
        {status}
      </span>
      {lead.jarvis_error && (
        <p className="text-xs text-rose-600 mt-1 leading-snug">{lead.jarvis_error}</p>
      )}
    </div>
  );
}

function AddStandLeadModal({
  open,
  onClose,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const { toast } = useToast();
  const [form, setForm] = useState<StandForm>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) setForm({ ...EMPTY_FORM, send_at: sastLocalDefault() });
  }, [open]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const phone = `${form.dial}${nationalDigits(form.phone_national)}`;
    if (!form.warehouse_name || !form.first_name.trim() || !form.last_name.trim() || !form.city.trim()) return;
    if (!/^\+(91|27)\d{6,12}$/.test(phone)) {
      toast('error', 'Phone must start with +27 or +91.');
      return;
    }
    let sendAt: string | null = null;
    if (form.send_mode === 'scheduled') {
      sendAt = sendAtIso(form.send_at);
      if (!sendAt) {
        toast('error', 'Send date and time is required.');
        return;
      }
      if (new Date(sendAt).getTime() <= Date.now()) {
        toast('error', 'Send time must be in the future, in South Africa time.');
        return;
      }
    }
    setSubmitting(true);
    try {
      await post('/api/stand/leads', {
        warehouse_name: form.warehouse_name,
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        phone,
        city: form.city.trim(),
        email: form.email.trim() || null,
        send_mode: form.send_mode,
        send_at: sendAt,
      });
      toast('success', form.send_mode === 'scheduled' ? 'Lead scheduled.' : 'Lead sent to Jarvis.');
      onSuccess();
      onClose();
    } catch (err) {
      toast('error', (err as Error).message ?? 'Failed to save lead.');
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(15,23,42,0.45)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200/60 max-h-[90vh] overflow-y-auto"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">Add a lead</h2>
            <p className="text-xs text-slate-500 mt-0.5">Capture a promotional stand lead. Times are South Africa (SAST).</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            aria-label="Close modal"
          >
            <X size={16} />
          </button>
        </div>
        <form id="stand-lead-form" onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <fieldset className="space-y-2">
            <legend className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Preferred warehouse</legend>
            <div className="flex flex-wrap gap-3">
              {BRANCH_OPTIONS.map((branch) => (
                <label key={branch} className="inline-flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="radio"
                    name="warehouse_name"
                    required
                    checked={form.warehouse_name === branch}
                    onChange={() => setForm((current) => ({ ...current, warehouse_name: branch }))}
                  />
                  {branch}
                </label>
              ))}
            </div>
          </fieldset>
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Marketing source</span>
            <input className="input" value="Promotional Stand" disabled />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className="space-y-1.5">
              <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">First name</span>
              <input
                required
                className="input"
                value={form.first_name}
                onChange={(event) => setForm((current) => ({ ...current, first_name: event.target.value }))}
              />
            </label>
            <label className="space-y-1.5">
              <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Last name</span>
              <input
                required
                className="input"
                value={form.last_name}
                onChange={(event) => setForm((current) => ({ ...current, last_name: event.target.value }))}
              />
            </label>
          </div>
          <label className="space-y-1.5 block">
            <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Phone number</span>
            <div className="flex gap-2">
              <select
                className="select w-28"
                value={form.dial}
                onChange={(event) => setForm((current) => ({ ...current, dial: event.target.value as '+27' | '+91' }))}
                aria-label="Country code"
              >
                <option value="+27">+27</option>
                <option value="+91">+91</option>
              </select>
              <input
                required
                className="input"
                inputMode="tel"
                placeholder={form.dial === '+27' ? '82 123 4567' : '91234 56789'}
                value={form.phone_national}
                onChange={(event) => setForm((current) => ({ ...current, phone_national: event.target.value }))}
              />
            </div>
          </label>
          <label className="space-y-1.5 block">
            <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Email <span className="text-slate-400 font-normal normal-case">(optional)</span></span>
            <input
              type="email"
              className="input"
              value={form.email}
              onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            />
          </label>
          <label className="space-y-1.5 block">
            <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">City</span>
            <input
              required
              className="input"
              value={form.city}
              onChange={(event) => setForm((current) => ({ ...current, city: event.target.value }))}
            />
          </label>
          <fieldset className="space-y-2">
            <legend className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Send WhatsApp</legend>
            <div className="flex gap-4 text-sm text-slate-700">
              <label className="inline-flex items-center gap-2">
                <input
                  type="radio"
                  name="send_mode"
                  checked={form.send_mode === 'now'}
                  onChange={() => setForm((current) => ({ ...current, send_mode: 'now' }))}
                />
                Now
              </label>
              <label className="inline-flex items-center gap-2">
                <input
                  type="radio"
                  name="send_mode"
                  checked={form.send_mode === 'scheduled'}
                  onChange={() => setForm((current) => ({ ...current, send_mode: 'scheduled', send_at: current.send_at || sastLocalDefault() }))}
                />
                Timer
              </label>
            </div>
            <p className="text-xs text-slate-500">All times are South Africa (SAST, UTC+2). A timer of 8:00 PM sends at 8:00 PM in South Africa.</p>
            {form.send_mode === 'scheduled' && (
              <label className="space-y-1.5 block">
                <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Send date and time (South Africa)</span>
                <input
                  required
                  type="datetime-local"
                  className="input"
                  value={form.send_at}
                  onChange={(event) => setForm((current) => ({ ...current, send_at: event.target.value }))}
                />
              </label>
            )}
          </fieldset>
        </form>
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <button type="button" onClick={onClose} className="btn-secondary" disabled={submitting}>Cancel</button>
          <button type="submit" form="stand-lead-form" className="btn-primary" disabled={submitting}>
            {submitting ? 'Saving…' : 'Save lead'}
          </button>
        </div>
      </div>
    </div>
  );
}

const HEAD = 'text-left px-3 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap';
const CELL = 'px-3 py-3 align-middle text-sm text-slate-700';

type StandSort = 'created_desc' | 'created_asc' | 'timer_desc' | 'timer_asc';

function SortArrows({ active, direction }: { active: boolean; direction: 'asc' | 'desc' }) {
  return (
    <span className="inline-flex flex-col -space-y-1 ml-0.5" aria-hidden>
      <ChevronUp size={11} className={active && direction === 'asc' ? 'text-indigo-600' : 'text-slate-300'} />
      <ChevronDown size={11} className={active && direction === 'desc' ? 'text-indigo-600' : 'text-slate-300'} />
    </span>
  );
}

function stamp(iso: string | null | undefined): number | null {
  if (!iso) return null;
  const value = new Date(iso).getTime();
  return Number.isNaN(value) ? null : value;
}

function timerStamp(lead: StandLead): number | null {
  if (lead.send_mode !== 'scheduled') return null;
  return stamp(lead.send_at);
}

function compareLeads(a: StandLead, b: StandLead, sort: StandSort): number {
  const direction = sort.endsWith('_asc') ? 1 : -1;
  if (sort.startsWith('created')) {
    return ((stamp(a.created_at) ?? 0) - (stamp(b.created_at) ?? 0)) * direction;
  }
  const left = timerStamp(a);
  const right = timerStamp(b);
  if (left == null && right == null) return (stamp(b.created_at) ?? 0) - (stamp(a.created_at) ?? 0);
  if (left == null) return 1;
  if (right == null) return -1;
  return (left - right) * direction;
}

export function PromotionalStandPage() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<StandSort>('created_desc');
  const [addOpen, setAddOpen] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const [sendingId, setSendingId] = useState<number | null>(null);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const leadsQuery = useQuery<StandLead[]>({
    queryKey: ['stand-leads'],
    queryFn: () => get<StandLead[]>('/api/stand/leads'),
    refetchInterval: POLL_MS,
  });

  const sendNow = useMutation({
    mutationFn: (leadId: number) => post<{ status: string }>(`/api/stand/leads/${leadId}/send-now`, {}),
    onMutate: (leadId) => setSendingId(leadId),
    onSuccess: () => toast('success', 'Lead sent to Jarvis.'),
    onError: (err) => toast('error', (err as Error).message ?? 'Could not send lead.'),
    onSettled: () => {
      setSendingId(null);
      qc.invalidateQueries({ queryKey: ['stand-leads'] });
    },
  });

  const filtered = (leadsQuery.data ?? []).filter((lead) => {
    const haystack = `${lead.first_name} ${lead.last_name} ${lead.phone} ${lead.email ?? ''} ${lead.city} ${lead.warehouse_name}`.toLowerCase();
    return haystack.includes(search.toLowerCase());
  }).sort((a, b) => compareLeads(a, b, sort));

  return (
    <div className="p-8 w-full space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
            <span>Dashboard</span>
            <span>/</span>
            <span className="text-indigo-600">Promotional Stand</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Stand leads</h1>
          <p className="text-xs text-slate-500 mt-0.5">Timed leads wait here until the timer, or send now. Times are South Africa (SAST).</p>
        </div>
        <button type="button" onClick={() => setAddOpen(true)} className="btn-secondary">
          <UserPlus size={15} />
          Add lead
        </button>
      </div>

      <div className="card px-3 py-2">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            placeholder="Search name, phone, email, or city"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="input pl-8 py-1.5 text-xs bg-slate-50 border-slate-200 focus:bg-white"
          />
        </div>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full table-fixed text-sm">
          <colgroup>
            <col className="w-[7.25rem]" />
            <col className="w-[9.25rem]" />
            <col />
            <col className="w-[5.75rem]" />
            <col className="w-[6.5rem]" />
            <col className="w-[9.5rem]" />
            <col className="w-[7.25rem]" />
            <col className="w-[8rem]" />
            <col className="w-[5.5rem]" />
          </colgroup>
          <thead className="bg-slate-50/80 border-b border-slate-200/80">
            <tr>
              <th className={HEAD}>
                <button
                  type="button"
                  onClick={() => setSort(sort === 'created_desc' ? 'created_asc' : 'created_desc')}
                  className="inline-flex items-center tracking-normal hover:text-slate-800"
                  aria-label="Sort by created date"
                >
                  Created
                  <SortArrows active={sort === 'created_asc' || sort === 'created_desc'} direction={sort === 'created_asc' ? 'asc' : 'desc'} />
                </button>
              </th>
              {['Contact', 'Email', 'City', 'Warehouse', 'Source'].map((label) => (
                <th key={label} className={HEAD}>{label}</th>
              ))}
              <th className={HEAD}>
                <button
                  type="button"
                  onClick={() => setSort(sort === 'timer_desc' ? 'timer_asc' : 'timer_desc')}
                  className="inline-flex items-center tracking-normal hover:text-slate-800"
                  aria-label="Sort by timer"
                >
                  Timer
                  <SortArrows active={sort === 'timer_asc' || sort === 'timer_desc'} direction={sort === 'timer_asc' ? 'asc' : 'desc'} />
                </button>
              </th>
              {['Jarvis', 'Send'].map((label) => (
                <th key={label} className={HEAD}>{label}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {leadsQuery.isLoading ? (
              <tr><td colSpan={9}><TableSkeleton rows={8} cols={9} /></td></tr>
            ) : leadsQuery.error ? (
              <tr><td colSpan={9}><ErrorState message={(leadsQuery.error as Error).message} onRetry={leadsQuery.refetch} /></td></tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={9}>
                  <EmptyState title="No stand leads" description="Add a lead from the promotional stand, or clear the search." />
                </td>
              </tr>
            ) : (
              filtered.map((lead) => {
                const canSend = lead.jarvis_status === 'scheduled' || lead.jarvis_status === 'failed';
                const sending = sendingId === lead.id || lead.jarvis_status === 'sending';
                return (
                  <tr key={lead.id} className="hover:bg-slate-50/80">
                    <td className={`${CELL} whitespace-nowrap`}><When iso={lead.created_at} /></td>
                    <td className={`${CELL} whitespace-nowrap`}>
                      <p className="font-semibold text-slate-900 leading-tight">{lead.first_name} {lead.last_name}</p>
                      <p className="font-mono text-xs text-slate-500 mt-0.5">{lead.phone}</p>
                    </td>
                    <td className={`${CELL} max-w-0`}><EmailAddress value={lead.email} /></td>
                    <td className={`${CELL} whitespace-nowrap`}>{lead.city}</td>
                    <td className={`${CELL} whitespace-nowrap`}>{lead.warehouse_name.replace(/ Branch$/, '')}</td>
                    <td className={`${CELL} whitespace-nowrap`}>{lead.marketing_source}</td>
                    <td className={`${CELL} whitespace-nowrap`}>
                      {lead.send_mode === 'scheduled' && lead.send_at ? (
                        <span className="block leading-tight">
                          <When iso={lead.send_at} />
                          {lead.jarvis_status === 'scheduled' && (
                            <span className="block text-xs text-slate-500 mt-0.5">{remainingLabel(lead.send_at, now)}</span>
                          )}
                        </span>
                      ) : (
                        <span className="font-semibold text-slate-900">NOW</span>
                      )}
                    </td>
                    <td className={CELL}><JarvisStatus lead={lead} /></td>
                    <td className={CELL}>
                      {sending ? (
                        <span className="text-xs text-slate-500">Sending…</span>
                      ) : canSend ? (
                        <button
                          type="button"
                          className="btn-primary text-xs px-2.5 py-1.5"
                          onClick={() => sendNow.mutate(lead.id)}
                        >
                          Send now
                        </button>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <AddStandLeadModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSuccess={() => qc.invalidateQueries({ queryKey: ['stand-leads'] })}
      />
    </div>
  );
}
