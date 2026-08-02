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
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="mb-4 text-slate-300">
        {icon ?? <Inbox size={48} />}
      </div>
      <h3 className="text-slate-700 font-semibold text-base mb-1">{title}</h3>
      {description && <p className="text-slate-400 text-sm max-w-xs">{description}</p>}
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
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="mb-4 text-red-300">
        <AlertCircle size={48} />
      </div>
      <h3 className="text-slate-700 font-semibold text-base mb-1">Failed to load data</h3>
      <p className="text-slate-400 text-sm max-w-xs">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 btn-secondary"
        >
          Try again
        </button>
      )}
    </div>
  );
}
