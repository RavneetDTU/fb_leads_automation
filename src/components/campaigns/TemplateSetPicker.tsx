import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, AlertCircle, RefreshCw, Check } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { get, patch } from '../../lib/api';
import type { Campaign, CampaignUpdate, WatiTemplate } from '../../types';
import { Modal } from '../ui/Modal';
import { Spinner } from '../ui/Spinner';

const MAX_SET = 5;

interface TemplateSetPickerProps {
  campaignId: string;
  currentSet: string[];
  open: boolean;
  onClose: () => void;
}

export function TemplateSetPicker({
  campaignId,
  currentSet,
  open,
  onClose,
}: TemplateSetPickerProps) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    if (open) {
      setSelected((currentSet ?? []).filter(Boolean).slice(0, MAX_SET));
      setSearch('');
    }
  }, [open, currentSet]);

  const { data, isLoading, error, refetch } = useQuery<WatiTemplate[]>({
    queryKey: ['templates', campaignId],
    queryFn: () => get<WatiTemplate[]>(`/api/campaigns/${campaignId}/available-templates`),
    enabled: open,
  });

  const mutation = useMutation({
    mutationFn: (template_set: string[]) =>
      patch<Campaign>(`/api/campaigns/${campaignId}`, { template_set } satisfies CampaignUpdate),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['campaigns'] });
      toast('success', 'Template set saved.');
      handleClose();
    },
    onError: (err: Error) => {
      toast('error', `Failed to save template set: ${err.message}`);
    },
  });

  const filtered = (data ?? []).filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase()),
  );

  function toggle(name: string) {
    setSelected((prev) => {
      if (prev.includes(name)) return prev.filter((n) => n !== name);
      if (prev.length >= MAX_SET) {
        toast('error', `You can attach up to ${MAX_SET} templates.`);
        return prev;
      }
      return [...prev, name];
    });
  }

  function handleClose() {
    setSearch('');
    setSelected([]);
    onClose();
  }

  const footer = (
    <>
      <button onClick={handleClose} className="btn-secondary">Cancel</button>
      <button
        onClick={() => mutation.mutate(selected)}
        disabled={mutation.isPending}
        className="btn-primary"
      >
        {mutation.isPending ? <Spinner size="sm" /> : null}
        Save template set ({selected.length}/{MAX_SET})
      </button>
    </>
  );

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Campaign template set"
      subtitle="Choose up to 5 Wati templates agents can send from the WhatsApp inbox"
      maxWidth="xl"
      footer={footer}
    >
      <div className="space-y-4">
        {selected.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {selected.map((name, idx) => (
              <span
                key={name}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-800 text-[11px] font-semibold border border-indigo-100"
              >
                {idx + 1}. {name}
              </span>
            ))}
          </div>
        )}

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
            {filtered.map((t) => {
              const checked = selected.includes(t.name);
              const blocked = !checked && selected.length >= MAX_SET;
              return (
                <button
                  key={t.name}
                  type="button"
                  onClick={() => toggle(t.name)}
                  disabled={blocked}
                  className={`w-full text-left rounded-xl border p-4 transition-all ${
                    checked
                      ? 'border-brand-500 bg-brand-50 ring-1 ring-brand-500'
                      : blocked
                        ? 'border-slate-100 bg-slate-50 opacity-60 cursor-not-allowed'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <span className="font-medium text-sm text-slate-800 inline-flex items-center gap-2">
                      <span
                        className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                          checked ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300 bg-white'
                        }`}
                      >
                        {checked ? <Check size={11} /> : null}
                      </span>
                      {t.name}
                    </span>
                    <div className="flex gap-1.5 shrink-0">
                      <span className="status-badge bg-slate-100 text-slate-600">{t.language}</span>
                      <span className="status-badge bg-indigo-100 text-indigo-700">{t.category}</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed pl-6">{t.body_preview}</p>
                  {t.placeholder_count > 0 && (
                    <p className="text-xs text-amber-600 mt-1 pl-6">
                      {t.placeholder_count} placeholder{t.placeholder_count > 1 ? 's' : ''}
                    </p>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </Modal>
  );
}
