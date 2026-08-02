import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { get, patch, post } from '../../lib/api';
import type { LeadDetail, Note, Message, LeadUpdate } from '../../types';
import { Modal } from '../ui/Modal';

import { Spinner, Skeleton } from '../ui/Spinner';
import { ErrorState, EmptyState } from '../ui/States';

const ALL_STATUSES = ['NEW', 'TEMPLATE_SENT', 'UNREAD', 'WAITING_FOR_REPLY', 'BOOKED', 'HANDED_OFF'] as const;

interface LeadModalProps {
  leadId: string;
  open: boolean;
  onClose: () => void;
}

export function LeadModal({ leadId, open, onClose }: LeadModalProps) {
  const [tab, setTab] = useState<'info' | 'notes' | 'whatsapp'>('info');

  return (
    <Modal open={open} onClose={onClose} title="Edit Lead" subtitle="Update lead details" maxWidth="2xl">
      {/* Tabs */}
      <div className="flex border-b border-slate-200 -mx-6 px-6 mb-4">
        {(['info', 'notes', 'whatsapp'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              tab === t
                ? 'border-brand-500 text-brand-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {{ info: 'Basic Info', notes: 'Notes', whatsapp: 'WhatsApp' }[t]}
          </button>
        ))}
      </div>

      {tab === 'info' && <BasicInfoTab leadId={leadId} />}
      {tab === 'notes' && <NotesTab leadId={leadId} />}
      {tab === 'whatsapp' && <WhatsAppTab leadId={leadId} />}
    </Modal>
  );
}

// ── Tab 1: Basic Info ────────────────────────────────────────────────────────

