import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Search, Send, Users, Eye, CheckCircle, MessageSquare, PhoneCall } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { get, patch } from '../lib/api';
import type { LeadSummary, LeadPaginatedResponse, LeadListItem, LeadStatus, Campaign } from '../types';
import { StatusBadge } from '../components/ui/Badge';
import { Toggle } from '../components/ui/Toggle';
import { Skeleton, TableSkeleton } from '../components/ui/Spinner';
import { ErrorState, EmptyState } from '../components/ui/States';
import { Pagination } from '../components/ui/Pagination';
import { LeadModal } from '../components/leads/LeadModal';

const LIMIT = 50;
const POLL_MS = 10_000;

const STATUS_OPTIONS: LeadStatus[] = ['NEW', 'TEMPLATE_SENT', 'UNREAD', 'WAITING_FOR_REPLY', 'BOOKED', 'HANDED_OFF'];

function MetricStat({ label, value, color, icon: Icon }: {
  label: string; value: number | string; color: string; icon: React.ElementType;
}) {
  return (
    <div className="card p-4 flex items-center gap-3.5">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${color}`}>
        <Icon size={16} className="text-white" />
      </div>
      <div>
        <p className="text-lg font-bold text-slate-900 leading-none">{value}</p>
        <p className="text-xs text-slate-500 font-medium mt-1">{label}</p>
      </div>
    </div>
  );
}

export function LastThirtyDaysPage() {
  const { token } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [search, setSearch] = useState('');
  const [campaignFilter, setCampaignFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<LeadStatus | ''>('');
  const [offset, setOffset] = useState(0);
  const [selectedLead, setSelectedLead] = useState<string | null>(null);

  const summaryQuery = useQuery<LeadSummary>({
    queryKey: ['leads-summary'],
    queryFn: () => get<LeadSummary>('/api/leads/summary?window_days=30', token!),
    enabled: !!token,
    refetchInterval: POLL_MS,
  });

  const leadsQuery = useQuery<LeadPaginatedResponse>({
    queryKey: ['leads', { statusFilter, campaignFilter, offset }],
    queryFn: () => {
      const params = new URLSearchParams({
        days: '30',
        sort: 'last_activity_desc',
        limit: String(LIMIT),
        offset: String(offset),
      });
      if (statusFilter) params.set('status', statusFilter);
      if (campaignFilter) params.set('campaign_id', campaignFilter);
      return get<LeadPaginatedResponse>(`/api/leads?${params}`, token!);
    },
    enabled: !!token,
    refetchInterval: POLL_MS,
  });

  const campaignsQuery = useQuery<Campaign[]>({
    queryKey: ['campaigns'],
    queryFn: () => get<Campaign[]>('/api/campaigns?limit=100', token!),
    enabled: !!token,
  });

  const aiMutation = useMutation({
    mutationFn: ({ leadId, ai_mode }: { leadId: string; ai_mode: boolean }) =>
      patch<LeadListItem>(`/api/leads/${leadId}`, token!, { ai_mode }),
    onMutate: async ({ leadId, ai_mode }) => {
      const key = ['leads', { statusFilter, campaignFilter, offset }];
      await qc.cancelQueries({ queryKey: key });
      const prev = qc.getQueryData<LeadPaginatedResponse>(key);
      qc.setQueryData<LeadPaginatedResponse>(key, (old) =>
        old ? { ...old, items: old.items.map((l) => l.id === leadId ? { ...l, ai_mode } : l) } : old,
      );
      return { prev, key };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(ctx.key, ctx.prev);
      toast('error', 'Failed to update AI mode.');
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ['leads'] }),
  });

  const filtered = (leadsQuery.data?.items ?? []).filter((l) =>
    `${l.full_name} ${l.phone} ${l.campaign_name ?? ''}`.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
            <span>Dashboard</span>
            <span>/</span>
            <span className="text-indigo-600">Lead Logs</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Lead Activity & Logs</h1>
          <p className="text-xs text-slate-500 mt-0.5">Real-time status tracking for all inbound Meta ad leads from the last 30 days.</p>
        </div>
        <button
          onClick={() => navigate('/whatsapp')}
          className="btn-primary"
        >
          <MessageSquare size={16} />
          Open WhatsApp Inbox →
        </button>
      </div>

      {/* Stat Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {summaryQuery.isLoading ? (
          Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)
        ) : (
          <>
            <MetricStat label="Total Inbound" value={summaryQuery.data?.total ?? 0} color="bg-indigo-600" icon={Users} />
            <MetricStat label="New Leads" value={summaryQuery.data?.new ?? 0} color="bg-cyan-600" icon={Users} />
            <MetricStat label="Template Sent" value={summaryQuery.data?.template_sent ?? 0} color="bg-slate-700" icon={Send} />
            <MetricStat label="Unread" value={summaryQuery.data?.unread ?? 0} color="bg-amber-600" icon={Eye} />
            <MetricStat label="Responded" value={summaryQuery.data?.responded ?? 0} color="bg-emerald-600" icon={CheckCircle} />
          </>
        )}
      </div>

      {/* Search & Filter Bar */}
      <div className="card p-4 flex flex-col md:flex-row gap-3 items-center">
        <div className="relative flex-1 w-full">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            placeholder="Search lead name, phone number, or campaign..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-10 bg-slate-50 border-slate-200 focus:bg-white"
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto shrink-0">
          <select
            value={campaignFilter}
            onChange={(e) => { setCampaignFilter(e.target.value); setOffset(0); }}
            className="select min-w-[180px] bg-slate-50 border-slate-200"
            aria-label="Filter by campaign"
          >
            <option value="">All Campaigns</option>
            {(campaignsQuery.data ?? []).map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value as LeadStatus | ''); setOffset(0); }}
            className="select min-w-[170px] bg-slate-50 border-slate-200"
            aria-label="Filter by status"
          >
            <option value="">All Statuses</option>
            {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* Clean White Table Container */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50/80 border-b border-slate-200/80">
              <tr>
                {['Lead ID', 'Created', 'Contact Name & Phone', 'Campaign', 'Status', 'AI Mode', 'Action'].map((h) => (
                  <th key={h} className="text-left px-5 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {leadsQuery.isLoading ? (
                <tr><td colSpan={7}><TableSkeleton rows={8} cols={7} /></td></tr>
              ) : leadsQuery.error ? (
                <tr><td colSpan={7}><ErrorState message={(leadsQuery.error as Error).message} onRetry={leadsQuery.refetch} /></td></tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <EmptyState title="No leads matched filters" description="Try clearing your search query or dropdown selections." />
                  </td>
                </tr>
              ) : (
                filtered.map((lead) => (
                  <tr
                    key={lead.id}
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors duration-150"
                    onClick={() => setSelectedLead(lead.id)}
                  >
                    <td className="px-5 py-4 text-slate-400 font-mono text-xs font-medium">{lead.id.slice(0, 8)}…</td>
                    <td className="px-5 py-4 text-slate-500 text-xs font-medium whitespace-nowrap">
                      {format(new Date(lead.created_at), 'MMM d, HH:mm')}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <p className="font-bold text-slate-900 text-sm">{lead.full_name}</p>
                      <p className="text-xs font-mono text-slate-500 mt-0.5">{lead.phone}</p>
                    </td>
                    <td className="px-5 py-4 text-slate-600 text-xs max-w-[160px] truncate font-medium">
                      {lead.campaign_name ?? 'Direct Inbound'}
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={lead.status} />
                    </td>
                    <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                      <Toggle
                        enabled={lead.ai_mode}
                        onChange={(val) => aiMutation.mutate({ leadId: lead.id, ai_mode: val })}
                        size="sm"
                        color="indigo"
                        label="Toggle AI mode"
                      />
                    </td>
                    <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => navigate('/whatsapp')}
                          className="btn-secondary text-xs px-2.5 py-1.5 gap-1.5"
                          title="Open WhatsApp Chat"
                        >
                          <MessageSquare size={13} className="text-emerald-600" />
                          <span>Chat</span>
                        </button>
                        <button
                          onClick={() => toast('info', 'Call audio logging feature is available for voice-agent calls.')}
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-indigo-600 hover:bg-slate-50 transition-colors"
                          title="Play Call Audio"
                        >
                          <PhoneCall size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {leadsQuery.data && (
          <Pagination
            total={leadsQuery.data.total}
            limit={LIMIT}
            offset={offset}
            onPageChange={setOffset}
          />
        )}
      </div>

      {selectedLead && (
        <LeadModal leadId={selectedLead} open={!!selectedLead} onClose={() => setSelectedLead(null)} />
      )}
    </div>
  );
}
