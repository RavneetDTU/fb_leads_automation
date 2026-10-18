import { useEffect, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Bot, CheckCheck, Send, UserCheck } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { ApiError, apiUrl, get, patch, post } from '../../lib/api';
import type { Campaign, ConversationListItem, LeadDetail, Message, WatiTemplate } from '../../types';
import { OldLeadBadge, StatusBadge } from '../ui/Badge';
import { EmptyState, ErrorState } from '../ui/States';
import { Modal } from '../ui/Modal';
import { Spinner } from '../ui/Spinner';
import { Toggle } from '../ui/Toggle';
import { ChatImage } from './ChatImage';
import { MessageBody } from './MessageBody';
import { TemplateChrome } from './TemplateChrome';
import { TemplateSetDropdown } from './TemplateSetDropdown';

const POLL_MS = 10_000;

function leadMedia(msg: Message): { kind: string; file: string } | null {
  const media = msg.template_params?.media;
  if (!media || typeof media !== 'object') return null;
  const kind = String((media as { kind?: unknown }).kind || '');
  const file = String((media as { file?: unknown }).file || '');
  if (!file.startsWith('data/')) return null;
  return { kind, file };
}

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

interface LeadChatThreadProps {
  leadId: string;
  showIdentity?: boolean;
}

export function LeadChatThread({ leadId, showIdentity = true }: LeadChatThreadProps) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [message, setMessage] = useState('');
  const [aiConflictModal, setAiConflictModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const leadQuery = useQuery<LeadDetail>({
    queryKey: ['lead', leadId],
    queryFn: () => get<LeadDetail>(`/api/leads/${leadId}`),
  });

  const campaignsQuery = useQuery<Campaign[]>({
    queryKey: ['campaigns'],
    queryFn: () => get<Campaign[]>('/api/campaigns?limit=100'),
  });

  const lead = leadQuery.data;
  const selectedCampaign =
    (campaignsQuery.data ?? []).find((c) => c.id === lead?.campaign_id) ?? null;
  const campaignTemplateSet = selectedCampaign?.template_set ?? [];
  const templateCampaignId = selectedCampaign?.id || lead?.campaign_id || null;
  const isOldLead = Boolean(lead?.is_old_lead);
  const aiMode = isOldLead ? false : Boolean(lead?.ai_mode);

  const templateCatalogQuery = useQuery<WatiTemplate[]>({
    queryKey: ['templates', templateCampaignId],
    queryFn: () => get<WatiTemplate[]>(`/api/campaigns/${templateCampaignId}/available-templates`),
    enabled: !!templateCampaignId,
    staleTime: 60_000,
  });
  const templatesByName = new Map((templateCatalogQuery.data ?? []).map((item) => [item.name, item]));

  const messagesQuery = useQuery<Message[]>({
    queryKey: ['conv-messages', leadId],
    queryFn: () => get<Message[]>(`/api/inbox/conversations/${leadId}/messages`),
    refetchInterval: POLL_MS,
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messagesQuery.data]);

  useEffect(() => {
    setMessage('');
    setAiConflictModal(false);
  }, [leadId]);

  useEffect(() => {
    if (!aiConflictModal) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key !== 'Escape') return;
      e.preventDefault();
      e.stopImmediatePropagation();
      setAiConflictModal(false);
    }
    document.addEventListener('keydown', handleKey, true);
    return () => document.removeEventListener('keydown', handleKey, true);
  }, [aiConflictModal]);

  const aiToggleMutation = useMutation({
    mutationFn: ({ ai_mode }: { ai_mode: boolean }) =>
      patch(`/api/leads/${leadId}`, { ai_mode }),
    onMutate: async ({ ai_mode }) => {
      await qc.cancelQueries({ queryKey: ['lead', leadId] });
      await qc.cancelQueries({ queryKey: ['conversations'] });
      await qc.cancelQueries({ queryKey: ['leads'] });
      const prevLead = qc.getQueryData<LeadDetail>(['lead', leadId]);
      qc.setQueryData<LeadDetail>(['lead', leadId], (old) => (old ? { ...old, ai_mode } : old));
      qc.setQueriesData<ConversationListItem[]>({ queryKey: ['conversations'] }, (old) =>
        old?.map((c) => (c.lead_id === leadId ? { ...c, ai_mode } : c)),
      );
      return { prevLead };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prevLead) qc.setQueryData(['lead', leadId], ctx.prevLead);
      toast('error', 'Failed to toggle AI mode.');
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['lead', leadId] });
      qc.invalidateQueries({ queryKey: ['conversations'] });
      qc.invalidateQueries({ queryKey: ['leads'] });
    },
  });

  const sendMutation = useMutation({
    mutationFn: (body: string) =>
      post<Message>(`/api/inbox/conversations/${leadId}/messages`, { body }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['conv-messages', leadId] });
      qc.invalidateQueries({ queryKey: ['conversations'] });
      qc.invalidateQueries({ queryKey: ['leads'] });
      setMessage('');
    },
    onError: (err: Error) => {
      if (err instanceof ApiError && err.status === 409) {
        setAiConflictModal(true);
      } else {
        toast('error', `Failed to send: ${err.message}`);
      }
    },
  });

  const sendTemplateMutation = useMutation({
    mutationFn: (templateName: string) =>
      post<Message>(`/api/inbox/conversations/${leadId}/templates`, {
        template_name: templateName,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['conv-messages', leadId] });
      qc.invalidateQueries({ queryKey: ['conversations'] });
      qc.invalidateQueries({ queryKey: ['leads'] });
      toast('success', 'Template sent.');
    },
    onError: (err: Error) => {
      toast('error', `Failed to send template: ${err.message}`);
    },
  });

  function handleSend() {
    if (!message.trim() || aiMode || isOldLead) return;
    sendMutation.mutate(message.trim());
  }

  const composerLocked = aiMode || isOldLead;

  return (
    <div className="flex flex-col flex-1 h-full min-h-0 bg-[#E5DDD5]/20">
      <div className="flex items-center justify-between gap-3 px-4 py-3 bg-white border-b border-slate-200 shadow-sm z-10 shrink-0">
        {showIdentity ? (
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-xs font-bold text-indigo-700 border border-indigo-200 shadow-sm shrink-0">
              {lead ? getInitials(lead.full_name) : '?'}
            </div>
            <div className="min-w-0">
              <p className="font-bold text-slate-900 text-sm leading-tight truncate">
                {lead?.full_name ?? 'Loading…'}
              </p>
              <p className="text-xs font-mono text-slate-500 mt-0.5 truncate">{lead?.phone ?? ''}</p>
              <p className="text-[11px] text-indigo-600 font-medium mt-0.5 truncate">
                {lead?.campaign_name ?? selectedCampaign?.name ?? 'No campaign'}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex-1 min-w-0" />
        )}
        <div className="flex items-center gap-3 shrink-0">
          {showIdentity && <StatusBadge status={lead?.status ?? 'NEW'} />}
          {isOldLead && <OldLeadBadge reason={lead?.old_lead_reason} />}
          <TemplateSetDropdown
            templates={campaignTemplateSet}
            campaignId={templateCampaignId}
            leadName={lead?.full_name ?? ''}
            disabled={isOldLead || campaignTemplateSet.length === 0}
            disabledReason={
              isOldLead
                ? 'Outbound messaging is disabled for old leads'
                : 'No campaign templates'
            }
            sending={sendTemplateMutation.isPending}
            onSend={(name) => sendTemplateMutation.mutate(name)}
          />
          <div className="flex items-center gap-2 pl-3 border-l border-slate-200">
            <Bot size={18} className={aiMode ? 'text-indigo-600' : 'text-slate-400'} />
            <span className="text-xs font-semibold text-slate-700">Jarvis AI Mode</span>
            <Toggle
              enabled={aiMode}
              onChange={(val) => {
                if (!isOldLead) {
                  aiToggleMutation.mutate({ ai_mode: val });
                }
              }}
              disabled={isOldLead || !lead}
              size="sm"
              color="indigo"
              label="Switch AI mode"
            />
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto p-6 space-y-4 bg-[#F0F2F5]/80">
        {messagesQuery.isLoading ? (
          <div className="flex justify-center py-12"><Spinner size="md" /></div>
        ) : messagesQuery.error ? (
          <ErrorState message={(messagesQuery.error as Error).message} onRetry={messagesQuery.refetch} />
        ) : (messagesQuery.data ?? []).length === 0 ? (
          <EmptyState title="No messages yet" description="Conversation history will appear here." />
        ) : (
          (messagesQuery.data ?? []).map((msg) => {
            const isOut = msg.direction === 'outbound';
            const isAi = msg.sender === 'ai';
            const isHuman = msg.sender === 'human';
            const isTemplate = Boolean(msg.template_name);
            const templateCard = msg.template_name ? templatesByName.get(msg.template_name) : undefined;
            const media = leadMedia(msg);
            const showText = Boolean(msg.body) && msg.body !== '[non-text message]';
            const delivered = ['delivered', 'read', 'replied'].includes(
              (msg.delivery_status || '').toLowerCase(),
            );
            return (
              <div key={msg.id} className={`flex min-w-0 ${isOut ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[65%] min-w-0 flex flex-col ${isOut ? 'items-end' : 'items-start'}`}>
                  <div className="flex items-center gap-1.5 mb-1 px-1">
                    {isAi ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800 font-bold text-[10px]">
                        <Bot size={11} /> Jarvis AI
                      </span>
                    ) : isTemplate && isOut ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold text-[10px]">
                        Template
                      </span>
                    ) : isHuman && isOut ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-semibold text-[10px]">
                        <UserCheck size={11} /> Human Agent
                      </span>
                    ) : isOut ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold text-[10px]">
                        Template
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-500 font-medium">Lead</span>
                    )}
                  </div>

                  <div
                    className={`relative max-w-full min-w-0 overflow-hidden px-4 py-2.5 text-sm leading-relaxed shadow-sm transition-all ${
                      isOut
                        ? 'bg-[#DCF8C6] text-slate-900 rounded-2xl rounded-tr-xs border border-[#C5E8AC]'
                        : 'bg-white text-slate-900 rounded-2xl rounded-tl-xs border border-slate-200/80'
                    }`}
                  >
                    <TemplateChrome template={templateCard} part="header" />
                    {(media?.kind === 'image' || media?.kind === 'sticker') && (
                      <ChatImage
                        src={apiUrl(`/api/inbox/message-media?file=${encodeURIComponent(media.file)}`)}
                        className="w-full max-h-72 object-cover bg-slate-100"
                      />
                    )}
                    {showText && <MessageBody text={msg.body} />}
                    <TemplateChrome template={templateCard} part="footer" />

                    <div className="flex items-center justify-end gap-1 text-[10px] mt-1 text-slate-500 select-none">
                      <span>{format(new Date(msg.created_at), 'MMM d, yyyy HH:mm')}</span>
                      {isOut && (
                        <CheckCheck
                          size={14}
                          className={`inline ${delivered ? 'text-emerald-600' : 'text-slate-400'}`}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white border-t border-slate-200 shadow-sm shrink-0">
        {isOldLead ? (
          <div className="mb-2 px-3.5 py-2 rounded-lg bg-amber-50 border border-amber-300 text-xs text-amber-900 font-medium flex items-center gap-2">
            <span>Outbound WhatsApp messaging is disabled for historical/backfilled leads.</span>
          </div>
        ) : aiMode ? (
          <div className="mb-2 px-3 py-1.5 rounded-lg bg-indigo-50 border border-indigo-200 text-xs text-indigo-800 flex items-center gap-1.5">
            <Bot size={14} className="text-indigo-600 shrink-0" />
            <span>Jarvis AI mode is active. Turn off AI mode in the header to send manual agent messages.</span>
          </div>
        ) : null}
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder={isOldLead ? 'Outbound messaging disabled for old leads' : 'Type a WhatsApp message…'}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            disabled={composerLocked}
            className="input flex-1 rounded-full px-5 py-2.5 bg-slate-50 border-slate-200 focus:bg-white text-sm disabled:bg-slate-100 disabled:cursor-not-allowed"
          />
          <button
            onClick={handleSend}
            disabled={!message.trim() || sendMutation.isPending || composerLocked}
            className="w-10 h-10 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center shrink-0 transition-all duration-150 disabled:bg-slate-200 disabled:cursor-not-allowed shadow-sm"
            aria-label="Send message"
          >
            {sendMutation.isPending ? <Spinner size="sm" /> : <Send size={16} />}
          </button>
        </div>
      </div>

      <Modal
        open={aiConflictModal}
        onClose={() => setAiConflictModal(false)}
        title="Jarvis AI Active"
        subtitle="Manual override required"
        maxWidth="sm"
        lockScroll={false}
        footer={
          <button onClick={() => setAiConflictModal(false)} className="btn-primary">Understood</button>
        }
      >
        <div className="flex items-start gap-3 p-1">
          <Bot size={24} className="text-indigo-600 shrink-0 mt-0.5" />
          <div className="text-sm text-slate-700 leading-relaxed">
            <p>
              Jarvis AI is actively automating replies for this lead.
            </p>
            <p className="mt-1.5 text-xs text-slate-500">
              Please turn off <strong>Jarvis AI Mode</strong> in the top chat header to take over manually.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}
