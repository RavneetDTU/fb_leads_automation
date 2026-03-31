import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { leadsService } from '../../../services/leads';
import { formatDate } from '../helpers';

export function NotesTab({ leadId }) {
  const [notes, setNotes] = useState([]);
  const [notesLoading, setNotesLoading] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [notesSaving, setNotesSaving] = useState(false);
  const [isReminder, setIsReminder] = useState(false);

  useEffect(() => {
    fetchNotes();
  }, [leadId]);

  const fetchNotes = async () => {
    setNotesLoading(true);
    try {
      const data = await leadsService.getLeadNotes(leadId);
      setNotes(data);
    } catch (err) {
      console.error('Failed to load notes:', err);
      setNotes([]);
    } finally {
      setNotesLoading(false);
    }
  };

  const handleSaveNote = async () => {
    if (!noteText.trim()) return;
    setNotesSaving(true);
    try {
      await leadsService.addLeadNote(leadId, noteText.trim());
      setNoteText('');
      await fetchNotes();
    } catch (err) {
      console.error('Failed to save note:', err);
      alert('Failed to save note. Please try again.');
    } finally {
      setNotesSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="bg-blue-50 border border-blue-200 rounded-md px-4 py-3">
        <p className="text-sm text-blue-700">
          <span className="font-semibold">Note:</span> For staff Only. These notes/reminders are only for staff and will not send any email to patients. This will send email to staff only.
        </p>
      </div>

      <div className="space-y-2">
        <textarea
          placeholder="Type your message here..."
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          rows={6}
          className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:border-slate-400 focus-visible:ring-[3px] focus-visible:ring-[rgba(0,0,0,0.08)] resize-none"
        />
      </div>

      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={isReminder}
            onChange={(e) => setIsReminder(e.target.checked)}
            className="w-4 h-4 rounded border-border text-foreground focus:ring-2 focus:ring-[rgba(0,0,0,0.08)]"
          />
          <span className="text-foreground">Is reminder</span>
        </label>
        <button
          type="button"
          onClick={handleSaveNote}
          disabled={notesSaving || !noteText.trim()}
          className="px-4 py-2 border border-border rounded-md bg-foreground text-background cursor-pointer transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {notesSaving && <Loader2 className="w-4 h-4 animate-spin" />}
          Save note
        </button>
      </div>

      {/* Notes Table */}
      <div className="border border-border rounded-md overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-muted/30 border-b border-border">
              <th className="text-left px-4 py-3 text-sm font-medium text-foreground w-16">#</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-foreground">Content</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-foreground w-48">Updated At</th>
            </tr>
          </thead>
          <tbody>
            {notesLoading ? (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-sm text-muted-foreground">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading notes…
                  </div>
                </td>
              </tr>
            ) : notes.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-sm text-muted-foreground">
                  No notes available
                </td>
              </tr>
            ) : (
              notes.map((note) => (
                <tr key={note.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 text-sm text-muted-foreground">{note.note_number}</td>
                  <td className="px-4 py-3 text-sm text-foreground">{note.content}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{formatDate(note.updated_at)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <a href="#" className="text-sm text-blue-600 hover:underline inline-block">
        View Sent Reminders History
      </a>
    </div>
  );
}
