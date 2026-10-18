import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { get, patch } from '../../lib/api';
import type { Campaign, CampaignUpdate, WatiTemplate } from '../../types';
import { Modal } from '../ui/Modal';
import { Spinner } from '../ui/Spinner';

interface FollowupSequencePickerProps {
  campaignId: string;
  followupTemplateName: string | null;
  finalTemplateName: string | null;
  followupDelayHours: number;
  finalDelayHours: number;
  open: boolean;
  onClose: () => void;
}

export function FollowupSequencePicker({
  campaignId,
  followupTemplateName,
  finalTemplateName,
  followupDelayHours,
  finalDelayHours,
  open,
  onClose,
}: FollowupSequencePickerProps) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [followupTemplate, setFollowupTemplate] = useState('');
  const [finalTemplate, setFinalTemplate] = useState('');
  const [followupHours, setFollowupHours] = useState(24);
  const [finalHours, setFinalHours] = useState(24);

  useEffect(() => {
    if (!open) return;
    setFollowupTemplate(followupTemplateName ?? '');
    setFinalTemplate(finalTemplateName ?? '');
    setFollowupHours(followupDelayHours || 24);
    setFinalHours(finalDelayHours || 24);
  }, [open, followupTemplateName, finalTemplateName, followupDelayHours, finalDelayHours]);

  const { data, isLoading, error, refetch } = useQuery<WatiTemplate[]>({
    queryKey: ['templates', campaignId],
    queryFn: () => get<WatiTemplate[]>(`/api/campaigns/${campaignId}/available-templates`),
    enabled: open,
  });

  const mutation = useMutation({
    mutationFn: () =>
      patch<Campaign>(`/api/campaigns/${campaignId}`, {
        followup_template_name: followupTemplate || null,
        final_template_name: finalTemplate || null,
        followup_delay_hours: followupHours,
        final_delay_hours: finalHours,
      } satisfies CampaignUpdate),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['campaigns'] });
      toast('success', 'Follow-up sequence saved.');
      onClose();
    },
    onError: (err: Error) => {
      toast('error', `Failed to save follow-up sequence: ${err.message}`);
    },
  });

  const hoursValid = followupHours >= 1 && finalHours >= 1;
  const templates = data ?? [];

  const footer = (
    <>
      <button onClick={onClose} className="btn-secondary">Cancel</button>
      <button
        onClick={() => mutation.mutate()}
        disabled={mutation.isPending || !hoursValid}
        className="btn-primary"
      >
        {mutation.isPending ? <Spinner size="sm" /> : null}
        Save follow-up sequence
      </button>
    </>
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Follow-up sequence"
      subtitle="Sent only when the lead never replies. A reply cancels whatever is left."
      maxWidth="xl"
      footer={footer}
    >
      <div className="space-y-5">
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
            <TemplateField
              id="followup-template"
              label="Follow-up template"
              hint="Sent if they never reply to the first message."
              value={followupTemplate}
              templates={templates}
              onChange={setFollowupTemplate}
            />
            <HoursField
              id="followup-hours"
              label="Hours after the first message"
              value={followupHours}
              onChange={setFollowupHours}
            />
            <TemplateField
              id="final-template"
              label="Final template"
              hint="Sent if they still never reply after the follow-up. The lead is then marked Inactive."
              value={finalTemplate}
              templates={templates}
              onChange={setFinalTemplate}
            />
            <HoursField
              id="final-hours"
              label="Hours after the follow-up"
              value={finalHours}
              onChange={setFinalHours}
            />
            <p className="text-xs text-slate-500">
              Leave the follow-up template empty to keep this sequence off. Both waits default to 24 hours.
            </p>
          </>
        )}
      </div>
    </Modal>
  );
}

function TemplateField({
  id, label, hint, value, templates, onChange,
}: {
  id: string;
  label: string;
  hint: string;
  value: string;
  templates: WatiTemplate[];
  onChange: (value: string) => void;
}) {
  const missing = value && !templates.some((t) => t.name === value) ? value : '';
  return (
    <fieldset className="space-y-1.5">
      <legend className="text-xs font-semibold text-slate-700 uppercase tracking-wider">{label}</legend>
      <p className="text-xs text-slate-500">{hint}</p>
      <div id={id} role="listbox" aria-label={label} className="space-y-2 max-h-64 overflow-y-auto pr-0.5">
        <button
          type="button"
          role="option"
          aria-selected={value === ''}
          onClick={() => onChange('')}
          className={`w-full text-left rounded-xl border px-3 py-2.5 text-sm transition-all ${
            value === ''
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
            onClick={() => onChange(missing)}
            className="w-full text-left rounded-xl border border-brand-500 bg-brand-50 ring-1 ring-brand-500 px-3 py-2.5"
          >
            <span className="block text-sm font-semibold text-slate-800">{missing}</span>
            <span className="mt-1 block text-xs text-slate-500">This template is saved but is not in the current Wati list.</span>
          </button>
        )}
        {templates.map((template) => {
          const selected = template.name === value;
          return (
            <button
              key={template.name}
              type="button"
              role="option"
              aria-selected={selected}
              onClick={() => onChange(template.name)}
              className={`w-full text-left rounded-xl border px-3 py-2.5 transition-all ${
                selected
                  ? 'border-brand-500 bg-brand-50 ring-1 ring-brand-500'
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <span className="block text-sm font-semibold text-slate-800">{template.name}</span>
              <span className="mt-1.5 block text-xs text-slate-600 whitespace-pre-wrap break-words leading-relaxed">
                {template.body_preview || 'No message body is available for this template.'}
              </span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

function HoursField({
  id, label, value, onChange,
}: {
  id: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label htmlFor={id} className="block space-y-1.5">
      <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">{label}</span>
      <input
        id={id}
        type="number"
        min={1}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="input"
      />
    </label>
  );
}
