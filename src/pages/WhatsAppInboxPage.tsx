import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, formatDistanceToNow } from 'date-fns';
import { Search, Send, MessageSquare, Bot } from 'lucide-react';
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

const senderLabel: Record<string, string> = { lead: 'Lead', ai: 'AI', human: 'Agent', system: 'System' };
const senderColor: Record<string, string> = {
  lead: 'text-slate-400',
  ai: 'text-indigo-400',
  human: 'text-brand-600',
  system: 'text-amber-500',
};

function getInitials(name: string): string {
  return name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();
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
      get<ConversationListItem[]>(`/api/inbox/conversations?limit=50${search ? `&search=${encodeURIComponent(search)}` : ''}`, token!),
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
        old?.map((c) => c.lead_id === selectedId ? { ...c, ai_mode } : c),
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
    <div className="flex h-screen overflow-hidden">
      {/* Left panel — conversation list */}
      <div className="w-80 shrink-0 flex flex-col border-r border-slate-200 bg-white">
        {/* Search */}
        <div className="p-3 border-b border-slate-100">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              placeholder="Search contacts…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-9 text-sm"
            />
          </div>
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto">
          {convsQuery.isLoading ? (
            <div className="flex justify-center py-10"><Spinner size="md" /></div>
          ) : convsQuery.error ? (
            <ErrorState message={(convsQuery.error as Error).message} onRetry={convsQuery.refetch} />
          ) : (convsQuery.data ?? []).length === 0 ? (
            <EmptyState title="No conversations" description="No contacts found." />
          ) : (
            (convsQuery.data ?? []).map((conv) => (
              <button
                key={conv.lead_id}
                onClick={() => setSelectedId(conv.lead_id)}
                className={`w-full flex items-center gap-3 px-4 py-3 border-b border-slate-50 text-left transition-colors ${
                  selectedId === conv.lead_id ? 'bg-brand-50' : 'hover:bg-slate-50'
                }`}
              >
                {/* Avatar */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                  conv.unread ? 'bg-brand-500 text-white' : 'bg-slate-200 text-slate-600'
                }`}>
                  {getInitials(conv.full_name)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <span className={`text-sm truncate ${conv.unread ? 'font-semibold text-slate-800' : 'font-medium text-slate-700'}`}>
                      {conv.full_name}
                    </span>
                    <span className="text-xs text-slate-400 shrink-0 ml-1">
                      {formatDistanceToNow(new Date(conv.last_activity_at), { addSuffix: false })}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 truncate">{conv.last_message_preview ?? conv.phone}</p>
                </div>
                {conv.unread && <span className="w-2 h-2 rounded-full bg-brand-500 shrink-0" />}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-50">
        {!selectedId ? (
          /* Empty state */
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="w-20 h-20 rounded-full bg-brand-500/10 flex items-center justify-center mb-4">
              <MessageSquare size={36} className="text-brand-500" />
            </div>
            <h2 className="text-lg font-semibold text-slate-700 mb-2">WhatsApp for Your Business</h2>
            <p className="text-sm text-slate-400 max-w-xs">
              Select a contact from the sidebar to view the conversation history and manage your leads.
            </p>
          </div>
        ) : (
          <>
            {/* Conversation header */}
            <div className="flex items-center justify-between px-5 py-3.5 bg-white border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-sm font-bold text-slate-600">
                  {selectedConv ? getInitials(selectedConv.full_name) : '?'}
                </div>
                <div>
                  <p className="font-semibold text-slate-800 text-sm">{selectedConv?.full_name}</p>
                  <p className="text-xs text-slate-400">{selectedConv?.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={selectedConv?.status ?? 'NEW'} />
                <div className="flex items-center gap-2">
                  <Bot size={15} className={selectedConv?.ai_mode ? 'text-brand-500' : 'text-slate-400'} />
                  <span className="text-xs text-slate-500">AI</span>
                  <Toggle
                    enabled={selectedConv?.ai_mode ?? false}
                    onChange={(val) => aiToggleMutation.mutate({ ai_mode: val })}
                    size="sm"
                    label="Switch AI mode"
                  />
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messagesQuery.isLoading ? (
                <div className="flex justify-center py-10"><Spinner size="md" /></div>
              ) : messagesQuery.error ? (
                <ErrorState message={(messagesQuery.error as Error).message} onRetry={messagesQuery.refetch} />
              ) : (messagesQuery.data ?? []).length === 0 ? (
                <EmptyState title="No messages yet" description="The conversation will appear here." />
              ) : (
                (messagesQuery.data ?? []).map((msg) => {
                  const isOut = msg.direction === 'outbound';
                  return (
                    <div key={msg.id} className={`flex ${isOut ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[68%] flex flex-col gap-0.5 ${isOut ? 'items-end' : 'items-start'}`}>
                        <span className={`text-xs font-medium ${senderColor[msg.sender]}`}>
                          {senderLabel[msg.sender] ?? msg.sender}
                        </span>
                        <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                          isOut
                            ? 'bg-brand-500 text-white rounded-tr-sm'
                            : 'bg-white text-slate-800 rounded-tl-sm shadow-sm border border-slate-100'
                        }`}>
                          {msg.body}
                        </div>
                        <span className="text-xs text-slate-400">
                          {format(new Date(msg.created_at), 'HH:mm')}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="px-4 py-3 bg-white border-t border-slate-200">
              {selectedConv?.ai_mode && (
                <p className="text-xs text-amber-600 mb-2 flex items-center gap-1">
                  <Bot size={12} />
                  AI mode is on — disable it above to type manually.
                </p>
              )}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type a message…"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                  disabled={selectedConv?.ai_mode}
                  className="input flex-1"
                />
                <button
                  onClick={handleSend}
                  disabled={!message.trim() || sendMutation.isPending || selectedConv?.ai_mode}
                  className="btn-primary px-3"
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
        <div className="flex items-start gap-3">
          <Bot size={24} className="text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-slate-700 leading-relaxed">
              AI mode is currently enabled for this conversation.
            </p>
            <p className="text-sm text-slate-700 mt-1">
              <strong>Disable AI mode</strong> using the toggle in the conversation header before sending a manual message.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}
