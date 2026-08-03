import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Search, Send, Users, Eye, CheckCircle } from 'lucide-react';
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

function StatCard({ label, value, color, icon: Icon }: {
  label: string; value: number | string; color: string; icon: React.ElementType;
}) {
  return (
    <div className="card p-4 flex items-center gap-3.5 hover:border-sage/40">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-apple-sm ${color}`}>
        <Icon size={16} className="text-white" />
      </div>
      <div>
        <p className="text-xl font-bold text-forest leading-none">{value}</p>
        <p className="text-xs text-neutral-secondary font-medium mt-1">{label}</p>
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
    <div className="p-6 max-w-7xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-forest tracking-tight">Last 30 Days</h1>
          <p className="text-sm text-neutral-secondary mt-1">All leads managed by Jarvis AI from the past 30 days.</p>
        </div>
        <button
          onClick={() => navigate('/campaigns')}
          className="btn-secondary"
        >
          Auto-Message Campaigns →
        </button>
      </div>

      {/* Stat row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {summaryQuery.isLoading ? (
          Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)
        ) : (
          <>
            <StatCard label="Total Leads" value={summaryQuery.data?.total ?? 0} color="bg-forest" icon={Users} />
            <StatCard label="New" value={summaryQuery.data?.new ?? 0} color="bg-sage" icon={Users} />
            <StatCard label="Template Sent" value={summaryQuery.data?.template_sent ?? 0} color="bg-forest-hover" icon={Send} />
            <StatCard label="Unread" value={summaryQuery.data?.unread ?? 0} color="bg-terracotta" icon={Eye} />
            <StatCard label="Responded" value={summaryQuery.data?.responded ?? 0} color="bg-[#2E6A47]" icon={CheckCircle} />
          </>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-muted" />
          <input
            type="search"
            placeholder="Search name, phone, campaign…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-9"
          />
        </div>
        <select
          value={campaignFilter}
          onChange={(e) => { setCampaignFilter(e.target.value); setOffset(0); }}
          className="select w-auto min-w-[180px]"
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
          className="select w-auto min-w-[160px]"
          aria-label="Filter by status"
        >
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-cream-light border-b border-neutral-border">
              <tr>
                {['Lead ID', 'Created', 'Name', 'Phone', 'Campaign', 'Status', 'AI Mode', 'Action'].map((h) => (
                  <th key={h} className="text-left px-4 py-3.5 text-[11px] font-semibold text-neutral-secondary uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-border/60">
              {leadsQuery.isLoading ? (
                <tr><td colSpan={8}><TableSkeleton rows={8} cols={8} /></td></tr>
              ) : leadsQuery.error ? (
                <tr><td colSpan={8}><ErrorState message={(leadsQuery.error as Error).message} onRetry={leadsQuery.refetch} /></td></tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8}>
                    <EmptyState title="No leads found" description="Try adjusting your filters or date range." />
                  </td>
                </tr>
              ) : (
                filtered.map((lead) => (
                  <tr
                    key={lead.id}
                    className="hover:bg-cream-light/60 cursor-pointer transition-colors duration-150"
                    onClick={() => setSelectedLead(lead.id)}
                  >
                    <td className="px-4 py-3.5 text-neutral-muted font-mono text-xs">{lead.id.slice(0, 8)}…</td>
                    <td className="px-4 py-3.5 text-neutral-secondary text-xs whitespace-nowrap">
                      {format(new Date(lead.created_at), 'MMM d, HH:mm')}
                    </td>
                    <td className="px-4 py-3.5 font-medium text-forest whitespace-nowrap">{lead.full_name}</td>
                    <td className="px-4 py-3.5 text-neutral-body text-xs font-mono">{lead.phone}</td>
                    <td className="px-4 py-3.5 text-neutral-secondary text-xs max-w-[140px] truncate">{lead.campaign_name ?? '—'}</td>
                    <td className="px-4 py-3.5"><StatusBadge status={lead.status} /></td>
                    <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                      <Toggle
                        enabled={lead.ai_mode}
                        onChange={(val) => aiMutation.mutate({ leadId: lead.id, ai_mode: val })}
                        size="sm"
                        label="Toggle AI mode"
                      />
                    </td>
                    <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                      <button
                        disabled
                        title={`Go to ${lead.campaign_name ?? 'campaign'} → Select Template to send to this and any other pending leads.`}
                        className="btn-secondary text-xs py-1 px-2.5 opacity-40 cursor-not-allowed"
                      >
                        <Send size={12} />
                        Send
                      </button>
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
