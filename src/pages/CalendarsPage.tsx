import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Plus, Settings, Trash2, ExternalLink, MapPin, Calendar as CalendarIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { get, post, del } from '../lib/api';
import type { CalendarResponse } from '../types';
import { ConnectionBadge } from '../components/ui/Badge';
import { Spinner, CardSkeleton } from '../components/ui/Spinner';
import { ErrorState, EmptyState } from '../components/ui/States';
import { Modal } from '../components/ui/Modal';

export function CalendarsPage() {
  const { token } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [addOpen, setAddOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<CalendarResponse | null>(null);
  const [newName, setNewName] = useState('');
  const [newLocation, setNewLocation] = useState('');

  const { data, isLoading, error, refetch } = useQuery<CalendarResponse[]>({
    queryKey: ['calendars'],
    queryFn: () => get<CalendarResponse[]>('/api/calendars', token!),
    enabled: !!token,
  });

  const createMutation = useMutation({
    mutationFn: () =>
      post<{ id: number; display_name: string; location: string; auth_url: string }>(
        '/api/calendars', token!, { display_name: newName.trim(), location: newLocation.trim() }
      ),
    onSuccess: async (res) => {
      qc.invalidateQueries({ queryKey: ['calendars'] });
      setAddOpen(false);
      setNewName('');
      setNewLocation('');
      toast('success', 'Branch created. Starting Google authorization…');
      try {
        const authRes = await get<{ url: string }>(
          `/api/calendars/auth/url?calendar_id=${res.id}`, token!
        );
        window.open(authRes.url, 'google-oauth', 'width=500,height=600');
        setTimeout(() => qc.invalidateQueries({ queryKey: ['calendars'] }), 3000);
      } catch {
        toast('warning', 'Branch created. Re-connect via branch settings if popup blocked.');
      }
    },
    onError: (err: Error) => toast('error', `Failed to create branch: ${err.message}`),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => del<void>(`/api/calendars/${id}`, token!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['calendars'] });
      setDeleteTarget(null);
      toast('success', 'Branch removed.');
    },
    onError: (err: Error) => toast('error', `Failed to delete: ${err.message}`),
  });

  async function handleReconnect(cal: CalendarResponse) {
    try {
      const authRes = await get<{ url: string }>(
        `/api/calendars/auth/url?calendar_id=${cal.id}`, token!
      );
      window.open(authRes.url, 'google-oauth', 'width=500,height=600');
      setTimeout(() => qc.invalidateQueries({ queryKey: ['calendars'] }), 3000);
    } catch (err) {
      toast('error', `Failed to get OAuth URL: ${(err as Error).message}`);
    }
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
            <span>Dashboard</span>
            <span>/</span>
            <span className="text-indigo-600">Store Branches & Calendars</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Store Branch Management</h1>
          <p className="text-xs text-slate-500 mt-0.5">Connect Google Calendars and configure store availability for automated bookings.</p>
        </div>
        <button onClick={() => setAddOpen(true)} className="btn-primary">
          <Plus size={16} />
          + Add Store Branch
        </button>
      </div>

      {/* Calendar / Branch Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : error ? (
        <ErrorState message={(error as Error).message} onRetry={refetch} />
      ) : (data ?? []).length === 0 ? (
        <EmptyState
          title="No store branches added"
          description='Click "+ Add Store Branch" to link a Google Calendar for automated AI appointment booking.'
          action={
            <button onClick={() => setAddOpen(true)} className="btn-primary">
              <Plus size={16} />
              + Add Store Branch
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {(data ?? []).map((cal) => (
            <div key={cal.id} className="card p-6 flex flex-col justify-between space-y-4 hover:border-indigo-300 hover:shadow-elevated transition-all duration-150 bg-white">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100 shrink-0">
                      <CalendarIcon size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm leading-snug">{cal.display_name}</h3>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5 font-medium">
                        <MapPin size={12} className="text-indigo-500" />
                        {cal.location}
                      </p>
                    </div>
                  </div>
                  <ConnectionBadge connected={cal.is_connected} />
                </div>

                {cal.google_calendar_id && (
                  <div className="px-3 py-2 rounded-lg bg-slate-50 border border-slate-200/80">
                    <p className="text-[11px] text-slate-400 font-mono truncate">{cal.google_calendar_id}</p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                <button
                  onClick={() => navigate(`/settings/calendars/${cal.id}`)}
                  className="btn-primary flex-1 justify-center py-2 text-xs"
                  aria-label={`Configure ${cal.display_name}`}
                >
                  <Settings size={14} />
                  Configure Branch
                </button>
                {!cal.is_connected && (
                  <button
                    onClick={() => handleReconnect(cal)}
                    className="btn-secondary px-3 py-2 text-xs"
                    aria-label="Reconnect Google Calendar"
                    title="Authorize via Google OAuth"
                  >
                    <ExternalLink size={14} />
                  </button>
                )}
                <button
                  onClick={() => setDeleteTarget(cal)}
                  className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-colors"
                  aria-label={`Delete ${cal.display_name}`}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Branch Modal */}
      <Modal
        open={addOpen}
        onClose={() => { setAddOpen(false); setNewName(''); setNewLocation(''); }}
        title="Add Store Branch"
        subtitle="Link a new Google Calendar for automated AI appointments"
        maxWidth="sm"
        footer={
          <>
            <button onClick={() => setAddOpen(false)} className="btn-secondary">Cancel</button>
            <button
              onClick={() => createMutation.mutate()}
              disabled={!newName.trim() || !newLocation.trim() || createMutation.isPending}
              className="btn-primary"
            >
              {createMutation.isPending ? <Spinner size="sm" /> : null}
              Authorize Branch
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="label">Branch Name</label>
            <input
              className="input"
              placeholder="e.g. Durban North Branch"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              autoFocus
            />
          </div>
          <div>
            <label className="label">Location Name</label>
            <input
              className="input"
              placeholder="e.g. Durban North"
              value={newLocation}
              onChange={(e) => setNewLocation(e.target.value)}
            />
          </div>
          <p className="text-xs text-slate-500">
            A Google OAuth popup will open to grant calendar read/write access.
          </p>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Remove Store Branch"
        maxWidth="sm"
        footer={
          <>
            <button onClick={() => setDeleteTarget(null)} className="btn-secondary">Cancel</button>
            <button
              onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
              disabled={deleteMutation.isPending}
              className="btn-danger"
            >
              {deleteMutation.isPending ? <Spinner size="sm" /> : null}
              Remove Branch
            </button>
          </>
        }
      >
        <p className="text-sm text-slate-600">
          Are you sure you want to remove <strong>{deleteTarget?.display_name}</strong>? AI booking for this location will be disabled.
        </p>
      </Modal>
    </div>
  );
}
