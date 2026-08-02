import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { get, put } from '../lib/api';
import type { PlatformSettings, PlatformSettingsUpdate } from '../types';
import { Spinner } from '../components/ui/Spinner';
import { ErrorState } from '../components/ui/States';

function SettingsSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card p-6 space-y-4">
      <h2 className="font-semibold text-slate-800 text-sm border-b border-slate-100 pb-3">{title}</h2>
      {children}
    </div>
  );
}

function Field({
  label, value, onChange, type = 'text', placeholder, readOnly,
}: {
  label: string; value: string | number; onChange?: (v: string) => void;
  type?: string; placeholder?: string; readOnly?: boolean;
}) {
  return (
    <div>
      <label className="label">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        placeholder={placeholder}
        readOnly={readOnly}
        className={`input ${readOnly ? 'bg-slate-50 text-slate-500 cursor-default' : ''}`}
      />
    </div>
  );
}

export function SettingsPage() {
  const { token } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery<PlatformSettings>({
    queryKey: ['settings'],
    queryFn: () => get<PlatformSettings>('/api/settings', token!),
    enabled: !!token,
  });

  // Local editable state — mirrors fetched data
  const [form, setForm] = useState<Partial<PlatformSettingsUpdate>>({});

  useEffect(() => {
    if (data) {
      setForm({
        meta_app_id: data.meta_app_id ?? '',
        meta_ad_account_id: data.meta_ad_account_id ?? '',
        wati_api_endpoint: data.wati_api_endpoint ?? '',
        wati_instance_id: data.wati_instance_id ?? '',
        openai_model: data.openai_model,
        openai_model_for_templates: data.openai_model_for_templates,
        poll_interval_minutes: data.poll_interval_minutes,
        supervisor_email: data.supervisor_email ?? '',
        supervisor_email_cc: data.supervisor_email_cc ?? '',
        smtp_host: data.smtp_host,
        smtp_port: data.smtp_port,
        smtp_user: data.smtp_user ?? '',
        smtp_from_name: data.smtp_from_name,
      });
    }
  }, [data]);

  const mutation = useMutation({
    mutationFn: (payload: PlatformSettingsUpdate) =>
      put<PlatformSettings>('/api/settings', token!, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['settings'] });
      toast('success', 'Settings saved successfully.');
    },
    onError: (err: Error) => {
      toast('error', `Failed to save settings: ${err.message}`);
    },
  });

  function setField(key: keyof PlatformSettingsUpdate, value: string | number | null) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSave() {
    // Only send non-masked, non-empty fields — masked values (containing '...') are skipped
    const payload: PlatformSettingsUpdate = {};
    for (const [k, v] of Object.entries(form)) {
      if (typeof v === 'string' && v.includes('...')) continue; // skip masked values
      if (v !== '' && v !== null && v !== undefined) {
        (payload as Record<string, unknown>)[k] = v;
      }
    }
    mutation.mutate(payload);
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return <ErrorState message={(error as Error).message} onRetry={refetch} />;
  }

  const tokenStatus = data?.meta_token_status;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Platform Settings</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage API keys, automation config, and notifications.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={mutation.isPending}
          className="btn-primary"
        >
          {mutation.isPending ? <Spinner size="sm" /> : <Save size={15} />}
          Save Changes
        </button>
      </div>

      {/* Meta token expiry banner — prominent warning */}
      {tokenStatus?.warning && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4 animate-fade-in">
          <AlertTriangle size={20} className="text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-800 text-sm">
              ⚠️ Your Meta access token expires in {tokenStatus.days_remaining} days
            </p>
            <p className="text-amber-700 text-xs mt-0.5">
              Update your token below to avoid interrupting lead ingestion. The background poller will silently stop working on expiry.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Meta API */}
        <SettingsSection title="Meta API Configuration">
          <Field label="App ID" value={form.meta_app_id ?? ''} onChange={(v) => setField('meta_app_id', v)} />
          <div>
            <label className="label">Access Token (masked)</label>
            <input type="text" value={data?.meta_access_token ?? ''} readOnly className="input bg-slate-50 text-slate-500 font-mono text-xs cursor-default" />
            <p className="text-xs text-slate-400 mt-1">Enter new value below to update</p>
          </div>
          <Field label="New Access Token" type="password" value={''} onChange={(v) => setField('meta_access_token', v || null)} placeholder="Paste new token to update" />
          <Field label="Ad Account ID" value={form.meta_ad_account_id ?? ''} onChange={(v) => setField('meta_ad_account_id', v)} />
          <Field label="App Secret (write-only)" type="password" value={''} onChange={(v) => setField('meta_app_secret', v || null)} placeholder="Enter to update" />
          <Field label="Token Expires At (ISO 8601)" value={''} onChange={(v) => setField('meta_token_expires_at', v || null)} placeholder="2026-10-01T12:00:00Z" />
          {tokenStatus && (
            <div className="bg-slate-50 rounded-lg p-3 text-xs text-slate-600">
              <span className="font-medium">Token Status:</span>{' '}
              {tokenStatus.days_remaining !== null
                ? `Expires in ${tokenStatus.days_remaining} days (${tokenStatus.expires_at?.split('T')[0]})`
                : 'Expiry unknown'}
            </div>
          )}
        </SettingsSection>

        {/* Wati API */}
        <SettingsSection title="Wati API Configuration">
          <Field label="API Endpoint" value={form.wati_api_endpoint ?? ''} onChange={(v) => setField('wati_api_endpoint', v)} />
          <div>
            <label className="label">Access Token (masked)</label>
            <input type="text" value={data?.wati_access_token ?? ''} readOnly className="input bg-slate-50 text-slate-500 font-mono text-xs cursor-default" />
          </div>
          <Field label="New Access Token" type="password" value={''} onChange={(v) => setField('wati_access_token', v || null)} placeholder="Paste new token to update" />
          <Field label="Instance ID" value={form.wati_instance_id ?? ''} onChange={(v) => setField('wati_instance_id', v)} />
        </SettingsSection>

        {/* OpenAI */}
        <SettingsSection title="OpenAI Configuration">
          <div>
            <label className="label">API Key (masked)</label>
            <input type="text" value={data?.openai_api_key ?? ''} readOnly className="input bg-slate-50 text-slate-500 font-mono text-xs cursor-default" />
          </div>
          <Field label="New API Key" type="password" value={''} onChange={(v) => setField('openai_api_key', v || null)} placeholder="sk-… (enter to update)" />
          <Field label="Model (for conversations)" value={form.openai_model ?? ''} onChange={(v) => setField('openai_model', v)} placeholder="gpt-4o" />
          <Field label="Model (for templates)" value={form.openai_model_for_templates ?? ''} onChange={(v) => setField('openai_model_for_templates', v)} placeholder="gpt-4o-mini" />
        </SettingsSection>

        {/* Automation */}
        <SettingsSection title="Automation">
          <div>
            <label className="label">Poll Interval (minutes)</label>
            <input
              type="number"
              min={1}
              max={60}
              value={form.poll_interval_minutes ?? 10}
              onChange={(e) => setField('poll_interval_minutes', Number(e.target.value))}
              className="input"
            />
          </div>
        </SettingsSection>

        {/* Notifications */}
        <SettingsSection title="Supervisor Notifications">
          <Field label="Supervisor Email" type="email" value={form.supervisor_email ?? ''} onChange={(v) => setField('supervisor_email', v)} />
          <Field label="CC Email" type="email" value={form.supervisor_email_cc ?? ''} onChange={(v) => setField('supervisor_email_cc', v)} />
        </SettingsSection>

        {/* SMTP */}
        <SettingsSection title="SMTP Configuration">
          <Field label="SMTP Host" value={form.smtp_host ?? ''} onChange={(v) => setField('smtp_host', v)} />
          <div>
            <label className="label">SMTP Port</label>
            <input
              type="number"
              value={form.smtp_port ?? 587}
              onChange={(e) => setField('smtp_port', Number(e.target.value))}
              className="input"
            />
          </div>
          <Field label="SMTP User" type="email" value={form.smtp_user ?? ''} onChange={(v) => setField('smtp_user', v)} />
          <Field label="SMTP Password (write-only)" type="password" value={''} onChange={(v) => setField('smtp_password', v || null)} placeholder="Enter to update" />
          <Field label="From Name" value={form.smtp_from_name ?? ''} onChange={(v) => setField('smtp_from_name', v)} />
        </SettingsSection>
      </div>
    </div>
  );
}
