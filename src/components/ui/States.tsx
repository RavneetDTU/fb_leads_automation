import type { ReactNode } from 'react';
import { AlertCircle, Inbox } from 'lucide-react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center select-none">
      <div className="w-16 h-16 rounded-full bg-sage-light flex items-center justify-center mb-3.5 text-sage border border-sage/20 shadow-apple-sm">
        {icon ?? <Inbox size={28} />}
      </div>
      <h3 className="text-forest font-semibold text-sm mb-1 tracking-tight">{title}</h3>
      {description && <p className="text-neutral-secondary text-xs max-w-xs leading-relaxed">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ message = 'Something went wrong.', onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center select-none">
      <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center mb-3.5 text-rose-600 border border-rose-200 shadow-apple-sm">
        <AlertCircle size={28} />
      </div>
      <h3 className="text-forest font-semibold text-sm mb-1 tracking-tight">Failed to load data</h3>
      <p className="text-neutral-secondary text-xs max-w-xs leading-relaxed">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 btn-secondary text-xs px-3.5 py-1.5"
        >
          Try again
        </button>
      )}
    </div>
  );
}
