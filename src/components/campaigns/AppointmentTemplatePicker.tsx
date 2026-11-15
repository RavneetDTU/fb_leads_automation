import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AlertCircle, RefreshCw, Search } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { get, patch } from '../../lib/api';
import type { Campaign, CampaignUpdate, WatiTemplate } from '../../types';
import { Modal } from '../ui/Modal';
import { Spinner } from '../ui/Spinner';

type AppointmentTemplateField = 'reminder_template_name' | 'missed_appointment_template_name';

interface AppointmentTemplatePickerProps {
  campaignId: string;
  field: AppointmentTemplateField;
  currentName: string | null;
  title: string;
  subtitle: string;
  open: boolean;
  onClose: () => void;
}

export function AppointmentTemplatePicker({
  campaignId,
  field,
  currentName,
  title,
  subtitle,
  open,
  onClose,
}: AppointmentTemplatePickerProps) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [selected, setSelected] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!open) return;
    setSelected(currentName ?? '');
    setSearch('');
  }, [open, currentName]);

  const { data, isLoading, error, refetch } = useQuery<WatiTemplate[]>({
    queryKey: ['templates', campaignId],
    queryFn: () => get<WatiTemplate[]>(`/api/campaigns/${campaignId}/available-templates`),
    enabled: open,
  });

  const mutation = useMutation({
    mutationFn: () =>
      patch<Campaign>(`/api/campaigns/${campaignId}`, {
        [field]: selected || null,
      } satisfies CampaignUpdate),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['campaigns'] });
      toast('success', `${title} saved.`);
      onClose();
    },
    onError: (err: Error) => {
      toast('error', `Failed to save ${title.toLowerCase()}: ${err.message}`);
    },
  });

  const templates = (data ?? []).filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase()),
  );
  const missing = selected && !(data ?? []).some((t) => t.name === selected) ? selected : '';

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      subtitle={subtitle}
      maxWidth="xl"
      footer={(
        <>
          <button onClick={onClose} className="btn-secondary">Cancel</button>
          <button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
            className="btn-primary"
          >
            {mutation.isPending ? <Spinner size="sm" /> : null}
            Save
          </button>
        </>
      )}
    >
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-8"><Spinner /></div>
        ) : error ? (
          <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <div className="space-y-2">
              <p>{(error as Error).message}</p>
              <button onClick={() => refetch()} className="btn-secondary">
                <RefreshCw size={14} /> Retry
              </button>
            </div>
          </div>
        ) : (
          <>
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
            <div role="listbox" aria-label={title} className="space-y-2 max-h-80 overflow-y-auto">
              <button
                type="button"
                role="option"
                aria-selected={selected === ''}
                onClick={() => setSelected('')}
                className={`w-full text-left rounded-xl border px-3 py-2.5 text-sm transition-all ${
                  selected === ''
                    ? 'border-brand-500 bg-brand-50 ring-1 ring-brand-500 font-semibold text-slate-800'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700'
                }`}
              >
                Don't send
              </button>
              {missing && (
                <button
                  type="button"
                  role="option"
                  aria-selected
                  onClick={() => setSelected(missing)}
                  className="w-full text-left rounded-xl border border-brand-500 bg-brand-50 ring-1 ring-brand-500 px-3 py-2.5"
                >
                  <span className="block text-sm font-semibold text-slate-800">{missing}</span>
                  <span className="mt-1 block text-xs text-slate-500">
                    This template is saved but is not in the current Wati list.
                  </span>
                </button>
              )}
              {templates.map((template) => {
                const isSelected = template.name === selected;
                return (
                  <button
                    key={template.name}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => setSelected(template.name)}
                    className={`w-full text-left rounded-xl border px-3 py-2.5 transition-all ${
                      isSelected
                        ? 'border-brand-500 bg-brand-50 ring-1 ring-brand-500'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span className="block text-sm font-semibold text-slate-800">{template.name}</span>
                      <div className="flex gap-1.5 shrink-0">
                        <span className="status-badge bg-slate-100 text-slate-600">{template.language}</span>
                        <span className="status-badge bg-indigo-100 text-indigo-700">{template.category}</span>
                      </div>
                    </div>
                    <span className="block text-xs text-slate-600 whitespace-pre-wrap break-words leading-relaxed">
                      {template.body_preview || 'No message body is available for this template.'}
                    </span>
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
