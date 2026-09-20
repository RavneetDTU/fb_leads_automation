import { useEffect, useRef, useState } from 'react';
import { ChevronDown, FileText } from 'lucide-react';
import { Spinner } from '../ui/Spinner';

interface TemplateSetDropdownProps {
  templates: string[];
  disabled: boolean;
  disabledReason: string;
  sending: boolean;
  onSend: (templateName: string) => void;
}

export function TemplateSetDropdown({
  templates,
  disabled,
  disabledReason,
  sending,
  onSend,
}: TemplateSetDropdownProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  useEffect(() => {
    if (disabled) setOpen(false);
  }, [disabled]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        disabled={disabled || sending}
        title={disabled ? disabledReason : 'Send a campaign template'}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Campaign templates"
      >
        {sending ? <Spinner size="sm" /> : <FileText size={14} className="text-indigo-600" />}
        Templates
        <ChevronDown size={12} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div
          role="listbox"
          className="absolute right-0 mt-1.5 w-64 max-h-72 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-lg z-20 py-1"
        >
          {templates.length === 0 ? (
            <p className="px-3 py-2.5 text-xs text-slate-400">No campaign templates</p>
          ) : (
            templates.map((name) => (
              <button
                key={name}
                type="button"
                role="option"
                disabled={sending}
                onClick={() => {
                  setOpen(false);
                  onSend(name);
                }}
                className="w-full text-left px-3 py-2 text-xs font-medium text-slate-800 hover:bg-indigo-50 hover:text-indigo-800 truncate"
              >
                {name}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
