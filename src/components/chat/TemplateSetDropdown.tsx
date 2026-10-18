import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronDown, FileText } from 'lucide-react';
import { get } from '../../lib/api';
import type { WatiTemplate } from '../../types';
import { Spinner } from '../ui/Spinner';

interface TemplateSetDropdownProps {
  templates: string[];
  campaignId: string | null;
  leadName: string;
  disabled: boolean;
  disabledReason: string;
  sending: boolean;
  onSend: (templateName: string) => void;
}

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

export function TemplateSetDropdown({
  templates,
  campaignId,
  leadName,
  disabled,
  disabledReason,
  sending,
  onSend,
}: TemplateSetDropdownProps) {
  const [open, setOpen] = useState(false);
  const [pendingName, setPendingName] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  const templatesQuery = useQuery<WatiTemplate[]>({
    queryKey: ['templates', campaignId],
    queryFn: () => get<WatiTemplate[]>(`/api/campaigns/${campaignId}/available-templates`),
    enabled: open && !!campaignId,
  });

  useEffect(() => {
    if (!open) {
      setPendingName(null);
      return;
    }
    function handleClick(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key !== 'Escape') return;
      if (pendingName) setPendingName(null);
      else setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open, pendingName]);

  useEffect(() => {
    if (disabled) setOpen(false);
  }, [disabled]);

  const detailsByName = new Map((templatesQuery.data ?? []).map((t) => [t.name, t]));
  const rows = templates.map((name) => ({
    name,
    body: detailsByName.get(name)?.body_preview || '',
  }));
  const pending = pendingName ? rows.find((row) => row.name === pendingName) ?? { name: pendingName, body: '' } : null;
  const filledBody = pending ? fillTemplateBody(pending.body, leadName) : '';

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        disabled={disabled || sending}
        title={disabled ? disabledReason : 'Send a campaign template'}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label="Campaign templates"
      >
        {sending ? <Spinner size="sm" /> : <FileText size={14} className="text-indigo-600" />}
        Templates
        <ChevronDown size={12} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div
          className="absolute right-0 mt-1.5 w-[22rem] max-h-[28rem] overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-lg z-20 py-1"
        >
          {pending ? (
            <div className="px-3 py-2.5 space-y-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Ready to send</p>
                <p className="text-sm font-semibold text-slate-900 mt-0.5">{pending.name}</p>
              </div>
              <p className="text-[11px] text-amber-800 bg-amber-50 border border-amber-100 rounded-lg px-2.5 py-2 leading-relaxed">
                This sends immediately, even if Jarvis AI is on.
              </p>
              <pre className="text-xs text-slate-700 whitespace-pre-wrap break-words leading-relaxed bg-slate-50 border border-slate-100 rounded-lg px-2.5 py-2 font-sans">
                {filledBody || 'No message body is available for this template.'}
              </pre>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  disabled={sending}
                  onClick={() => setPendingName(null)}
                  className="btn-secondary text-xs py-1.5"
                >
                  Back
                </button>
                <button
                  type="button"
                  disabled={sending}
                  onClick={() => {
                    onSend(pending.name);
                    setOpen(false);
                  }}
                  className="btn-primary text-xs py-1.5"
                >
                  {sending ? <Spinner size="sm" /> : null}
                  Send template
                </button>
              </div>
            </div>
          ) : templates.length === 0 ? (
            <p className="px-3 py-2.5 text-xs text-slate-400">No campaign templates</p>
          ) : templatesQuery.isLoading ? (
            <div className="flex justify-center py-6"><Spinner /></div>
          ) : templatesQuery.error ? (
            <div className="px-3 py-2.5 space-y-2">
              <p className="text-xs text-red-700">Could not load template messages.</p>
              <button type="button" onClick={() => templatesQuery.refetch()} className="btn-secondary text-xs py-1.5">
                Retry
              </button>
            </div>
          ) : (
            <div role="listbox" aria-label="Campaign templates">
              {rows.map((row) => (
                <button
                  key={row.name}
                  type="button"
                  role="option"
                  disabled={sending}
                  onClick={() => setPendingName(row.name)}
                  className="w-full text-left px-3 py-2.5 hover:bg-indigo-50 border-b border-slate-100 last:border-b-0"
                >
                  <span className="block text-xs font-semibold text-slate-800">{row.name}</span>
                  <span className="mt-1 block text-xs text-slate-600 whitespace-pre-wrap break-words leading-relaxed">
                    {row.body || 'No message body is available for this template.'}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
