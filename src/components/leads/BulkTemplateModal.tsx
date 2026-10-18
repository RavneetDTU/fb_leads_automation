import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertCircle, RefreshCw, Search } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { get, post } from '../../lib/api';
import type { BulkTemplateResponse, LeadListItem, WatiTemplate } from '../../types';
import { TemplateChrome } from '../chat/TemplateChrome';
import { Modal } from '../ui/Modal';
import { Spinner } from '../ui/Spinner';

const BULK_LIMIT = 200;

function firstName(fullName: string): string {
  const trimmed = (fullName || '').trim();
  return trimmed.split(/\s+/)[0] || trimmed;
}

function fillTemplateBody(body: string, fullName: string): string {
  const first = firstName(fullName);
  const whole = (fullName || '').trim() || first;
  const values: Record<string, string> = {
    name: first,
    first_name: first,
    customer_name: whole,
    lead_name: whole,
    full_name: whole,
    '1': first,
  };
  return (body || '').replace(/\{\{\s*([^}]+)\s*\}\}/g, (_match, raw: string) => {
    const key = String(raw).trim();
    if (/^\d+$/.test(key)) return first;
    const lowered = key.toLowerCase().replace(/ /g, '_');
    return values[lowered] || values[key] || first;
  });
}

interface BulkTemplateModalProps {
  open: boolean;
  leads: LeadListItem[];
  onClose: () => void;
  onSent: () => void;
}

export function BulkTemplateModal({ open, leads, onClose, onSent }: BulkTemplateModalProps) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [selectedName, setSelectedName] = useState<string | null>(null);

  const templatesQuery = useQuery<WatiTemplate[]>({
    queryKey: ['wati-templates'],
    queryFn: () => get<WatiTemplate[]>('/api/templates'),
    enabled: open,
  });

  const mutation = useMutation({
    mutationFn: (templateName: string) =>
      post<BulkTemplateResponse>('/api/leads/bulk-template', {
        lead_ids: leads.map((lead) => lead.id),
        template_name: templateName,
      }),
    onSuccess: (res) => {
      const parts = [`Sent to ${res.sent} lead${res.sent === 1 ? '' : 's'}.`];
      if (res.skipped.length > 0) {
        parts.push(`${res.skipped.length} skipped.`);
      }
      if (res.failed.length > 0) {
        parts.push(`${res.failed.length} failed.`);
      }
      toast(res.failed.length > 0 ? 'error' : 'success', parts.join(' '));
      qc.invalidateQueries({ queryKey: ['leads'] });
      qc.invalidateQueries({ queryKey: ['leads-summary'] });
      onSent();
      handleClose();
    },
    onError: (err: Error) => {
      toast('error', err.message ?? 'Failed to send template.');
    },
  });

  function handleClose() {
    setSearch('');
    setSelectedName(null);
    onClose();
  }

  const overLimit = leads.length > BULK_LIMIT;
  const previewLead = leads[0];
  const templates = (templatesQuery.data ?? []).filter((t) =>
    `${t.name} ${t.language} ${t.category}`.toLowerCase().includes(search.toLowerCase()),
  );
  const selectedTemplate = (templatesQuery.data ?? []).find((t) => t.name === selectedName) ?? null;
  const filledBody = selectedTemplate && previewLead
    ? fillTemplateBody(selectedTemplate.body_preview, previewLead.full_name)
    : '';

  return (
    <Modal
      open={open}
      onClose={() => {
        if (!mutation.isPending) handleClose();
      }}
      title="Send template"
      subtitle={`Send a Wati template to ${leads.length} selected lead${leads.length === 1 ? '' : 's'}.`}
      maxWidth="5xl"
      footer={
        <>
          <button type="button" onClick={handleClose} className="btn-secondary" disabled={mutation.isPending}>
            Cancel
          </button>
          <button
            type="button"
            className="btn-primary"
            disabled={!selectedName || mutation.isPending || overLimit || leads.length === 0}
            onClick={() => selectedName && mutation.mutate(selectedName)}
          >
            {mutation.isPending ? <Spinner size="sm" /> : null}
            {selectedName ? `Send to ${Math.min(leads.length, BULK_LIMIT)} leads` : 'Send template'}
          </button>
        </>
      }
    >
      {overLimit && (
        <p className="mb-4 text-sm text-amber-800 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
          Select up to {BULK_LIMIT} leads at a time.
        </p>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="flex flex-col min-h-0">
          <div className="relative mb-3">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              placeholder="Search templates…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-9"
            />
          </div>
          {templatesQuery.isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Spinner size="md" />
            </div>
          ) : templatesQuery.error ? (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <AlertCircle size={32} className="text-red-300" />
              <p className="text-sm text-slate-600 font-medium">Failed to load templates.</p>
              <button type="button" onClick={() => templatesQuery.refetch()} className="btn-secondary gap-1.5">
                <RefreshCw size={13} />
                Retry
              </button>
            </div>
          ) : templates.length === 0 ? (
            <p className="text-center text-slate-400 text-sm py-16">No templates found.</p>
          ) : (
            <div className="space-y-2 overflow-y-auto max-h-56 md:max-h-[28rem] pr-1">
              {templates.map((t) => (
                <button
                  key={t.name}
                  type="button"
                  onClick={() => setSelectedName(t.name === selectedName ? null : t.name)}
                  className={`w-full text-left rounded-xl border p-3.5 transition-all ${
                    selectedName === t.name
                      ? 'border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <span className="font-medium text-sm text-slate-800">{t.name}</span>
                    <div className="flex gap-1.5 shrink-0">
                      {t.language && <span className="status-badge bg-slate-100 text-slate-600">{t.language}</span>}
                      {t.category && <span className="status-badge bg-indigo-100 text-indigo-700">{t.category}</span>}
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">{t.body_preview}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 min-h-0 overflow-y-auto">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-3">Message preview</p>
          {!selectedTemplate ? (
            <p className="text-sm text-slate-400">Select a template to preview the complete message.</p>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-slate-500">
                Preview uses {previewLead?.full_name ?? 'the first selected lead'}. Each lead gets their own name filled in.
              </p>
              <div className="max-w-sm mx-auto rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                <div className="px-4 pt-3 pb-3">
                  <TemplateChrome template={selectedTemplate} part="header" />
                  <p className="text-sm text-slate-800 whitespace-pre-wrap break-words leading-relaxed">
                    {filledBody || 'No message body is available for this template.'}
                  </p>
                  <TemplateChrome template={selectedTemplate} part="footer" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
