import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, AlertCircle, RefreshCw, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { get, post } from '../../lib/api';
import type { WatiTemplate, ApplyTemplateResponse } from '../../types';
import { Modal } from '../ui/Modal';
import { Spinner } from '../ui/Spinner';

interface TemplatePickerProps {
  campaignId: string;
  open: boolean;
  onClose: () => void;
}

export function TemplatePicker({ campaignId, open, onClose }: TemplatePickerProps) {
  const { token } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<string | null>(null);
  const [applyResult, setApplyResult] = useState<ApplyTemplateResponse | null>(null);

  const { data, isLoading, error, refetch } = useQuery<WatiTemplate[]>({
    queryKey: ['templates', campaignId],
    queryFn: () => get<WatiTemplate[]>(`/api/campaigns/${campaignId}/available-templates`, token!),
    enabled: !!token && open,
  });

  const mutation = useMutation({
    mutationFn: (templateName: string) =>
      post<ApplyTemplateResponse>(`/api/campaigns/${campaignId}/apply-template`, token!, {
        template_name: templateName,
      }),
    onSuccess: (res) => {
      setApplyResult(res);
      qc.invalidateQueries({ queryKey: ['campaigns'] });
      qc.invalidateQueries({ queryKey: ['campaign-leads', campaignId] });
    },
    onError: (err: Error) => {
      toast('error', `Failed to apply template: ${err.message}`);
    },
  });

  const filtered = (data ?? []).filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase()),
  );

  function handleSave() {
    if (!selected) return;
    mutation.mutate(selected);
  }

  function handleClose() {
    setSearch('');
    setSelected(null);
    setApplyResult(null);
    onClose();
  }

  const footer = applyResult ? (
    <button onClick={handleClose} className="btn-primary">Done</button>
  ) : (
    <>
      <button onClick={handleClose} className="btn-secondary">Cancel</button>
      <button
        onClick={handleSave}
        disabled={!selected || mutation.isPending}
        className="btn-primary"
      >
        {mutation.isPending ? <Spinner size="sm" /> : null}
        Apply Template
      </button>
    </>
  );

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Select Template"
      subtitle="Choose a WhatsApp message template to send to NEW leads"
      maxWidth="xl"
      footer={footer}
    >
      {/* Success result */}
      {applyResult ? (
        <div className="space-y-4">
          <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl p-4">
            <CheckCircle2 size={20} className="text-green-600 shrink-0" />
            <div>
              <p className="font-semibold text-green-800 text-sm">
                Template applied — {applyResult.queued_lead_count} leads queued
              </p>
              {applyResult.skipped_lead_count > 0 && (
                <p className="text-amber-700 text-xs mt-1">
                  ⚠ {applyResult.skipped_lead_count} lead{applyResult.skipped_lead_count > 1 ? 's' : ''} skipped — missing required data. Check manually:{' '}
                  {applyResult.skipped_lead_ids.join(', ')}
                </p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              placeholder="Search templates…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-9"
            />
          </div>

          {/* Template list */}
          {isLoading ? (
            <div className="flex items-center justify-center py-10">
              <Spinner size="md" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center gap-3 py-10 text-center">
              <AlertCircle size={32} className="text-red-300" />
              <p className="text-sm text-slate-600 font-medium">Failed to load templates.</p>
              <p className="text-xs text-slate-400">Please try again.</p>
              <button onClick={() => refetch()} className="btn-secondary gap-1.5">
                <RefreshCw size={13} />
                Retry
              </button>
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-center text-slate-400 text-sm py-10">No templates found.</p>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {filtered.map((t) => (
                <button
                  key={t.name}
                  onClick={() => setSelected(t.name === selected ? null : t.name)}
                  className={`w-full text-left rounded-xl border p-4 transition-all ${
                    selected === t.name
                      ? 'border-brand-500 bg-brand-50 ring-1 ring-brand-500'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <span className="font-medium text-sm text-slate-800">{t.name}</span>
                    <div className="flex gap-1.5 shrink-0">
                      <span className="status-badge bg-slate-100 text-slate-600">{t.language}</span>
                      <span className="status-badge bg-indigo-100 text-indigo-700">{t.category}</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">{t.body_preview}</p>
                  {t.placeholder_count > 0 && (
                    <p className="text-xs text-amber-600 mt-1">{t.placeholder_count} placeholder{t.placeholder_count > 1 ? 's' : ''}</p>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
