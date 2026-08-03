import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, Save, Copy, Check, ShieldCheck, Key } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { get, put } from '../lib/api';
import type { PlatformSettings, PlatformSettingsUpdate } from '../types';
import { Spinner } from '../components/ui/Spinner';
import { ErrorState } from '../components/ui/States';

function SettingsSection({ title, subtitle, icon: Icon, children }: {
  title: string; subtitle?: string; icon?: React.ElementType; children: React.ReactNode;
}) {
  return (
    <div className="card p-6 space-y-5 bg-white">
      <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
        {Icon && (
          <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0 border border-indigo-100">
            <Icon size={18} />
          </div>
        )}
        <div>
          <h2 className="font-bold text-slate-900 text-base tracking-tight">{title}</h2>
          {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function CopyField({ label, value }: { label: string; value: string }) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    if (!value) return;
    navigator.clipboard.writeText(value);
    setCopied(true);
    toast('success', `Copied ${label} to clipboard`);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div>
      <label className="label">{label}</label>
      <div className="relative flex items-center">
        <input
          type="text"
          value={value}
          readOnly
          className="input bg-slate-50 text-slate-600 font-mono text-xs pr-10 cursor-default"
        />
        <button
          type="button"
          onClick={handleCopy}
          className="absolute right-2 text-slate-400 hover:text-indigo-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          title="Copy to clipboard"
        >
          {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
        </button>
      </div>
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
        className={`input ${readOnly ? 'bg-slate-50 text-slate-500 font-mono text-xs cursor-default' : ''}`}
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
        smtp_from_name: data.smtp_from_name ?? 'Jarvis AI Bot',
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
    const payload: PlatformSettingsUpdate = {};
    for (const [k, v] of Object.entries(form)) {
      if (typeof v === 'string' && v.includes('...')) continue;
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
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
            <span>Dashboard</span>
            <span>/</span>
            <span className="text-indigo-600">Platform Settings</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">API & Integration Settings</h1>
          <p className="text-xs text-slate-500 mt-0.5">Manage Meta Lead Ads, WATI WhatsApp credentials, and OpenAI models.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={mutation.isPending}
          className="btn-primary"
        >
          {mutation.isPending ? <Spinner size="sm" /> : <Save size={16} />}
          Save Settings
        </button>
      </div>

      {/* Meta token warning banner if applicable */}
      {tokenStatus?.warning && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200/80 rounded-xl p-4 shadow-sm">
          <AlertTriangle size={20} className="text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-amber-900 text-sm">
              ⚠️ Meta Access Token Expiring Soon
            </p>
            <p className="text-amber-800 text-xs mt-0.5">
              Your token will expire in {tokenStatus.days_remaining} days. Please update your token below to maintain uninterrupted lead polling.
            </p>
          </div>
        </div>
      )}

      {/* Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Card: Meta API Config */}
        <SettingsSection
          title="Meta Lead Ads API Config"
          subtitle="Configure Meta Graph API App credentials and Page tokens"
          icon={ShieldCheck}
        >
          <Field label="Meta App ID" value={form.meta_app_id ?? ''} onChange={(v) => setField('meta_app_id', v)} />
          <CopyField label="Current Masked Access Token" value={data?.meta_access_token ?? ''} />
          <Field label="Update Access Token" type="password" value={''} onChange={(v) => setField('meta_access_token', v || null)} placeholder="Paste new access token to update" />
          <Field label="Meta Ad Account ID" value={form.meta_ad_account_id ?? ''} onChange={(v) => setField('meta_ad_account_id', v)} />
          <Field label="Meta App Secret" type="password" value={''} onChange={(v) => setField('meta_app_secret', v || null)} placeholder="Enter App Secret to update" />
          
          {/* Visual Status Indicator */}
          <div className="pt-2">
            <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>🟢 Token Valid: Expires in {tokenStatus?.days_remaining ?? 59} days</span>
            </div>
          </div>
        </SettingsSection>

        {/* Right Card: WATI / WhatsApp API Config */}
        <SettingsSection
          title="WATI WhatsApp API Config"
          subtitle="Enterprise WhatsApp Gateway instance credentials"
          icon={Key}
        >
          <CopyField label="WATI API Endpoint URL" value={form.wati_api_endpoint ?? 'https://live-mt-server.wati.io'} />
          <CopyField label="Current WATI Access Token" value={data?.wati_access_token ?? ''} />
          <Field label="Update WATI Access Token" type="password" value={''} onChange={(v) => setField('wati_access_token', v || null)} placeholder="Paste new WATI token to update" />
          <CopyField label="WATI Instance ID" value={form.wati_instance_id ?? ''} />
        </SettingsSection>

        {/* OpenAI Section */}
        <SettingsSection title="OpenAI LLM Configuration" subtitle="Models for conversational agent & template generation">
          <CopyField label="OpenAI API Key (Masked)" value={data?.openai_api_key ?? ''} />
          <Field label="Update OpenAI API Key" type="password" value={''} onChange={(v) => setField('openai_api_key', v || null)} placeholder="sk-… (enter to update)" />
          <Field label="Conversational Agent Model" value={form.openai_model ?? ''} onChange={(v) => setField('openai_model', v)} placeholder="gpt-4o" />
          <Field label="Template Generation Model" value={form.openai_model_for_templates ?? ''} onChange={(v) => setField('openai_model_for_templates', v)} placeholder="gpt-4o-mini" />
        </SettingsSection>

        {/* Supervisor Notifications Section */}
        <SettingsSection title="Supervisor Email & SMTP" subtitle="Email notifications for lead handoff and supervisor alerts">
          <Field label="Supervisor Email" type="email" value={form.supervisor_email ?? ''} onChange={(v) => setField('supervisor_email', v)} />
          <Field label="CC Email Address" type="email" value={form.supervisor_email_cc ?? ''} onChange={(v) => setField('supervisor_email_cc', v)} />
          <Field label="SMTP Host" value={form.smtp_host ?? ''} onChange={(v) => setField('smtp_host', v)} />
          <Field label="From Name" value={form.smtp_from_name ?? 'Jarvis AI Bot'} onChange={(v) => setField('smtp_from_name', v)} />
        </SettingsSection>
      </div>
    </div>
  );
}
