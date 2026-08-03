import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, formatDistanceToNow } from 'date-fns';
import { Search, Send, MessageSquare, Bot, CheckCheck, UserCheck, PhoneCall, Video, MoreVertical } from 'lucide-react';
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
    <div className="flex h-screen overflow-hidden bg-slate-100">
      {/* Left Panel (35% width): Contact List */}
      <div className="w-[35%] min-w-[320px] max-w-[420px] shrink-0 flex flex-col border-r border-slate-200 bg-white shadow-soft">
        {/* Search Header */}
        <div className="p-4 border-b border-slate-200 bg-slate-50/70">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">WhatsApp Chats</h2>
            <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
              🟢 WhatsApp Web Connected
            </span>
          </div>
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              placeholder="Search contacts or chats…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-10 py-2 text-xs rounded-full bg-white border-slate-200 focus:border-indigo-500 shadow-sm"
            />
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {convsQuery.isLoading ? (
            <div className="flex justify-center py-12"><Spinner size="md" /></div>
          ) : convsQuery.error ? (
            <ErrorState message={(convsQuery.error as Error).message} onRetry={convsQuery.refetch} />
          ) : (convsQuery.data ?? []).length === 0 ? (
            <EmptyState title="No active chats" description="Inbound Meta WhatsApp leads will appear here." />
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
                  {/* Avatar */}
                  <div className={`w-11 h-11 rounded-full flex items-center justify-center text-xs font-bold shrink-0 shadow-sm ${
                    conv.unread
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-100 text-slate-700 border border-slate-200'
                  }`}>
                    {getInitials(conv.full_name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <span className={`text-sm truncate ${conv.unread ? 'font-bold text-slate-900' : 'font-semibold text-slate-800'}`}>
                        {conv.full_name}
                      </span>
                      <span className="text-[11px] text-slate-400 shrink-0 ml-1 font-medium">
                        {formatDistanceToNow(new Date(conv.last_activity_at), { addSuffix: false })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 truncate leading-relaxed">
                      {conv.last_message_preview ?? conv.phone}
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
          /* Empty Thread Placeholder */
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 select-none bg-white">
            <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center mb-4 text-emerald-600 shadow-md border border-emerald-100">
              <MessageSquare size={36} />
            </div>
            <h2 className="text-lg font-bold text-slate-900 mb-1">Jarvis AI Native WhatsApp Web Inbox</h2>
            <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
              Select a conversation from the left contact panel to inspect live chat history, manual agent override, or AI bot responses.
            </p>
          </div>
        ) : (
          <>
            {/* Sticky Native Chat Header */}
            <div className="flex items-center justify-between px-6 py-3.5 bg-white border-b border-slate-200 shadow-sm z-10">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-xs font-bold text-indigo-700 border border-indigo-200 shadow-sm">
                  {selectedConv ? getInitials(selectedConv.full_name) : '?'}
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-sm leading-tight">{selectedConv?.full_name}</p>
                  <p className="text-xs font-mono text-slate-500 mt-0.5">{selectedConv?.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <StatusBadge status={selectedConv?.status ?? 'NEW'} />
                <div className="flex items-center gap-2 pl-3 border-l border-slate-200">
                  <Bot size={18} className={selectedConv?.ai_mode ? 'text-indigo-600' : 'text-slate-400'} />
                  <span className="text-xs font-semibold text-slate-700">Jarvis AI Mode</span>
                  <Toggle
                    enabled={selectedConv?.ai_mode ?? false}
                    onChange={(val) => aiToggleMutation.mutate({ ai_mode: val })}
                    size="sm"
                    color="indigo"
                    label="Switch AI mode"
                  />
                </div>
                <div className="flex items-center gap-1.5 pl-2 text-slate-400 border-l border-slate-200">
                  <button title="Voice Call" className="p-1.5 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"><PhoneCall size={16} /></button>
                  <button title="Video Call" className="p-1.5 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"><Video size={16} /></button>
                  <button title="More Options" className="p-1.5 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"><MoreVertical size={16} /></button>
                </div>
              </div>
            </div>

            {/* Active Chat Message Wallpaper Container */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#F0F2F5]/80">
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
                  return (
                    <div key={msg.id} className={`flex ${isOut ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[65%] flex flex-col ${isOut ? 'items-end' : 'items-start'}`}>
                        {/* Explicit Bot / Agent Tag */}
                        <div className="flex items-center gap-1.5 mb-1 px-1">
                          {isAi ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800 font-bold text-[10px]">
                              <Bot size={11} /> 🤖 Jarvis AI
                            </span>
                          ) : isOut ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-semibold text-[10px]">
                              <UserCheck size={11} /> Human Agent
                            </span>
                          ) : (
                            <span className="text-[11px] text-slate-500 font-medium">Lead</span>
                          )}
                        </div>

                        {/* WhatsApp Chat Bubbles */}
                        <div
                          className={`relative px-4 py-2.5 text-sm leading-relaxed shadow-sm transition-all ${
                            isOut
                              ? 'bg-[#DCF8C6] text-slate-900 rounded-2xl rounded-tr-xs border border-[#C5E8AC]'
                              : 'bg-white text-slate-900 rounded-2xl rounded-tl-xs border border-slate-200/80'
                          }`}
                        >
                          <p className="whitespace-pre-wrap break-words">{msg.body}</p>

                          {/* Timestamp & Double Checkmarks */}
                          <div className="flex items-center justify-end gap-1 text-[10px] mt-1 text-slate-500 select-none">
                            <span>{format(new Date(msg.created_at), 'HH:mm')}</span>
                            {isOut && <CheckCheck size={14} className="text-emerald-600 inline" />}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Bottom Sticky Input Bar */}
            <div className="p-4 bg-white border-t border-slate-200 shadow-sm">
              {selectedConv?.ai_mode && (
                <div className="mb-2 px-3 py-1.5 rounded-lg bg-indigo-50 border border-indigo-200 text-xs text-indigo-800 flex items-center gap-1.5">
                  <Bot size={14} className="text-indigo-600 shrink-0" />
                  <span>Jarvis AI mode is active. Turn off AI mode in the header to send manual agent messages.</span>
                </div>
              )}
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  placeholder="Type a WhatsApp message…"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                  disabled={selectedConv?.ai_mode}
                  className="input flex-1 rounded-full px-5 py-2.5 bg-slate-50 border-slate-200 focus:bg-white text-sm"
                />
                <button
                  onClick={handleSend}
                  disabled={!message.trim() || sendMutation.isPending || selectedConv?.ai_mode}
                  className="w-10 h-10 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center shrink-0 transition-all duration-150 disabled:bg-slate-200 disabled:cursor-not-allowed shadow-sm"
                  aria-label="Send message"
                >
                  {sendMutation.isPending ? <Spinner size="sm" /> : <Send size={16} />}
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* 409 AI Conflict Modal */}
      <Modal
        open={aiConflictModal}
        onClose={() => setAiConflictModal(false)}
        title="Jarvis AI Active"
        subtitle="Manual override required"
        maxWidth="sm"
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
