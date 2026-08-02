export function Spinner({ size = 'md', className = '' }: { size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const sizeClass = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-10 h-10' }[size];
  return (
    <div
      className={`${sizeClass} ${className} animate-spin rounded-full border-2 border-slate-200 border-t-brand-500`}
      role="status"
      aria-label="Loading"
    />
  );
}

export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded bg-slate-200 ${className}`} aria-hidden="true" />
  );
}

export function TableSkeleton({ rows = 5, cols = 6 }: { rows?: number; cols?: number }) {
  return (
    <div className="w-full">
      {Array.from({ length: rows }).map((_, ri) => (
        <div key={ri} className="flex gap-4 px-4 py-3 border-b border-slate-100">
          {Array.from({ length: cols }).map((_, ci) => (
            <Skeleton key={ci} className={`h-4 ${ci === 0 ? 'w-24' : ci === 1 ? 'w-32' : 'flex-1'}`} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="card p-5 space-y-3">
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-8 w-1/3" />
      <Skeleton className="h-3 w-3/4" />
    </div>
  );
}
