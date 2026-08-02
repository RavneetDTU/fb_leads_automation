import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, formatDistanceToNow } from 'date-fns';
import { Search, Send, MessageSquare, Bot, CheckCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { get, post, patch } from '../lib/api';
import type { ConversationListItem, Message } from '../types';
import { StatusBadge } from '../components/ui/Badge';
import { Toggle } from '../components/ui/Toggle';
import { Spinner } from '../components/ui/Spinner';
import { ErrorState, EmptyState } from '../components/ui/States';
import { Modal } from '../components/ui/Modal';
import { ApiError } from '../lib/api';

const POLL_MS = 10_000;

const senderLabel: Record<string, string> = { lead: 'Lead', ai: 'AI Assistant', human: 'Agent', system: 'System' };
const senderBadgeColor: Record<string, string> = {
  lead: 'text-slate-500 font-medium',
  ai: 'text-emerald-700 font-semibold',
  human: 'text-emerald-800 font-semibold',
  system: 'text-amber-600 font-medium',
};

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
  const { token } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [aiConflictModal, setAiConflictModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const convsQuery = useQuery<ConversationListItem[]>({
    queryKey: ['conversations', search],
    queryFn: () =>
      get<ConversationListItem[]>(
        `/api/inbox/conversations?limit=50${search ? `&search=${encodeURIComponent(search)}` : ''}`,
        token!,
      ),
    enabled: !!token,
    refetchInterval: POLL_MS,
  });

  const selectedConv = convsQuery.data?.find((c) => c.lead_id === selectedId);

  const messagesQuery = useQuery<Message[]>({
    queryKey: ['conv-messages', selectedId],
    queryFn: () =>
      get<Message[]>(`/api/inbox/conversations/${selectedId}/messages`, token!),
    enabled: !!token && !!selectedId,
    refetchInterval: POLL_MS,
  });

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messagesQuery.data]);

  const aiToggleMutation = useMutation({
    mutationFn: ({ ai_mode }: { ai_mode: boolean }) =>
      patch(`/api/leads/${selectedId}`, token!, { ai_mode }),
    onMutate: async ({ ai_mode }) => {
      await qc.cancelQueries({ queryKey: ['conversations'] });
      const prev = qc.getQueryData<ConversationListItem[]>(['conversations', search]);
      qc.setQueryData<ConversationListItem[]>(['conversations', search], (old) =>
        old?.map((c) => (c.lead_id === selectedId ? { ...c, ai_mode } : c)),
      );
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(['conversations', search], ctx.prev);
      toast('error', 'Failed to toggle AI mode.');
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ['conversations'] }),
  });

  const sendMutation = useMutation({
    mutationFn: (body: string) =>
      post<Message>(`/api/inbox/conversations/${selectedId}/messages`, token!, { body }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['conv-messages', selectedId] });
      qc.invalidateQueries({ queryKey: ['conversations'] });
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

  function handleSend() {
    if (!message.trim() || !selectedId) return;
    sendMutation.mutate(message.trim());
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Left panel — conversation list */}
      <div className="w-80 shrink-0 flex flex-col border-r border-slate-200/80 bg-white">
        {/* Search Header */}
        <div className="p-3.5 border-b border-slate-100 bg-white">
          <div className="relative">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              placeholder="Search contacts…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-9 pr-3 py-2 text-xs rounded-full bg-slate-100/70 border-transparent focus:bg-white focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100/60">
          {convsQuery.isLoading ? (
            <div className="flex justify-center py-12"><Spinner size="md" /></div>
          ) : convsQuery.error ? (
            <ErrorState message={(convsQuery.error as Error).message} onRetry={convsQuery.refetch} />
          ) : (convsQuery.data ?? []).length === 0 ? (
            <EmptyState title="No conversations" description="No contacts found." />
          ) : (
            (convsQuery.data ?? []).map((conv) => {
              const isSelected = selectedId === conv.lead_id;
              return (
                <button
                  key={conv.lead_id}
                  onClick={() => setSelectedId(conv.lead_id)}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-all duration-150 relative ${
                    isSelected
                      ? 'bg-emerald-50/60 border-l-4 border-emerald-600'
                      : 'hover:bg-slate-50 border-l-4 border-transparent'
                  }`}
                >
                  {/* Avatar */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 shadow-apple-sm ${
                    conv.unread
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-200 text-slate-700'
                  }`}>
                    {getInitials(conv.full_name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-0.5">
                      <span className={`text-sm truncate ${conv.unread ? 'font-semibold text-slate-900' : 'font-medium text-slate-800'}`}>
                        {conv.full_name}
                      </span>
                      <span className="text-[11px] text-slate-400 shrink-0 ml-1 font-normal">
                        {formatDistanceToNow(new Date(conv.last_activity_at), { addSuffix: false })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 truncate leading-relaxed">
                      {conv.last_message_preview ?? conv.phone}
                    </p>
                  </div>
                  {conv.unread && (
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 shrink-0 shadow-apple-sm" />
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Right panel — Thread & details */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#F8FAFC]">
        {!selectedId ? (
          /* Empty thread placeholder */
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4 text-emerald-600 shadow-apple-sm">
              <MessageSquare size={30} />
            </div>
            <h2 className="text-base font-semibold text-slate-800 mb-1">WhatsApp Conversations</h2>
            <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
              Select a contact from the left sidebar to view interaction logs, inspect lead details, and respond.
            </p>
          </div>
        ) : (
          <>
            {/* Conversation Header */}
            <div className="flex items-center justify-between px-6 py-3.5 bg-white border-b border-slate-200/80 shadow-apple-sm z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-xs font-semibold text-slate-700 border border-slate-200/60 shadow-apple-sm">
                  {selectedConv ? getInitials(selectedConv.full_name) : '?'}
                </div>
                <div>
                  <p className="font-semibold text-slate-900 text-sm leading-tight">{selectedConv?.full_name}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{selectedConv?.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <StatusBadge status={selectedConv?.status ?? 'NEW'} />
                <div className="flex items-center gap-2 pl-3 border-l border-slate-200">
                  <Bot size={16} className={selectedConv?.ai_mode ? 'text-emerald-600' : 'text-slate-400'} />
                  <span className="text-xs font-medium text-slate-600">AI Mode</span>
                  <Toggle
                    enabled={selectedConv?.ai_mode ?? false}
                    onChange={(val) => aiToggleMutation.mutate({ ai_mode: val })}
                    size="sm"
                    label="Switch AI mode"
                  />
                </div>
              </div>
            </div>

            {/* Message Thread */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#F8FAFC]">
              {messagesQuery.isLoading ? (
                <div className="flex justify-center py-12"><Spinner size="md" /></div>
              ) : messagesQuery.error ? (
                <ErrorState message={(messagesQuery.error as Error).message} onRetry={messagesQuery.refetch} />
              ) : (messagesQuery.data ?? []).length === 0 ? (
                <EmptyState title="No messages yet" description="The conversation history will appear here." />
              ) : (
                (messagesQuery.data ?? []).map((msg) => {
                  const isOut = msg.direction === 'outbound';
                  return (
                    <div key={msg.id} className={`flex ${isOut ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[65%] flex flex-col ${isOut ? 'items-end' : 'items-start'}`}>
                        {/* Sender Label */}
                        <span className={`text-[11px] mb-1 px-1 ${senderBadgeColor[msg.sender] ?? 'text-slate-500'}`}>
                          {senderLabel[msg.sender] ?? msg.sender}
                        </span>

                        {/* Bubble Container */}
                        <div
                          className={`relative px-4 py-2.5 text-sm leading-relaxed shadow-apple-sm transition-all ${
                            isOut
                              ? 'bg-emerald-100/90 text-slate-900 rounded-2xl rounded-tr-xs border border-emerald-200/60'
                              : 'bg-white text-slate-900 rounded-2xl rounded-tl-xs border border-slate-200/70'
                          }`}
                        >
                          <p className="whitespace-pre-wrap break-words">{msg.body}</p>

                          {/* Metadata row */}
                          <div className={`flex items-center justify-end gap-1 text-[10px] mt-1 select-none ${
                            isOut ? 'text-emerald-800/70' : 'text-slate-400'
                          }`}>
                            <span>{format(new Date(msg.created_at), 'HH:mm')}</span>
                            {isOut && <CheckCheck size={13} className="text-emerald-700 inline" />}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Bottom Input Bar */}
            <div className="p-4 bg-white border-t border-slate-200/80 shadow-apple-sm">
              {selectedConv?.ai_mode && (
                <div className="mb-2 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200/70 text-xs text-amber-700 flex items-center gap-1.5">
                  <Bot size={14} className="text-amber-600 shrink-0" />
                  <span>AI mode is active. Disable AI mode in the header to send manual messages.</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Type a message…"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                  disabled={selectedConv?.ai_mode}
                  className="input flex-1 rounded-full px-4 py-2.5 bg-slate-100/80 border-slate-200 focus:bg-white text-sm"
                />
                <button
                  onClick={handleSend}
                  disabled={!message.trim() || sendMutation.isPending || selectedConv?.ai_mode}
                  className="w-10 h-10 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center shrink-0 transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed shadow-apple-sm"
                  aria-label="Send message"
                >
                  {sendMutation.isPending ? <Spinner size="sm" /> : <Send size={16} />}
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* 409 AI conflict modal */}
      <Modal
        open={aiConflictModal}
        onClose={() => setAiConflictModal(false)}
        title="AI Mode Active"
        subtitle="Manual messaging unavailable"
        maxWidth="sm"
        footer={
          <button onClick={() => setAiConflictModal(false)} className="btn-primary">Got it</button>
        }
      >
        <div className="flex items-start gap-3 p-1">
          <Bot size={22} className="text-amber-500 shrink-0 mt-0.5" />
          <div className="text-sm text-slate-700 leading-relaxed">
            <p>
              AI mode is currently enabled for this conversation.
            </p>
            <p className="mt-1.5 text-xs text-slate-500">
              Please toggle off <strong>AI Mode</strong> in the header bar before taking over manually.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}
