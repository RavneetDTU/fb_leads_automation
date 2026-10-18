import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { Search, MessageSquare } from 'lucide-react';
import { get } from '../lib/api';
import { ALL_LEAD_STATUSES, LEAD_SORT_OPTIONS, type LeadSort } from '../lib/leadStatuses';
import { BRANCH_OPTIONS } from '../lib/branches';
import type { Campaign, ConversationListItem, LeadStatus } from '../types';
import { StatusBadge } from '../components/ui/Badge';
import { Spinner } from '../components/ui/Spinner';
import { ErrorState, EmptyState } from '../components/ui/States';
import { LeadChatThread } from '../components/chat/LeadChatThread';

const POLL_MS = 10_000;

function getInitials(name: string): string {
  if (!name) return '?';
  return name
    .trim()
    .split(/\s+/)
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function WhatsAppInboxPage() {
  const [search, setSearch] = useState('');
  const [campaignFilter, setCampaignFilter] = useState('');
  const [branchFilter, setBranchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<LeadStatus | ''>('');
  const [sort, setSort] = useState<LeadSort>('last_activity_desc');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const convsQuery = useQuery<ConversationListItem[]>({
    queryKey: ['conversations', { search, campaignFilter, branchFilter, statusFilter, sort }],
    queryFn: () => {
      const params = new URLSearchParams({ limit: '50', sort });
      if (search) params.set('search', search);
      if (campaignFilter) params.set('campaign_id', campaignFilter);
      if (branchFilter) params.set('branch', branchFilter);
      if (statusFilter) params.set('status', statusFilter);
      return get<ConversationListItem[]>(`/api/inbox/conversations?${params}`);
    },
    refetchInterval: POLL_MS,
  });

  const campaignsQuery = useQuery<Campaign[]>({
    queryKey: ['campaigns'],
    queryFn: () => get<Campaign[]>('/api/campaigns?limit=100'),
  });

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100">
      {/* Left Panel (35% width): Contact List */}
      <div className="w-[35%] min-w-[320px] max-w-[420px] shrink-0 flex flex-col border-r border-slate-200 bg-white shadow-soft">
        {/* Search Header */}
        <div className="px-3 py-2.5 border-b border-slate-200 bg-slate-50/70">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-base font-bold text-slate-900 tracking-tight">WhatsApp Chats</h2>
            <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
              Wati Connected
            </span>
          </div>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              placeholder="Search contacts or chats…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-8 py-1.5 text-xs rounded-full bg-white border-slate-200 focus:border-indigo-500 shadow-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-1.5 mt-2">
            <select
              value={campaignFilter}
              onChange={(e) => setCampaignFilter(e.target.value)}
              className="select min-w-0 py-1 text-[11px] bg-white border-slate-200"
              aria-label="Filter by campaign"
            >
              <option value="">All Campaigns</option>
              {(campaignsQuery.data ?? []).map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <select
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
              className="select min-w-0 py-1 text-[11px] bg-white border-slate-200"
              aria-label="Filter by branch"
            >
              <option value="">All branches</option>
              {BRANCH_OPTIONS.map((branch) => (
                <option key={branch} value={branch}>{branch}</option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as LeadStatus | '')}
              className="select min-w-0 py-1 text-[11px] bg-white border-slate-200"
              aria-label="Filter by status"
            >
              <option value="">All Statuses</option>
              {ALL_LEAD_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as LeadSort)}
              className="select min-w-0 py-1 text-[11px] bg-white border-slate-200"
              aria-label="Sort chats"
            >
              {LEAD_SORT_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {convsQuery.isLoading ? (
            <div className="flex justify-center py-12"><Spinner size="md" /></div>
          ) : convsQuery.error ? (
            <ErrorState message={(convsQuery.error as Error).message} onRetry={convsQuery.refetch} />
          ) : (convsQuery.data ?? []).length === 0 ? (
            <EmptyState title="No active chats" description="Inbound Wati replies will appear here." />
          ) : (
            (convsQuery.data ?? []).map((conv) => {
              const isSelected = selectedId === conv.lead_id;
              return (
                <button
                  key={conv.lead_id}
                  onClick={() => setSelectedId(conv.lead_id)}
                  className={`w-full flex items-center gap-3.5 px-4 py-3.5 text-left transition-all duration-150 relative ${
                    isSelected
                      ? 'bg-indigo-50/70 border-l-4 border-indigo-600'
                      : 'hover:bg-slate-50 border-l-4 border-transparent'
                  }`}
                >
                  <div className={`w-11 h-11 rounded-full flex items-center justify-center text-xs font-bold shrink-0 shadow-sm ${
                    conv.unread
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-100 text-slate-700 border border-slate-200'
                  }`}>
                    {getInitials(conv.full_name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-0.5 gap-2">
                      <span className={`text-sm truncate min-w-0 ${conv.unread ? 'font-bold text-slate-900' : 'font-semibold text-slate-800'}`}>
                        {conv.full_name}
                      </span>
                      <StatusBadge status={conv.status} compact />
                    </div>
                    <div className="flex justify-between items-baseline gap-2">
                      <p className="text-[11px] font-mono text-slate-400 truncate">
                        {conv.phone}{conv.branch ? ` · ${conv.branch}` : ''}
                      </p>
                      <span className="text-[11px] text-slate-400 shrink-0 font-medium">
                        {formatDistanceToNow(new Date(conv.last_activity_at), { addSuffix: false })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 truncate leading-relaxed">
                      {conv.last_message_preview}
                    </p>
                  </div>
                  {conv.unread && (
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0 shadow-sm" />
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Right Panel (65% width): Active Chat Container */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#E5DDD5]/20 relative">
        {!selectedId ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 select-none bg-white">
            <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center mb-4 text-emerald-600 shadow-md border border-emerald-100">
              <MessageSquare size={36} />
            </div>
            <h2 className="text-lg font-bold text-slate-900 mb-1">Jarvis AI Wati Inbox</h2>
            <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
              Select a conversation to inspect Wati chat history, send a manual reply, or toggle Jarvis AI mode.
            </p>
          </div>
        ) : (
          <LeadChatThread leadId={selectedId} />
        )}
      </div>
    </div>
  );
}
