interface ToggleProps {
  enabled: boolean;
  onChange: (val: boolean) => void;
  disabled?: boolean;
  label?: string;
  size?: 'sm' | 'md';
}

export function Toggle({ enabled, onChange, disabled = false, label, size = 'md' }: ToggleProps) {
  const trackSize = size === 'sm' ? 'w-8 h-4' : 'w-10 h-5';
  const thumbSize = size === 'sm' ? 'w-3 h-3' : 'w-4 h-4';
  const thumbTranslate = size === 'sm' ? 'translate-x-4' : 'translate-x-5';

  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!enabled)}
      className={`
        relative inline-flex shrink-0 items-center rounded-full border-2 border-transparent
        transition-colors duration-200 ease-in-out cursor-pointer
        focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${trackSize}
        ${enabled ? 'bg-brand-500' : 'bg-slate-200'}
      `}
    >
      <span
        className={`
          inline-block rounded-full bg-white shadow transition-transform duration-200 ease-in-out
          ${thumbSize}
          ${enabled ? thumbTranslate : 'translate-x-0'}
        `}
      />
    </button>
  );
}
