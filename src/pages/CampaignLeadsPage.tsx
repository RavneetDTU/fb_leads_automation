import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { ChevronRight, Search, FileText } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { get, patch } from '../lib/api';
import type { Campaign, CampaignLeadsPaginatedResponse, LeadListItem } from '../types';
import { StatusBadge } from '../components/ui/Badge';
import { Toggle } from '../components/ui/Toggle';
import { TableSkeleton } from '../components/ui/Spinner';
import { ErrorState, EmptyState } from '../components/ui/States';
import { Pagination } from '../components/ui/Pagination';
import { LeadModal } from '../components/leads/LeadModal';
import { TemplatePicker } from '../components/campaigns/TemplatePicker';

const LIMIT = 50;

export function CampaignLeadsPage() {
  const { id: campaignId } = useParams<{ id: string }>();
  const { token } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [offset, setOffset] = useState(0);
  const [selectedLead, setSelectedLead] = useState<string | null>(null);
  const [templateOpen, setTemplateOpen] = useState(false);

  const campaignQuery = useQuery<Campaign[]>({
    queryKey: ['campaigns'],
    queryFn: () => get<Campaign[]>('/api/campaigns?limit=100', token!),
    enabled: !!token,
  });

  const campaign = campaignQuery.data?.find((c) => c.id === campaignId);

  const leadsQuery = useQuery<CampaignLeadsPaginatedResponse>({
    queryKey: ['campaign-leads', campaignId, offset],
    queryFn: () =>
      get<CampaignLeadsPaginatedResponse>(
        `/api/campaigns/${campaignId}/leads?limit=${LIMIT}&offset=${offset}`,
        token!,
      ),
    enabled: !!token && !!campaignId,
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, is_active }: { id: string; is_active: boolean }) =>
      patch(`/api/campaigns/${id}`, token!, { is_active }),
    onMutate: async ({ id, is_active }) => {
      await qc.cancelQueries({ queryKey: ['campaigns'] });
      const prev = qc.getQueryData<Campaign[]>(['campaigns']);
      qc.setQueryData<Campaign[]>(['campaigns'], (old) =>
        old?.map((c) => (c.id === id ? { ...c, is_active } : c)),
      );
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(['campaigns'], ctx.prev);
      toast('error', 'Failed to update Auto Message.');
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ['campaigns'] }),
  });

  const aiMutation = useMutation({
    mutationFn: ({ leadId, ai_mode }: { leadId: string; ai_mode: boolean }) =>
      patch(`/api/leads/${leadId}`, token!, { ai_mode }),
    onMutate: async ({ leadId, ai_mode }) => {
      await qc.cancelQueries({ queryKey: ['campaign-leads', campaignId] });
      const prev = qc.getQueryData<CampaignLeadsPaginatedResponse>(['campaign-leads', campaignId, offset]);
      qc.setQueryData<CampaignLeadsPaginatedResponse>(['campaign-leads', campaignId, offset], (old) =>
        old ? { ...old, items: old.items.map((l) => l.id === leadId ? { ...l, ai_mode } : l) } : old,
      );
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(['campaign-leads', campaignId, offset], ctx.prev);
      toast('error', 'Failed to update AI mode.');
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ['campaign-leads', campaignId] }),
  });

  const filtered = (leadsQuery.data?.items ?? []).filter((l) =>
    `${l.full_name} ${l.phone}`.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="p-6 space-y-5">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Link to="/campaigns" className="hover:text-slate-700">Campaigns</Link>
        <ChevronRight size={14} />
        <span className="text-slate-800 font-medium truncate">{campaign?.name ?? '...'}</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl font-bold text-slate-800 truncate">
          {campaign?.name ? `${campaign.name} — Leads` : 'Campaign Leads'}
        </h1>
        <div className="flex items-center gap-3 shrink-0">
          {campaign && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-600">Auto Message</span>
              <Toggle
                enabled={campaign.is_active}
                onChange={(val) => toggleMutation.mutate({ id: campaign.id, is_active: val })}
                label="Toggle Auto Message"
              />
            </div>
          )}
          <button
            onClick={() => setTemplateOpen(true)}
            className="btn-secondary"
          >
            <FileText size={15} />
            Select Template
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="search"
          placeholder="Search by name or phone…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input pl-9"
        />
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                {['Name', 'Phone', 'Status', 'AI Mode', 'Date'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {leadsQuery.isLoading ? (
                <tr><td colSpan={5}><TableSkeleton rows={8} cols={5} /></td></tr>
              ) : leadsQuery.error ? (
                <tr><td colSpan={5}><ErrorState message={(leadsQuery.error as Error).message} onRetry={leadsQuery.refetch} /></td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5}><EmptyState title="No leads found" description="No leads match your search." /></td></tr>
              ) : (
                filtered.map((lead) => (
                  <LeadRow
                    key={lead.id}
                    lead={lead}
                    onClick={() => setSelectedLead(lead.id)}
                    onAiToggle={(val) => aiMutation.mutate({ leadId: lead.id, ai_mode: val })}
                  />
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

      {/* Lead modal */}
      {selectedLead && (
        <LeadModal
          leadId={selectedLead}
          open={!!selectedLead}
          onClose={() => setSelectedLead(null)}
        />
      )}

      {/* Template picker */}
      {campaignId && (
        <TemplatePicker
          campaignId={campaignId}
          open={templateOpen}
          onClose={() => setTemplateOpen(false)}
        />
      )}
    </div>
  );
}

function LeadRow({ lead, onClick, onAiToggle }: {
  lead: LeadListItem; onClick: () => void; onAiToggle: (val: boolean) => void;
}) {
  return (
    <tr
      className="hover:bg-slate-50 cursor-pointer transition-colors"
      onClick={onClick}
    >
      <td className="px-4 py-3 font-medium text-slate-800">{lead.full_name}</td>
      <td className="px-4 py-3 text-slate-600">{lead.phone}</td>
      <td className="px-4 py-3"><StatusBadge status={lead.status} /></td>
      <td
        className="px-4 py-3"
        onClick={(e) => e.stopPropagation()}
      >
        <Toggle enabled={lead.ai_mode} onChange={onAiToggle} size="sm" label="Toggle AI mode" />
      </td>
      <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">
        {format(new Date(lead.created_at), 'MMM d, yyyy')}
      </td>
    </tr>
  );
}
