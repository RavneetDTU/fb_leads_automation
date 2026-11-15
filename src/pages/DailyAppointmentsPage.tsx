import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { addDays, format } from 'date-fns';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { get, post } from '../lib/api';
import type { DailyAppointment, DailyAppointmentList } from '../types';
import { EmptyState, ErrorState } from '../components/ui/States';
import { Spinner, TableSkeleton } from '../components/ui/Spinner';

function parseDateOnly(value: string): Date {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, (month || 1) - 1, day || 1);
}

function toDateIso(value: Date): string {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function DailyAppointmentsPage() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [date, setDate] = useState<string | null>(null);
  const [store, setStore] = useState('');

  const query = useQuery<DailyAppointmentList>({
    queryKey: ['daily-appointments', date, store],
    queryFn: () => {
      const params = new URLSearchParams();
      if (date) params.set('date', date);
      if (store) params.set('store', store);
      const qs = params.toString();
      return get<DailyAppointmentList>(`/api/appointments${qs ? `?${qs}` : ''}`);
    },
  });

  const selectedDate = date ?? query.data?.today ?? toDateIso(new Date());
  const selected = useMemo(() => parseDateOnly(selectedDate), [selectedDate]);

  const sendMissed = useMutation({
    mutationFn: (sessionId: number) =>
      post<DailyAppointment>(`/api/appointments/${sessionId}/missed-template`, {}),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['daily-appointments'] });
      toast('success', 'Missed appointment template sent.');
    },
    onError: (err: Error) => {
      toast('error', err.message || 'Failed to send missed appointment template.');
    },
  });

  function shiftDay(delta: number) {
    setDate(toDateIso(addDays(selected, delta)));
  }

  const items = query.data?.items ?? [];
  const stores = query.data?.stores ?? [];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="border-b border-slate-200/80 pb-5">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Daily Appointment</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Bot-booked visits from every store for the selected day (Africa/Johannesburg).
        </p>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setDate(query.data?.today ?? toDateIso(new Date()))}
            className={`px-3.5 py-2 rounded-lg text-sm font-semibold border transition-colors ${
              selectedDate === (query.data?.today ?? '')
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
            }`}
          >
            Today
          </button>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => shiftDay(-1)}
              className="w-9 h-9 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 flex items-center justify-center"
              aria-label="Previous day"
            >
              <ChevronLeft size={16} />
            </button>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setDate(e.target.value)}
              className="input w-[11.5rem]"
            />
            <button
              type="button"
              onClick={() => shiftDay(1)}
              className="w-9 h-9 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 flex items-center justify-center"
              aria-label="Next day"
            >
              <ChevronRight size={16} />
            </button>
          </div>
          <select
            value={store}
            onChange={(e) => setStore(e.target.value)}
            className="input w-52"
            aria-label="Filter by store"
          >
            <option value="">All stores</option>
            {stores.map((name) => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-center min-w-[7.5rem]">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Appointments</p>
            <p className="text-xl font-bold text-slate-900">{query.data?.count ?? 0}</p>
          </div>
        </div>
      </div>

      <p className="text-sm text-slate-500">
        Showing appointments for <span className="font-semibold text-slate-700">{format(selected, 'EEEE, MMMM d, yyyy')}</span>
      </p>

      <div className="card overflow-hidden">
        {query.isLoading ? (
          <TableSkeleton rows={6} cols={6} />
        ) : query.error ? (
          <ErrorState message={(query.error as Error).message} onRetry={query.refetch} />
        ) : items.length === 0 ? (
          <EmptyState
            icon={<CalendarDays size={28} />}
            title="No appointments for this date"
            description="Bot bookings from every store calendar appear here once they are confirmed."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  {['Time', 'Contact', 'Store', 'Campaign', 'Reminder', 'Action'].map((heading) => (
                    <th
                      key={heading}
                      className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item) => (
                  <tr key={item.session_id} className="hover:bg-slate-50/70">
                    <td className="px-4 py-3 font-semibold text-slate-900 whitespace-nowrap">
                      {item.appointment_time ?? '—'}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-900">{item.full_name || 'Unknown'}</p>
                      <p className="text-xs font-mono text-slate-500">{item.phone ?? '—'}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-700">{item.store_name || '—'}</td>
                    <td className="px-4 py-3 text-slate-700">{item.campaign_name || '—'}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {item.reminder_sent ? (
                        <span className="inline-flex items-center rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 text-[11px] font-semibold">
                          Reminder sent
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-slate-100 text-slate-600 border border-slate-200 px-2.5 py-1 text-[11px] font-semibold">
                          Reminder not sent
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end">
                        <button
                          type="button"
                          disabled={!item.can_send_missed || sendMissed.isPending}
                          title={item.can_send_missed ? undefined : item.missed_disabled_reason ?? undefined}
                          onClick={() => sendMissed.mutate(item.session_id)}
                          className="btn-primary text-xs px-3 py-1.5 whitespace-nowrap disabled:bg-slate-200 disabled:text-slate-500 disabled:border-slate-200 disabled:shadow-none disabled:cursor-not-allowed"
                        >
                          {sendMissed.isPending && sendMissed.variables === item.session_id ? (
                            <Spinner size="sm" />
                          ) : null}
                          Send missed appointment template
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
