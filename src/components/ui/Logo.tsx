interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'full' | 'icon' | 'horizontal';
  theme?: 'dark' | 'light';
  className?: string;
}

export function Logo({
  size = 'md',
  variant = 'full',
  theme = 'light',
  className = '',
}: LogoProps) {
  const iconSizes = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-12 h-12 text-lg',
  };

  const titleSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl',
  };

  const subtitleSizes = {
    sm: 'text-[10px]',
    md: 'text-xs',
    lg: 'text-xs',
  };

  const isDark = theme === 'dark';

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Icon Badge */}
      <div
        className={`${iconSizes[size]} rounded-xl bg-gradient-to-br from-[#7C947C] to-[#1E3B2F] flex items-center justify-center font-bold text-white shadow-sm shrink-0 border border-white/10`}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-1/2 h-1/2 text-white"
        >
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      </div>

      {/* Brand Text */}
      {variant !== 'icon' && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 leading-tight">
            <span
              className={`${titleSizes[size]} font-bold tracking-tight ${
                isDark ? 'text-white' : 'text-[#1E3B2F]'
              }`}
            >
              Jarvis
            </span>
            <span className={`${titleSizes[size]} font-semibold text-[#C97B5A]`}>
              AI
            </span>
          </div>
          <span
            className={`${subtitleSizes[size]} font-medium ${
              isDark ? 'text-[#7C947C]' : 'text-[#6B6B6B]'
            }`}
          >
            Automation Platform
          </span>
        </div>
      )}
    </div>
  );
}
