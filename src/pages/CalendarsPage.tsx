import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Plus, Settings, Trash2, ExternalLink } from 'lucide-react';
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
      toast('success', 'Calendar created. Starting Google authorization…');
      // Fetch the OAuth URL and open in popup
      try {
        const authRes = await get<{ url: string }>(
          `/api/calendars/auth/url?calendar_id=${res.id}`, token!
        );
        window.open(authRes.url, 'google-oauth', 'width=500,height=600');
        // Refresh calendars after a short delay to pick up connection status
        setTimeout(() => qc.invalidateQueries({ queryKey: ['calendars'] }), 3000);
      } catch {
        toast('warning', 'Calendar created but could not open OAuth window. Go to the calendar settings to connect.');
      }
    },
    onError: (err: Error) => toast('error', `Failed to create calendar: ${err.message}`),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => del<void>(`/api/calendars/${id}`, token!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['calendars'] });
      setDeleteTarget(null);
      toast('success', 'Calendar removed.');
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
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Calendar Settings</h1>
          <p className="text-sm text-slate-500 mt-0.5">Connect Google Calendars for each store branch.</p>
        </div>
        <button onClick={() => setAddOpen(true)} className="btn-primary">
          <Plus size={15} />
          Add Calendar
        </button>
      </div>

      {/* Calendar grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : error ? (
        <ErrorState message={(error as Error).message} onRetry={refetch} />
      ) : (data ?? []).length === 0 ? (
        <EmptyState
          title="No calendars connected"
          description='Click "Add Calendar" to connect a Google Calendar for a store branch.'
          action={
            <button onClick={() => setAddOpen(true)} className="btn-primary">
              <Plus size={15} />
              Add Calendar
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {(data ?? []).map((cal) => (
            <div key={cal.id} className="card p-5 space-y-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-slate-800">{cal.display_name}</h3>
                  <p className="text-sm text-slate-500">{cal.location}</p>
                </div>
                <ConnectionBadge connected={cal.is_connected} />
              </div>

              {cal.google_calendar_id && (
                <p className="text-xs text-slate-400 font-mono truncate">{cal.google_calendar_id}</p>
              )}

              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => navigate(`/settings/calendars/${cal.id}`)}
                  className="btn-secondary flex-1 justify-center"
                  aria-label={`Configure ${cal.display_name}`}
                >
                  <Settings size={14} />
                  Configure
                </button>
                {!cal.is_connected && (
                  <button
                    onClick={() => handleReconnect(cal)}
                    className="btn-secondary px-3"
                    aria-label="Reconnect Google Calendar"
                    title="Reconnect via Google OAuth"
                  >
                    <ExternalLink size={14} />
                  </button>
                )}
                <button
                  onClick={() => setDeleteTarget(cal)}
                  className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                  aria-label={`Delete ${cal.display_name}`}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Calendar modal */}
      <Modal
        open={addOpen}
        onClose={() => { setAddOpen(false); setNewName(''); setNewLocation(''); }}
        title="Add Calendar"
        subtitle="Connect a Google Calendar for a store branch"
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
              Connect & Authorize
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
            <label className="label">Location</label>
            <input
              className="input"
              placeholder="e.g. Durban North"
              value={newLocation}
              onChange={(e) => setNewLocation(e.target.value)}
            />
          </div>
          <p className="text-xs text-slate-400">
            After clicking "Connect & Authorize", a Google sign-in window will open. Allow calendar access to complete setup.
          </p>
        </div>
      </Modal>

      {/* Delete confirmation modal */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Remove Calendar"
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
              Remove
            </button>
          </>
        }
      >
        <p className="text-sm text-slate-600">
          Are you sure you want to remove <strong>{deleteTarget?.display_name}</strong>? This cannot be undone.
        </p>
      </Modal>
    </div>
  );
}
