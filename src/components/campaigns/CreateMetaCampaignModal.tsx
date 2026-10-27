import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronDown, ChevronUp, X } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { get, post } from '../../lib/api';
import type { Campaign, MetaCampaignFields, MetaCampaignOption, MetaFieldMap } from '../../types';
import { Toggle } from '../ui/Toggle';

const EMPTY_MAP: MetaFieldMap = { name: [], phone: [], email: [], location: [] };

function OrderedFieldPicker({
  label,
  hint,
  required,
  fieldNames,
  selected,
  onChange,
}: {
  label: string;
  hint: string;
  required?: boolean;
  fieldNames: string[];
  selected: string[];
  onChange: (next: string[]) => void;
}) {
  const available = fieldNames.filter((name) => !selected.includes(name));

  function add(name: string) {
    if (selected.includes(name)) return;
    onChange([...selected, name]);
  }

  function remove(name: string) {
    onChange(selected.filter((item) => item !== name));
  }

  function move(name: string, direction: -1 | 1) {
    const index = selected.indexOf(name);
    const next = index + direction;
    if (index < 0 || next < 0 || next >= selected.length) return;
    const copy = [...selected];
    [copy[index], copy[next]] = [copy[next], copy[index]];
    onChange(copy);
  }

  return (
    <div className="space-y-2">
      <div>
        <p className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
          {label} {required ? <span className="text-red-500">*</span> : null}
        </p>
        <p className="text-[11px] text-slate-500 mt-0.5">{hint}</p>
      </div>
      {selected.length > 0 && (
        <div className="flex flex-col gap-1.5">
          {selected.map((name, index) => (
            <div
              key={name}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-50 border border-indigo-100 text-xs font-medium text-indigo-800"
            >
              <span className="text-[10px] font-mono text-indigo-400 w-4">{index + 1}</span>
              <span className="flex-1 truncate" title={name}>{name}</span>
              <button type="button" className="p-0.5 text-indigo-400 hover:text-indigo-700" onClick={() => move(name, -1)} aria-label={`Move ${name} up`}>
                <ChevronUp size={12} />
              </button>
              <button type="button" className="p-0.5 text-indigo-400 hover:text-indigo-700" onClick={() => move(name, 1)} aria-label={`Move ${name} down`}>
                <ChevronDown size={12} />
              </button>
              <button type="button" className="p-0.5 text-indigo-400 hover:text-red-500" onClick={() => remove(name)} aria-label={`Remove ${name}`}>
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
      {available.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {available.map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => add(name)}
              className="px-2 py-1 rounded-md border border-dashed border-slate-300 text-[11px] text-slate-600 hover:border-indigo-400 hover:text-indigo-700"
              title={name}
            >
              + {name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function CreateMetaCampaignModal({
  open,
  onClose,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const { toast } = useToast();
  const [selectedId, setSelectedId] = useState('');
  const [name, setName] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [fieldMap, setFieldMap] = useState<MetaFieldMap>(EMPTY_MAP);
  const [submitting, setSubmitting] = useState(false);

  const campaignsQuery = useQuery<MetaCampaignOption[]>({
    queryKey: ['meta-campaigns'],
    queryFn: () => get<MetaCampaignOption[]>('/api/meta/campaigns'),
    enabled: open,
  });

  const fieldsQuery = useQuery<MetaCampaignFields>({
    queryKey: ['meta-campaign-fields', selectedId],
    queryFn: () => get<MetaCampaignFields>(`/api/meta/campaigns/${encodeURIComponent(selectedId)}/fields`),
    enabled: open && Boolean(selectedId),
  });

  useEffect(() => {
    if (!open) {
      setSelectedId('');
      setName('');
      setIsActive(true);
      setFieldMap(EMPTY_MAP);
    }
  }, [open]);

  useEffect(() => {
    const option = (campaignsQuery.data ?? []).find((item) => item.id === selectedId);
    if (option) setName(option.name);
  }, [selectedId, campaignsQuery.data]);

  useEffect(() => {
    if (fieldsQuery.data?.suggested_map) {
      setFieldMap({
        name: fieldsQuery.data.suggested_map.name ?? [],
        phone: fieldsQuery.data.suggested_map.phone ?? [],
        email: fieldsQuery.data.suggested_map.email ?? [],
        location: fieldsQuery.data.suggested_map.location ?? [],
      });
    }
  }, [selectedId, fieldsQuery.data]);

  const fieldNames = fieldsQuery.data?.field_names ?? [];
  const canSubmit =
    Boolean(selectedId) &&
    Boolean(name.trim()) &&
    fieldMap.name.length > 0 &&
    fieldMap.phone.length > 0 &&
    !submitting;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      await post<Campaign>('/api/campaigns/meta', {
        meta_campaign_id: selectedId,
        name: name.trim(),
        is_active: isActive,
        field_map: fieldMap,
      });
      toast('success', 'Meta campaign linked. Only leads after this moment will be messaged.');
      onSuccess();
      onClose();
    } catch (err) {
      toast('error', (err as Error).message ?? 'Failed to create Meta campaign.');
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(15,23,42,0.45)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl border border-slate-200/60 max-h-[90vh] overflow-y-auto"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">Create Meta Campaign</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Link a Facebook campaign. Existing leads stay untouched; only new submissions are imported.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Close modal"
          >
            <X size={16} />
          </button>
        </div>

        <form id="create-meta-campaign-form" onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
          <div className="space-y-1.5">
            <label htmlFor="meta-campaign-select" className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Meta Campaign <span className="text-red-500">*</span>
            </label>
            <select
              id="meta-campaign-select"
              className="input w-full"
              value={selectedId}
              onChange={(event) => setSelectedId(event.target.value)}
              required
            >
              <option value="">Select a Meta campaign</option>
              {(campaignsQuery.data ?? []).map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} ({item.status || 'UNKNOWN'})
                </option>
              ))}
            </select>
            {campaignsQuery.isLoading && <p className="text-xs text-slate-500">Loading Meta campaigns…</p>}
            {campaignsQuery.isError && (
              <p className="text-xs text-red-600">{(campaignsQuery.error as Error).message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="meta-campaign-name" className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Jarvis Campaign Name <span className="text-red-500">*</span>
            </label>
            <input
              id="meta-campaign-name"
              type="text"
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="input w-full"
            />
          </div>

          <div className="flex items-center justify-between py-3 px-4 rounded-xl bg-slate-50 border border-slate-200">
            <div>
              <p className="text-sm font-semibold text-slate-800">Auto Mode</p>
              <p className="text-xs text-slate-500 mt-0.5">
                When on, new Meta leads receive the campaign opener template automatically.
              </p>
            </div>
            <Toggle
              enabled={isActive}
              onChange={setIsActive}
              color="emerald"
              label="Toggle Auto Mode"
            />
          </div>

          {selectedId && fieldsQuery.isLoading && (
            <p className="text-xs text-slate-500">Reading form questions from recent Meta leads…</p>
          )}
          {selectedId && fieldsQuery.isError && (
            <p className="text-xs text-red-600">{(fieldsQuery.error as Error).message}</p>
          )}
          {selectedId && fieldsQuery.data && fieldNames.length === 0 && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900">
              No lead form questions yet. Mapping can start once at least one Meta lead exists on this campaign.
              Existing leads will not be imported.
            </div>
          )}
          {fieldNames.length > 0 && (
            <div className="space-y-5 rounded-xl border border-slate-200 p-4">
              <p className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Form field mapping</p>
              <OrderedFieldPicker
                label="Name"
                hint="Questions joined in this order become the lead name."
                required
                fieldNames={fieldNames}
                selected={fieldMap.name}
                onChange={(nameFields) => setFieldMap((current) => ({ ...current, name: nameFields }))}
              />
              <OrderedFieldPicker
                label="Phone"
                hint="First value that is a valid phone number wins. Put the E.164 phone_number field first when present."
                required
                fieldNames={fieldNames}
                selected={fieldMap.phone}
                onChange={(phoneFields) => setFieldMap((current) => ({ ...current, phone: phoneFields }))}
              />
              <OrderedFieldPicker
                label="Email"
                hint="First non-empty answer is stored as email."
                fieldNames={fieldNames}
                selected={fieldMap.email}
                onChange={(emailFields) => setFieldMap((current) => ({ ...current, email: emailFields }))}
              />
              <OrderedFieldPicker
                label="Preferred location"
                hint="First non-empty answer among these questions becomes the branch. Use this for practice, area, or city questions."
                fieldNames={fieldNames}
                selected={fieldMap.location}
                onChange={(locationFields) => setFieldMap((current) => ({ ...current, location: locationFields }))}
              />
            </div>
          )}
        </form>

        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <button type="button" onClick={onClose} className="btn-secondary" disabled={submitting}>
            Cancel
          </button>
          <button
            type="submit"
            form="create-meta-campaign-form"
            disabled={!canSubmit || fieldNames.length === 0}
            className="btn-primary"
          >
            {submitting ? 'Creating…' : 'Create Meta Campaign'}
          </button>
        </div>
      </div>
    </div>
  );
}
