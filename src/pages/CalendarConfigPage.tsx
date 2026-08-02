import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { ChevronRight, Save, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { get, put } from '../lib/api';
import type { CalendarConfigResponse, CalendarConfig, DayHours } from '../types';
import { Spinner } from '../components/ui/Spinner';
import { ErrorState } from '../components/ui/States';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const NAV_SECTIONS = [
  { id: 'store', label: 'Store Details' },
  { id: 'hours', label: 'Opening Hours' },
  { id: 'services', label: 'Services & Durations' },
  { id: 'capacity', label: 'Capacity' },
  { id: 'closures', label: 'Closures & Breaks' },
  { id: 'timeblocks', label: 'Time Blocks' },
];

const DEFAULT_CONFIG: CalendarConfig = {
  hours: Object.fromEntries(DAYS.map((d) => [d, { open: '08:30', close: '17:00', closed: d === 'sunday' }])),
  services_offered: [],
  durations: {},
  buffer_minutes: {},
  concurrent_appointments: 1,
  min_advance_hours: 24,
  max_advance_days: 90,
  timezone: 'Africa/Johannesburg',
  closed_dates: [],
  daily_breaks: [],
  time_blocks: [],
  contact: {},
  custom_confirmation_note: '',
};

export function CalendarConfigPage() {
  const { id } = useParams<{ id: string }>();
  const calId = Number(id);
  const { token } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [activeSection, setActiveSection] = useState('store');
  const [config, setConfig] = useState<CalendarConfig>(DEFAULT_CONFIG);
  const [displayName, setDisplayName] = useState('');
  const [location, setLocation] = useState('');

  const { data, isLoading, error, refetch } = useQuery<CalendarConfigResponse>({
    queryKey: ['calendar-config', calId],
    queryFn: () => get<CalendarConfigResponse>(`/api/calendars/${calId}/config`, token!),
    enabled: !!token && !isNaN(calId),
  });

  useEffect(() => {
    if (data) {
      setConfig({ ...DEFAULT_CONFIG, ...data.config });
      setDisplayName(data.display_name);
      setLocation(data.location);
    }
  }, [data]);

  const mutation = useMutation({
    mutationFn: () =>
      put<{ status: string; calendar_id: number }>(`/api/calendars/${calId}/config`, token!, { config }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['calendar-config', calId] });
      toast('success', 'Calendar settings saved.');
    },
    onError: (err: Error) => toast('error', `Failed to save: ${err.message}`),
  });

  function updateDay(day: string, field: keyof DayHours, value: string | boolean) {
    setConfig((prev) => ({
      ...prev,
      hours: { ...prev.hours, [day]: { ...prev.hours[day], [field]: value } },
    }));
  }

  function toggleService(service: string, add: boolean) {
    setConfig((prev) => ({
      ...prev,
      services_offered: add
        ? [...prev.services_offered, service]
        : prev.services_offered.filter((s) => s !== service),
    }));
  }

  function updateDuration(service: string, val: number) {
    setConfig((prev) => ({ ...prev, durations: { ...prev.durations, [service]: val } }));
  }

  function updateBuffer(service: string, val: number) {
    setConfig((prev) => ({ ...prev, buffer_minutes: { ...prev.buffer_minutes, [service]: val } }));
  }

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><Spinner size="lg" /></div>;
  }

  if (error) {
    return <ErrorState message={(error as Error).message} onRetry={refetch} />;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Left sub-nav */}
      <div className="w-56 shrink-0 border-r border-slate-200 bg-white flex flex-col py-4">
        <div className="px-4 mb-3">
          <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Configuration</p>
        </div>
        {NAV_SECTIONS.map((s) => (
          <button
            key={s.id}
            onClick={() => setActiveSection(s.id)}
            className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors ${
              activeSection === s.id
                ? 'text-brand-600 bg-brand-50 border-r-2 border-brand-500'
                : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
              <Link to="/settings/calendars" className="hover:text-slate-700">Calendars</Link>
              <ChevronRight size={13} />
              <span className="text-slate-800 font-medium">{displayName}</span>
            </div>
            <h1 className="text-base font-bold text-slate-800">{NAV_SECTIONS.find((s) => s.id === activeSection)?.label}</h1>
          </div>
          <button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
            className="btn-primary"
          >
            {mutation.isPending ? <Spinner size="sm" /> : <Save size={15} />}
            Save Changes
          </button>
        </div>

        <div className="p-6 space-y-6 max-w-3xl">
          {/* ── Store Details ── */}
          {activeSection === 'store' && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Branch Name</label>
                  <input className="input" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
                </div>
                <div>
                  <label className="label">Location</label>
                  <input className="input" value={location} onChange={(e) => setLocation(e.target.value)} />
                </div>
                <div>
                  <label className="label">Timezone</label>
                  <input className="input" value={config.timezone} onChange={(e) => setConfig((p) => ({ ...p, timezone: e.target.value }))} placeholder="Africa/Johannesburg" />
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4">
                <h3 className="text-sm font-semibold text-slate-700 mb-3">Contact & Address</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Phone Number</label>
                    <input
                      className="input"
                      value={config.contact?.phone ?? ''}
                      onChange={(e) => setConfig((p) => ({ ...p, contact: { ...p.contact, phone: e.target.value } }))}
                      placeholder="+27 31 000 0000"
                    />
                  </div>
                  <div>
                    <label className="label">Google Maps URL</label>
                    <input
                      className="input"
                      value={config.contact?.google_maps_url ?? ''}
                      onChange={(e) => setConfig((p) => ({ ...p, contact: { ...p.contact, google_maps_url: e.target.value } }))}
                      placeholder="https://maps.google.com/…"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="label">Physical Address</label>
                    <input
                      className="input"
                      value={config.contact?.address ?? ''}
                      onChange={(e) => setConfig((p) => ({ ...p, contact: { ...p.contact, address: e.target.value } }))}
                      placeholder="123 Main Rd, Durban North, 4051"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="label">Directions / Getting There</label>
                    <textarea
                      className="input resize-none h-20"
                      value={config.contact?.directions ?? ''}
                      onChange={(e) => setConfig((p) => ({ ...p, contact: { ...p.contact, directions: e.target.value } }))}
                      placeholder="Turn left at the traffic light, we're on the second floor above…"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4">
                <label className="label">Custom Confirmation Note</label>
                <textarea
                  className="input resize-none h-20"
                  value={config.custom_confirmation_note ?? ''}
                  onChange={(e) => setConfig((p) => ({ ...p, custom_confirmation_note: e.target.value }))}
                  placeholder="Please arrive 10 minutes early and bring your ID…"
                />
              </div>
            </div>
          )}

          {/* ── Opening Hours ── */}
          {activeSection === 'hours' && (
            <div className="card overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider w-28">Day</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Open</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Close</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider w-24">Closed</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {DAYS.map((day) => {
                    const dh = config.hours[day] ?? { open: '08:30', close: '17:00', closed: false };
                    return (
                      <tr key={day} className={dh.closed ? 'opacity-50' : ''}>
                        <td className="px-4 py-3 font-medium text-slate-700 capitalize">{day}</td>
                        <td className="px-4 py-3">
                          <input
                            type="time"
                            value={dh.open}
                            onChange={(e) => updateDay(day, 'open', e.target.value)}
                            disabled={dh.closed}
                            className="input w-32"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="time"
                            value={dh.close}
                            onChange={(e) => updateDay(day, 'close', e.target.value)}
                            disabled={dh.closed}
                            className="input w-32"
                          />
                        </td>
                        <td className="px-4 py-3 text-center">
                          <input
                            type="checkbox"
                            checked={dh.closed}
                            onChange={(e) => updateDay(day, 'closed', e.target.checked)}
                            className="w-4 h-4 rounded border-slate-300 text-brand-500 focus:ring-brand-500 cursor-pointer"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* ── Services & Durations ── */}
          {activeSection === 'services' && (
            <div className="space-y-4">
              <div className="flex gap-2 mb-2">
                <input
                  id="new-service-input"
                  className="input flex-1"
                  placeholder="Add service key (e.g. free_screening)"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const val = (e.target as HTMLInputElement).value.trim();
                      if (val && !config.services_offered.includes(val)) {
                        toggleService(val, true);
                        (e.target as HTMLInputElement).value = '';
                      }
                    }
                  }}
                />
              </div>
              <div className="card overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase w-8">On</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Service</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Duration (min)</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Buffer (min)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {config.services_offered.length === 0 ? (
                      <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-400 text-sm">No services yet — type a service name above and press Enter.</td></tr>
                    ) : config.services_offered.map((svc) => (
                      <tr key={svc}>
                        <td className="px-4 py-3">
                          <input type="checkbox" checked readOnly className="w-4 h-4 text-brand-500" />
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-700 capitalize">{svc.replace(/_/g, ' ')}</td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            min={5}
                            max={480}
                            step={5}
                            value={config.durations[svc] ?? 30}
                            onChange={(e) => updateDuration(svc, Number(e.target.value))}
                            className="input w-24"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            min={0}
                            max={120}
                            step={5}
                            value={config.buffer_minutes[svc] ?? 0}
                            onChange={(e) => updateBuffer(svc, Number(e.target.value))}
                            className="input w-24"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── Capacity ── */}
          {activeSection === 'capacity' && (
            <div className="card p-6 space-y-5">
              <div>
                <label className="label">Max Simultaneous Appointments</label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={config.concurrent_appointments}
                  onChange={(e) => setConfig((p) => ({ ...p, concurrent_appointments: Number(e.target.value) }))}
                  className="input w-40"
                />
              </div>
              <div>
                <label className="label">Minimum Advance Booking Notice (hours)</label>
                <input
                  type="number"
                  min={0}
                  max={720}
                  value={config.min_advance_hours}
                  onChange={(e) => setConfig((p) => ({ ...p, min_advance_hours: Number(e.target.value) }))}
                  className="input w-40"
                />
              </div>
              <div>
                <label className="label">Maximum Advance Booking Window (days)</label>
                <input
                  type="number"
                  min={1}
                  max={365}
                  value={config.max_advance_days}
                  onChange={(e) => setConfig((p) => ({ ...p, max_advance_days: Number(e.target.value) }))}
                  className="input w-40"
                />
              </div>
            </div>
          )}

          {/* ── Closures & Breaks ── */}
          {activeSection === 'closures' && (
            <div className="space-y-6">
              {/* Closed Dates */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-slate-700">Closed Dates</h3>
                  <button
                    onClick={() =>
                      setConfig((p) => ({
                        ...p,
                        closed_dates: [...p.closed_dates, { date: '', reason: '' }],
                      }))
                    }
                    className="btn-secondary text-xs py-1.5 px-3"
                  >
                    <Plus size={12} />
                    Add Date
                  </button>
                </div>
                <div className="card overflow-hidden divide-y divide-slate-100">
                  {config.closed_dates.length === 0 ? (
                    <p className="text-center text-slate-400 text-sm py-8">No closed dates set.</p>
                  ) : (
                    config.closed_dates.map((cd, i) => (
                      <div key={i} className="flex items-center gap-3 px-4 py-3">
                        <input
                          type="date"
                          value={cd.date}
                          onChange={(e) => {
                            const next = [...config.closed_dates];
                            next[i] = { ...next[i], date: e.target.value };
                            setConfig((p) => ({ ...p, closed_dates: next }));
                          }}
                          className="input w-40"
                        />
                        <input
                          type="text"
                          placeholder="Reason (e.g. Christmas Day)"
                          value={cd.reason}
                          onChange={(e) => {
                            const next = [...config.closed_dates];
                            next[i] = { ...next[i], reason: e.target.value };
                            setConfig((p) => ({ ...p, closed_dates: next }));
                          }}
                          className="input flex-1"
                        />
                        <button
                          onClick={() =>
                            setConfig((p) => ({
                              ...p,
                              closed_dates: p.closed_dates.filter((_, j) => j !== i),
                            }))
                          }
                          className="text-slate-400 hover:text-red-500 transition-colors"
                          aria-label="Remove"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Daily Breaks */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-slate-700">Daily Breaks</h3>
                  <button
                    onClick={() =>
                      setConfig((p) => ({
                        ...p,
                        daily_breaks: [...p.daily_breaks, { name: '', start: '13:00', end: '14:00', recurring: true, day: 'monday' }],
                      }))
                    }
                    className="btn-secondary text-xs py-1.5 px-3"
                  >
                    <Plus size={12} />
                    Add Break
                  </button>
                </div>
                <div className="card overflow-hidden divide-y divide-slate-100">
                  {config.daily_breaks.length === 0 ? (
                    <p className="text-center text-slate-400 text-sm py-8">No daily breaks set.</p>
                  ) : (
                    config.daily_breaks.map((br, i) => (
                      <div key={i} className="flex flex-wrap items-center gap-3 px-4 py-3">
                        <input
                          type="text"
                          placeholder="Break name"
                          value={br.name}
                          onChange={(e) => {
                            const next = [...config.daily_breaks];
                            next[i] = { ...next[i], name: e.target.value };
                            setConfig((p) => ({ ...p, daily_breaks: next }));
                          }}
                          className="input w-36"
                        />
                        <select
                          value={br.day}
                          onChange={(e) => {
                            const next = [...config.daily_breaks];
                            next[i] = { ...next[i], day: e.target.value };
                            setConfig((p) => ({ ...p, daily_breaks: next }));
                          }}
                          className="select w-32"
                        >
                          {DAYS.map((d) => <option key={d} value={d} className="capitalize">{d}</option>)}
                        </select>
                        <input type="time" value={br.start} onChange={(e) => { const n=[...config.daily_breaks]; n[i]={...n[i],start:e.target.value}; setConfig((p)=>({...p,daily_breaks:n})); }} className="input w-28" />
                        <input type="time" value={br.end} onChange={(e) => { const n=[...config.daily_breaks]; n[i]={...n[i],end:e.target.value}; setConfig((p)=>({...p,daily_breaks:n})); }} className="input w-28" />
                        <label className="flex items-center gap-1.5 text-xs text-slate-500 cursor-pointer">
                          <input type="checkbox" checked={br.recurring} onChange={(e) => { const n=[...config.daily_breaks]; n[i]={...n[i],recurring:e.target.checked}; setConfig((p)=>({...p,daily_breaks:n})); }} className="w-3.5 h-3.5" />
                          Recurring
                        </label>
                        <button onClick={() => setConfig((p) => ({ ...p, daily_breaks: p.daily_breaks.filter((_, j) => j !== i) }))} className="text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={15} /></button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── Time Blocks ── */}
          {activeSection === 'timeblocks' && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-slate-700">Time Blocks</h3>
                <button
                  onClick={() =>
                    setConfig((p) => ({
                      ...p,
                      time_blocks: [...p.time_blocks, {
                        test_type: config.services_offered[0] ?? '',
                        start: '10:00',
                        end: '11:00',
                        recurring: true,
                        day: 'monday',
                      }],
                    }))
                  }
                  className="btn-secondary text-xs py-1.5 px-3"
                >
                  <Plus size={12} />
                  Add Block
                </button>
              </div>
              <div className="card overflow-hidden divide-y divide-slate-100">
                {config.time_blocks.length === 0 ? (
                  <p className="text-center text-slate-400 text-sm py-8">No time blocks set.</p>
                ) : (
                  config.time_blocks.map((tb, i) => (
                    <div key={i} className="flex flex-wrap items-center gap-3 px-4 py-3">
                      <select
                        value={tb.test_type}
                        onChange={(e) => { const n=[...config.time_blocks]; n[i]={...n[i],test_type:e.target.value}; setConfig((p)=>({...p,time_blocks:n})); }}
                        className="select w-44"
                      >
                        {config.services_offered.map((s) => <option key={s} value={s}>{s.replace(/_/g,' ')}</option>)}
                      </select>
                      <select
                        value={tb.day}
                        onChange={(e) => { const n=[...config.time_blocks]; n[i]={...n[i],day:e.target.value}; setConfig((p)=>({...p,time_blocks:n})); }}
                        className="select w-32"
                      >
                        {DAYS.map((d) => <option key={d} value={d} className="capitalize">{d}</option>)}
                      </select>
                      <input type="time" value={tb.start} onChange={(e) => { const n=[...config.time_blocks]; n[i]={...n[i],start:e.target.value}; setConfig((p)=>({...p,time_blocks:n})); }} className="input w-28" />
                      <input type="time" value={tb.end} onChange={(e) => { const n=[...config.time_blocks]; n[i]={...n[i],end:e.target.value}; setConfig((p)=>({...p,time_blocks:n})); }} className="input w-28" />
                      <label className="flex items-center gap-1.5 text-xs text-slate-500 cursor-pointer">
                        <input type="checkbox" checked={tb.recurring} onChange={(e) => { const n=[...config.time_blocks]; n[i]={...n[i],recurring:e.target.checked}; setConfig((p)=>({...p,time_blocks:n})); }} className="w-3.5 h-3.5" />
                        Recurring
                      </label>
                      <button onClick={() => setConfig((p) => ({ ...p, time_blocks: p.time_blocks.filter((_, j) => j !== i) }))} className="text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={15} /></button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
