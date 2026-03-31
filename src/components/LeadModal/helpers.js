// ── Shared helpers for LeadModal tabs ──

/** Format ISO date string for display */
export function formatDate(iso) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

/** Format message timestamp — today shows time, otherwise shows date */
export function formatMessageTime(isoString) {
  if (!isoString) return '';
  const date = new Date(isoString);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  if (isToday) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return date.toLocaleDateString([], { day: 'numeric', month: 'short' });
}

/** Reusable className string for native <select> elements */
export const selectClass =
  "flex h-9 w-full rounded-md border border-border bg-white px-3 py-1 text-sm transition-colors focus-visible:outline-none focus-visible:border-slate-400 focus-visible:ring-[3px] focus-visible:ring-[rgba(0,0,0,0.08)]";
