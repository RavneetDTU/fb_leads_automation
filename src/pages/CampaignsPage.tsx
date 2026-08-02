import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { LayoutGrid, Globe2, FileText, Users, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { get, patch } from '../lib/api';
import type { Campaign, CampaignSummary } from '../types';
import { ActiveBadge } from '../components/ui/Badge';
import { Toggle } from '../components/ui/Toggle';
import { CardSkeleton } from '../components/ui/Spinner';
import { ErrorState, EmptyState } from '../components/ui/States';
import { TemplatePicker } from '../components/campaigns/TemplatePicker';

function StatCard({ label, value, icon: Icon, color }: {
  label: string; value: string | number; icon: React.ElementType; color: string;
}) {
  return (
    <div className="card p-5 flex items-center gap-4 hover:border-slate-300">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-apple-sm ${color}`}>
        <Icon size={18} className="text-white" />
      </div>
      <div>
        <p className="text-2xl font-semibold text-slate-900 leading-none">{value}</p>
        <p className="text-xs text-slate-500 font-medium mt-1">{label}</p>
      </div>
    </div>
  );
}

export function CampaignsPage() {
  const { token } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [pickerCampaignId, setPickerCampaignId] = useState<string | null>(null);

  const summaryQuery = useQuery<CampaignSummary>({
    queryKey: ['campaigns-summary'],
    queryFn: () => get<CampaignSummary>('/api/campaigns/summary', token!),
    enabled: !!token,
  });

  const campaignsQuery = useQuery<Campaign[]>({
    queryKey: ['campaigns'],
    queryFn: () => get<Campaign[]>('/api/campaigns?limit=100', token!),
    enabled: !!token,
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, is_active }: { id: string; is_active: boolean }) =>
      patch<Campaign>(`/api/campaigns/${id}`, token!, { is_active }),
    onMutate: async ({ id, is_active }) => {
      await qc.cancelQueries({ queryKey: ['campaigns'] });
      const prev = qc.getQueryData<Campaign[]>(['campaigns']);
      qc.setQueryData<Campaign[]>(['campaigns'], (old) =>
        old?.map((c) => (c.id === id ? { ...c, is_active } : c)),
      );
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(['campaigns'], ctx.prev);
      toast('error', 'Failed to update Auto Message toggle.');
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ['campaigns'] }),
  });

  const campaigns = campaignsQuery.data ?? [];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Campaigns</h1>
        <p className="text-sm text-slate-500 mt-1">Meta ad campaigns connected to your WhatsApp automation.</p>
      </div>

      {/* Stat row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryQuery.isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)
        ) : (
          <>
            <StatCard
              label="Campaigns"
              value={summaryQuery.data?.campaign_count ?? 'N/A'}
              icon={LayoutGrid}
              color="bg-indigo-600"
            />
            <StatCard
              label="Total Leads"
              value={summaryQuery.data?.total_leads ?? 'N/A'}
              icon={Users}
              color="bg-blue-600"
            />
            <StatCard
              label="WhatsApp Messages Sent"
              value="N/A"
              icon={FileText}
              color="bg-emerald-600"
            />
            <StatCard
              label="Converted Leads"
              value={summaryQuery.data?.converted_leads ?? 'N/A'}
              icon={ChevronRight}
              color="bg-teal-600"
            />
          </>
        )}
      </div>

      {/* Campaign grid */}
      {campaignsQuery.isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : campaignsQuery.error ? (
        <ErrorState
          message={(campaignsQuery.error as Error).message}
          onRetry={campaignsQuery.refetch}
        />
      ) : campaigns.length === 0 ? (
        <EmptyState
          title="No campaigns yet"
          description="Connect your Meta ad account to see campaigns here."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {campaigns.map((campaign) => (
            <CampaignCard
              key={campaign.id}
              campaign={campaign}
              onNavigate={() => navigate(`/campaigns/${campaign.id}/leads`)}
              onToggle={(val) => toggleMutation.mutate({ id: campaign.id, is_active: val })}
              onTemplateClick={() => setPickerCampaignId(campaign.id)}
            />
          ))}
        </div>
      )}

      {/* Template picker modal */}
      {pickerCampaignId && (
        <TemplatePicker
          campaignId={pickerCampaignId}
          open={!!pickerCampaignId}
          onClose={() => setPickerCampaignId(null)}
        />
      )}
    </div>
  );
}

function CampaignCard({
  campaign, onNavigate, onToggle, onTemplateClick,
}: {
  campaign: Campaign;
  onNavigate: () => void;
  onToggle: (val: boolean) => void;
  onTemplateClick: () => void;
}) {
  return (
    <div
      className="card p-5 flex flex-col gap-4 cursor-pointer hover:border-slate-300/90 hover:shadow-md transition-all duration-150 group"
      onClick={onNavigate}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onNavigate()}
      aria-label={`Open ${campaign.name} leads`}
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-slate-900 text-sm leading-snug truncate flex-1 group-hover:text-emerald-700 transition-colors">
          {campaign.name}
        </h3>
        <ActiveBadge active={campaign.is_active} />
      </div>

      {/* Source */}
      <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
        <Globe2 size={14} className="text-blue-500" />
        Facebook Ads
      </div>

      {/* Template badge */}
      <button
        onClick={(e) => { e.stopPropagation(); onTemplateClick(); }}
        className={`w-full text-left px-3.5 py-2.5 rounded-lg border text-xs font-medium transition-all duration-150 ${
          campaign.assigned_template_name
            ? 'border-emerald-200 bg-emerald-50/70 text-emerald-800 hover:bg-emerald-100/70'
            : 'border-dashed border-slate-300 text-slate-500 hover:border-slate-400 hover:text-slate-700 bg-slate-50/50'
        }`}
        aria-label="Select template"
      >
        {campaign.assigned_template_name ? `📄 ${campaign.assigned_template_name}` : '+ Assign Template'}
      </button>

      {/* Counts */}
      <div className="grid grid-cols-4 gap-2 text-center">
        {[
          { label: 'Total', value: campaign.lead_count },
          { label: "Today's", value: 'N/A' },
          { label: 'Contacted', value: 'N/A' },
          { label: 'Converted', value: 'N/A' },
        ].map(({ label, value }) => (
          <div key={label} className="bg-slate-50/80 rounded-lg py-2 border border-slate-100">
            <p className="font-semibold text-slate-900 text-sm">{value}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
        <span className="text-[11px] text-slate-400">
          Created {format(new Date(campaign.created_at), 'MMM d, yyyy')}
        </span>
        <div
          className="flex items-center gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          <span className="text-xs text-slate-500 font-medium">Auto</span>
          <Toggle
            enabled={campaign.is_active}
            onChange={onToggle}
            size="sm"
            label="Toggle Auto Message"
          />
        </div>
      </div>
    </div>
  );
}