function BasicInfoTab({ leadId }: { leadId: string }) {
  const { token } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [showResubs, setShowResubs] = useState(false);

  const { data, isLoading, error, refetch } = useQuery<LeadDetail>({
    queryKey: ['lead', leadId],
    queryFn: () => get<LeadDetail>(`/api/leads/${leadId}`, token!),
    enabled: !!token,
  });

  const [edits, setEdits] = useState<LeadUpdate>({});
  const [dirty, setDirty] = useState(false);

  const mutation = useMutation({
    mutationFn: (payload: LeadUpdate) =>
      patch<LeadDetail>(`/api/leads/${leadId}`, token!, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['lead', leadId] });
      qc.invalidateQueries({ queryKey: ['leads'] });
      toast('success', 'Lead updated.');
      setDirty(false);
      setEdits({});
    },
    onError: (err: Error) => toast('error', `Failed to update: ${err.message}`),
  });

  function setField<K extends keyof LeadUpdate>(key: K, val: LeadUpdate[K]) {
    setEdits((prev) => ({ ...prev, [key]: val }));
    setDirty(true);
  }

  if (isLoading) return <div className="flex justify-center py-10"><Spinner size="md" /></div>;
  if (error) return <ErrorState message={(error as Error).message} onRetry={refetch} />;
  if (!data) return null;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Full Name</label>
          <input
            className="input"
            value={edits.full_name ?? data.full_name}
            onChange={(e) => setField('full_name', e.target.value)}
          />
        </div>
        <div>
          <label className="label">Phone</label>
          <input className="input bg-slate-50 cursor-default" value={data.phone} readOnly />
        </div>
        <div>
          <label className="label">Email</label>
          <input
            className="input"
            type="email"
            value={edits.email ?? (data.email ?? '')}
            onChange={(e) => setField('email', e.target.value || null)}
          />
        </div>
        <div>
          <label className="label">Campaign</label>
          <input className="input bg-slate-50 cursor-default" value={data.campaign_name ?? '—'} readOnly />
        </div>
        <div>
          <label className="label">Status</label>
          <select
            className="select"
            value={edits.status ?? data.status}
            onChange={(e) => setField('status', e.target.value as LeadDetail['status'])}
          >
            {ALL_STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Created</label>
          <input className="input bg-slate-50 cursor-default" value={format(new Date(data.created_at), 'MMM d, yyyy HH:mm')} readOnly />
        </div>
      </div>

      {/* Meta form fields */}
      {Object.keys(data.meta_form_fields).length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Form Responses</h3>
          <div className="bg-slate-50 rounded-xl border border-slate-200 divide-y divide-slate-200">
            {Object.entries(data.meta_form_fields).map(([key, val]) => (
              <div key={key} className="flex gap-3 px-4 py-2.5">
                <span className="text-xs text-slate-400 capitalize min-w-[120px] shrink-0">{key.replace(/_/g, ' ')}</span>
                <span className="text-xs text-slate-700 font-medium">{String(val)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Resubmission history */}
      {data.resubmission_history.length > 0 && (
        <div>
          <button
            onClick={() => setShowResubs((s) => !s)}
            className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider hover:text-slate-700"
          >
            {showResubs ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            Resubmission History ({data.resubmission_history.length})
          </button>
          {showResubs && (
            <div className="mt-2 space-y-2">
              {data.resubmission_history.map((r) => (
                <div key={r.id} className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <div className="flex justify-between text-xs text-slate-600 mb-1">
                    <span className="font-medium">{r.meta_ad_name ?? 'Unknown Ad'}</span>
                    <span className="text-slate-400">{format(new Date(r.created_at), 'MMM d, yyyy HH:mm')}</span>
                  </div>
                  {Object.entries(r.meta_form_fields).map(([k, v]) => (
                    <div key={k} className="text-xs text-slate-500">
                      <span className="capitalize">{k.replace(/_/g, ' ')}</span>: <span className="text-slate-700">{String(v)}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Save */}
      {dirty && (
        <div className="flex justify-end pt-2">
          <button
            onClick={() => mutation.mutate(edits)}
            disabled={mutation.isPending}
            className="btn-primary"
          >
            {mutation.isPending ? <Spinner size="sm" /> : null}
            Save Changes
          </button>
        </div>
      )}
    </div>
  );
}

// ── Tab 2: Notes ─────────────────────────────────────────────────────────────

function NotesTab({ leadId }: { leadId: string }) {
  const { token } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [author, setAuthor] = useState('');
  const [body, setBody] = useState('');

  const { data: notes, isLoading, error, refetch } = useQuery<Note[]>({
    queryKey: ['notes', leadId],
    queryFn: () => get<Note[]>(`/api/leads/${leadId}/notes`, token!),
    enabled: !!token,
  });

  const mutation = useMutation({
    mutationFn: () => post<Note>(`/api/leads/${leadId}/notes`, token!, { author, body }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notes', leadId] });
      setBody('');
      toast('success', 'Note saved.');
    },
    onError: (err: Error) => toast('error', `Failed to save note: ${err.message}`),
  });

  return (
    <div className="space-y-4">
      {/* Add note */}
      <div className="space-y-2">
        <input
          className="input"
          placeholder="Your name / email"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
        />
        <textarea
          className="input resize-none h-24"
          placeholder="Add a note…"
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
        <div className="flex justify-end">
          <button
            onClick={() => mutation.mutate()}
            disabled={!author.trim() || !body.trim() || mutation.isPending}
            className="btn-primary"
          >
            {mutation.isPending ? <Spinner size="sm" /> : null}
            Save Note
          </button>
        </div>
      </div>

      {/* Notes list */}
      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}</div>
      ) : error ? (
        <ErrorState message={(error as Error).message} onRetry={refetch} />
      ) : (notes ?? []).length === 0 ? (
        <EmptyState title="No notes yet" description="Add the first note above." />
      ) : (
        <div className="space-y-3">
          {[...(notes ?? [])].reverse().map((note) => (
            <div key={note.id} className="bg-slate-50 border border-slate-200 rounded-lg p-3">
              <div className="flex justify-between mb-1">
                <span className="text-xs font-medium text-slate-600">{note.author}</span>
                <span className="text-xs text-slate-400">{format(new Date(note.created_at), 'MMM d, yyyy HH:mm')}</span>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed">{note.body}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Tab 3: WhatsApp ───────────────────────────────────────────────────────────

const senderLabel: Record<string, string> = {
  lead: 'Lead',
  ai: 'AI',
  human: 'Agent',
  system: 'System',
};

const senderColor: Record<string, string> = {
  lead: 'text-slate-400',
  ai: 'text-indigo-400',
  human: 'text-brand-600',
  system: 'text-amber-500',
};

function WhatsAppTab({ leadId }: { leadId: string }) {
  const { token } = useAuth();

  const { data: messages, isLoading, error, refetch } = useQuery<Message[]>({
    queryKey: ['messages', leadId],
    queryFn: () => get<Message[]>(`/api/leads/${leadId}/messages`, token!),
    enabled: !!token,
  });

  if (isLoading) return <div className="flex justify-center py-10"><Spinner size="md" /></div>;
  if (error) return <ErrorState message={(error as Error).message} onRetry={refetch} />;
  if (!messages || messages.length === 0) {
    return <EmptyState title="No messages yet" description="WhatsApp messages will appear here." />;
  }

  return (
    <div className="space-y-3 max-h-96 overflow-y-auto py-2 pr-1">
      {messages.map((msg) => {
        const isOutbound = msg.direction === 'outbound';
        return (
          <div key={msg.id} className={`flex ${isOutbound ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[75%] ${isOutbound ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
              <span className={`text-xs ${senderColor[msg.sender]} font-medium`}>
                {senderLabel[msg.sender] ?? msg.sender}
              </span>
              <div
                className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  isOutbound
                    ? 'bg-brand-500 text-white rounded-tr-sm'
                    : 'bg-slate-100 text-slate-800 rounded-tl-sm'
                }`}
              >
                {msg.body}
              </div>
              <span className="text-xs text-slate-400">
                {format(new Date(msg.created_at), 'HH:mm')}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
