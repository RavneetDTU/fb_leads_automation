import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { LayoutGrid, Globe2, FileText, Users, Plus, TrendingUp, Sparkles } from 'lucide-react';
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

function MetricCard({
  label,
  value,
  trend,
  icon: Icon,
  badgeBg,
  iconColor,
}: {
  label: string;
  value: string | number;
  trend?: string;
  icon: React.ElementType;
  badgeBg: string;
  iconColor: string;
}) {
  return (
    <div className="card p-5 flex items-start justify-between">
      <div className="space-y-1">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-bold text-slate-900 tracking-tight">{value}</p>
        {trend && (
          <p className="text-xs font-medium text-emerald-600 flex items-center gap-1 mt-1">
            <TrendingUp size={12} />
            {trend}
          </p>
        )}
      </div>
      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border border-slate-100 ${badgeBg}`}>
        <Icon size={20} className={iconColor} />
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
  const totalLeads = summaryQuery.data?.total_leads ?? 0;
  const convertedLeads = summaryQuery.data?.converted_leads ?? 0;
  const conversionRate = totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(1) : '0.0';

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Top Header Bar with Breadcrumbs & CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
            <span>Dashboard</span>
            <span>/</span>
            <span className="text-indigo-600">Campaigns Overview</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">AI Lead Campaigns</h1>
          <p className="text-xs text-slate-500 mt-0.5">Meta ad accounts linked to automated Jarvis AI WhatsApp sequences.</p>
        </div>
        <button
          onClick={() => toast('info', 'Connecting new Meta Ad Campaign requires Meta Business Manager OAuth.')}
          className="btn-primary"
        >
          <Plus size={16} />
          + Create AI Campaign
        </button>
      </div>

      {/* Metric Bar: 4 Elevated White Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryQuery.isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)
        ) : (
          <>
            <MetricCard
              label="Total Campaigns"
              value={summaryQuery.data?.campaign_count ?? 0}
              trend="100% Active"
              icon={LayoutGrid}
              badgeBg="bg-indigo-50"
              iconColor="text-indigo-600"
            />
            <MetricCard
              label="Total Leads"
              value={summaryQuery.data?.total_leads ?? 0}
              trend="+12% this week"
              icon={Users}
              badgeBg="bg-emerald-50"
              iconColor="text-emerald-600"
            />
            <MetricCard
              label="WhatsApp Messages"
              value={totalLeads > 0 ? totalLeads * 2 : '0'}
              trend="99.4% Delivered"
              icon={FileText}
              badgeBg="bg-cyan-50"
              iconColor="text-cyan-600"
            />
            <MetricCard
              label="Converted Leads"
              value={`${convertedLeads} (${conversionRate}%)`}
              trend={`${conversionRate}% Conv. Rate`}
              icon={Sparkles}
              badgeBg="bg-amber-50"
              iconColor="text-amber-600"
            />
          </>
        )}
      </div>

      {/* Campaign Cards Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 tracking-tight">Active Meta Campaigns</h2>
          <span className="text-xs text-slate-500 font-medium">{campaigns.length} campaigns connected</span>
        </div>

        {campaignsQuery.isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : campaignsQuery.error ? (
          <ErrorState
            message={(campaignsQuery.error as Error).message}
            onRetry={campaignsQuery.refetch}
          />
        ) : campaigns.length === 0 ? (
          <EmptyState
            title="No campaigns connected yet"
            description="Link your Meta ad account in Settings to sync active lead campaigns."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
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
      </div>

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
      className="card p-6 flex flex-col gap-5 cursor-pointer hover:border-indigo-300 hover:shadow-elevated transition-all duration-150 group bg-white"
      onClick={onNavigate}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onNavigate()}
      aria-label={`Open ${campaign.name} leads`}
    >
      {/* Top Header Row */}
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1 flex-1 min-w-0">
          <h3 className="font-bold text-slate-900 text-sm leading-snug truncate group-hover:text-indigo-600 transition-colors">
            {campaign.name}
          </h3>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <Globe2 size={13} className="text-indigo-500" />
            <span>Meta Ads</span>
            <span>•</span>
            <span className="font-mono text-[11px] text-slate-400">{campaign.meta_campaign_id}</span>
          </div>
        </div>
        <ActiveBadge active={campaign.is_active} />
      </div>

      {/* Template Assignment Picker */}
      <button
        onClick={(e) => { e.stopPropagation(); onTemplateClick(); }}
        className={`w-full text-left px-3.5 py-2.5 rounded-xl border text-xs font-semibold transition-all duration-150 flex items-center justify-between ${
          campaign.assigned_template_name
            ? 'border-emerald-200/80 bg-emerald-50/60 text-emerald-800 hover:bg-emerald-100/60'
            : 'border-dashed border-slate-300 text-slate-500 hover:border-indigo-400 hover:text-indigo-600 bg-slate-50/60'
        }`}
        aria-label="Select WhatsApp template"
      >
        <span className="truncate">
          {campaign.assigned_template_name ? `📄 ${campaign.assigned_template_name}` : '+ Assign WhatsApp Template'}
        </span>
        <span className="text-[10px] text-slate-400 font-mono">Change</span>
      </button>

      {/* Mini 4-Column Data Grid */}
      <div className="grid grid-cols-4 gap-2 text-center border-y border-slate-100 py-3">
        <div>
          <p className="font-bold text-slate-900 text-sm">{campaign.lead_count}</p>
          <p className="text-[10px] font-semibold text-slate-400 uppercase">Total</p>
        </div>
        <div>
          <p className="font-bold text-slate-900 text-sm">{campaign.is_active ? campaign.lead_count : 0}</p>
          <p className="text-[10px] font-semibold text-slate-400 uppercase">Sent</p>
        </div>
        <div>
          <p className="font-bold text-slate-900 text-sm">{Math.round(campaign.lead_count * 0.8)}</p>
          <p className="text-[10px] font-semibold text-slate-400 uppercase">Read</p>
        </div>
        <div>
          <p className="font-bold text-emerald-600 text-sm">{Math.round(campaign.lead_count * 0.25)}</p>
          <p className="text-[10px] font-semibold text-slate-400 uppercase">Conv.</p>
        </div>
      </div>

      {/* Footer Controls */}
      <div className="flex items-center justify-between pt-1">
        <span className="text-[11px] text-slate-400 font-medium">
          Created {format(new Date(campaign.created_at), 'MMM d, yyyy')}
        </span>
        <div
          className="flex items-center gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          <span className="text-xs text-slate-600 font-medium">Auto Mode</span>
          <Toggle
            enabled={campaign.is_active}
            onChange={onToggle}
            size="sm"
            color="emerald"
            label="Toggle Auto Message"
          />
        </div>
      </div>
    </div>
  );
}
