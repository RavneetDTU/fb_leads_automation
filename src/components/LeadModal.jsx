import React, { useState, useEffect } from 'react';
import { X, Info, Loader2 } from 'lucide-react';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { leadsService } from '../services/leads';

export function LeadModal({ lead, onClose }) {
  const [activeTab, setActiveTab] = useState('basic');

  // ── Basic Info state ──
  const [formData, setFormData] = useState({
    branchName: '',
    status: '',
    name: '',
    email: '',
    phone: '',
    city: '',
  });
  const [detailLoading, setDetailLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState(''); // success / error feedback

  // ── Notes state ──
  const [notes, setNotes] = useState([]);
  const [notesLoading, setNotesLoading] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [notesSaving, setNotesSaving] = useState(false);
  const [isReminder, setIsReminder] = useState(false);

  // ── Questions / Answers state ──
  const [questions, setQuestions] = useState({
    crowdedSituations: '',
    peopleMumble: '',
    watchFaces: '',
    howCanWeHelp: '',
    benefitCheck: false,
    audiogram: false,
    bookAppointment: false,
  });
  const [answersLoading, setAnswersLoading] = useState(false);
  const [answersSaving, setAnswersSaving] = useState(false);
  const [answersSaveMsg, setAnswersSaveMsg] = useState('');

  // ── Whatsapp state ──
  const [whatsappMessage, setWhatsappMessage] = useState('');

  // Static data
  const callData = [
    {
      agent: '2733',
      description: '3CX PhoneSystem Call',
      callDate: '2025/07/08 10:56',
      duration: '02:48',
      type: 'Outbound',
      recordingLink: 'Listen',
    },
  ];

  const tabs = [
    { id: 'basic', label: 'Basic Info' },
    { id: 'notes', label: 'Notes' },
    { id: 'calls', label: 'Calls' },
    { id: 'whatsapp', label: 'Whatsapp' },
    { id: 'questions', label: 'Questions' },
  ];

  // ─── Fetch lead detail on mount ───
  useEffect(() => {
    const fetchDetail = async () => {
      setDetailLoading(true);
      try {
        const data = await leadsService.getLeadDetail(lead.id);
        setFormData({
          branchName: data.branch_name || '',
          status: data.status || '',
          name: data.name || '',
          email: data.email || '',
          phone: data.phone_number || '',
          city: data.city || '',
        });
      } catch (err) {
        console.error('Failed to load lead detail:', err);
        // Fallback to whatever the parent passed
        setFormData({
          branchName: '',
          status: '',
          name: lead.name || '',
          email: '',
          phone: lead.phone || '',
          city: '',
        });
      } finally {
        setDetailLoading(false);
      }
    };
    fetchDetail();
  }, [lead.id]);

  // ─── Fetch notes on mount ───
  useEffect(() => {
    fetchNotes();
  }, [lead.id]);

  const fetchNotes = async () => {
    setNotesLoading(true);
    try {
      const data = await leadsService.getLeadNotes(lead.id);
      setNotes(data);
    } catch (err) {
      console.error('Failed to load notes:', err);
      setNotes([]);
    } finally {
      setNotesLoading(false);
    }
  };

  // ─── Fetch answers on mount ───
  useEffect(() => {
    const fetchAnswers = async () => {
      setAnswersLoading(true);
      try {
        const data = await leadsService.getLeadAnswers(lead.id);
        setQuestions((prev) => ({
          ...prev,
          crowdedSituations: data.difficulty_crowded ? 'yes' : data.difficulty_crowded === false ? 'no' : '',
          peopleMumble: data.mumble_or_muffled ? 'yes' : data.mumble_or_muffled === false ? 'no' : '',
          watchFaces: data.watch_face ? 'yes' : data.watch_face === false ? 'no' : '',
        }));
      } catch (err) {
        console.error('Failed to load answers:', err);
      } finally {
        setAnswersLoading(false);
      }
    };
    fetchAnswers();
  }, [lead.id]);

  // ─── Save basic-info handler ───
  const handleSave = async () => {
    setSaving(true);
    setSaveMsg('');
    try {
      await leadsService.updateLeadDetail(lead.id, {
        branch_name: formData.branchName,
        status: formData.status,
        name: formData.name,
        email: formData.email,
        phone_number: formData.phone,
        city: formData.city,
      });
      setSaveMsg('Saved successfully!');
      setTimeout(() => setSaveMsg(''), 3000);
    } catch (err) {
      console.error('Failed to save lead detail:', err);
      setSaveMsg('Failed to save. Please try again.');
      setTimeout(() => setSaveMsg(''), 4000);
    } finally {
      setSaving(false);
    }
  };

  // ─── Save note handler ───
  const handleSaveNote = async () => {
    if (!noteText.trim()) return;
    setNotesSaving(true);
    try {
      await leadsService.addLeadNote(lead.id, noteText.trim());
      setNoteText('');
      await fetchNotes(); // refresh list
    } catch (err) {
      console.error('Failed to save note:', err);
      alert('Failed to save note. Please try again.');
    } finally {
      setNotesSaving(false);
    }
  };

  // ─── Save answers handler ───
  const handleSaveAnswers = async () => {
    setAnswersSaving(true);
    setAnswersSaveMsg('');
    try {
      await leadsService.updateLeadAnswers(lead.id, {
        difficulty_crowded: questions.crowdedSituations === 'yes',
        mumble_or_muffled: questions.peopleMumble === 'yes',
        watch_face: questions.watchFaces === 'yes',
      });
      setAnswersSaveMsg('Answers saved!');
      setTimeout(() => setAnswersSaveMsg(''), 3000);
    } catch (err) {
      console.error('Failed to save answers:', err);
      setAnswersSaveMsg('Failed to save answers.');
      setTimeout(() => setAnswersSaveMsg(''), 4000);
    } finally {
      setAnswersSaving(false);
    }
  };

  // ─── Helper: format date for display ───
  const formatDate = (iso) => {
    if (!iso) return '';
    try {
      return new Date(iso).toLocaleString();
    } catch {
      return iso;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-[0_8px_24px_rgba(0,0,0,0.15)] w-full max-w-3xl flex flex-col" style={{ height: '85vh' }}>
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-border flex-shrink-0">
          <div>
            <h2 className="text-xl font-heading font-semibold text-foreground">Edit Lead</h2>
            <p className="text-sm text-muted-foreground mt-0.5">Update lead details</p>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Info Banner */}
        <div className="px-6 pt-[12px] flex-shrink-0 pr-[24px] pb-[0px] pl-[24px]">
          <div className="flex items-start gap-2 text-sm text-blue-700 bg-blue-50 border border-blue-200 rounded-md px-3 py-2.5">
            <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>Fields marked with * are required</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-6 pt-[12px] flex-shrink-0 pr-[24px] pb-[0px] pl-[24px]">
          <div className="flex gap-1 border-b border-border">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 text-sm font-medium transition-all duration-150 border-b-2 -mb-px cursor-pointer ${activeTab === tab.id
                  ? 'border-foreground text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content - Fixed height with scroll */}
        <div className="flex-1 overflow-y-auto px-6 py-5 min-h-0">

          {/* ═══════ BASIC INFO TAB ═══════ */}
          {activeTab === 'basic' && (
            <div className="space-y-5">
              {detailLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  <span className="ml-2 text-sm text-muted-foreground">Loading lead details…</span>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="branchName">Branch Name</Label>
                      <Input
                        id="branchName"
                        value={formData.branchName}
                        onChange={(e) => setFormData({ ...formData, branchName: e.target.value })}
                        className="bg-white border-border focus-visible:border-slate-400 focus-visible:ring-[rgba(0,0,0,0.08)]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
                      <Input
                        id="status"
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className="bg-white border-border focus-visible:border-slate-400 focus-visible:ring-[rgba(0,0,0,0.08)]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="bg-white border-border focus-visible:border-slate-400 focus-visible:ring-[rgba(0,0,0,0.08)]"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="bg-white border-border focus-visible:border-slate-400 focus-visible:ring-[rgba(0,0,0,0.08)]"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone *</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="bg-white border-border focus-visible:border-slate-400 focus-visible:ring-[rgba(0,0,0,0.08)]"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="bg-white border-border focus-visible:border-slate-400 focus-visible:ring-[rgba(0,0,0,0.08)]"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ═══════ NOTES TAB ═══════ */}
          {activeTab === 'notes' && (
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
          )}

          {/* ═══════ CALLS TAB ═══════ */}
          {activeTab === 'calls' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Show</span>
                  <select className="h-9 rounded-md border border-border bg-white px-3 py-1 text-sm focus-visible:outline-none focus-visible:border-slate-400 focus-visible:ring-[3px] focus-visible:ring-[rgba(0,0,0,0.08)]">
                    <option value="10">10</option>
                    <option value="25">25</option>
                    <option value="50">50</option>
                  </select>
                </div>
                <Input
                  type="search"
                  placeholder="Search"
                  className="max-w-xs bg-white border-border focus-visible:border-slate-400 focus-visible:ring-[rgba(0,0,0,0.08)]"
                />
              </div>

              {/* Calls Table */}
              <div className="border border-border rounded-md overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-muted/30 border-b border-border">
                      <th className="text-left px-4 py-3 text-sm font-medium text-foreground">Agent</th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-foreground">Description</th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-foreground">Call Date</th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-foreground">Call Duration</th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-foreground">Call Type</th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-foreground">Recording Link</th>
                    </tr>
                  </thead>
                  <tbody>
                    {callData.map((call, index) => (
                      <tr key={index} className="border-b border-border last:border-0">
                        <td className="px-4 py-3 text-sm text-muted-foreground">{call.agent}</td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">{call.description}</td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">{call.callDate}</td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">{call.duration}</td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">{call.type}</td>
                        <td className="px-4 py-3 text-sm">
                          <a href="#" className="text-blue-600 hover:underline">{call.recordingLink}</a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Showing 1 to 1 of 1 entries</span>
                <div className="flex items-center gap-2">
                  <button className="px-3 py-1.5 border border-border rounded-md text-muted-foreground hover:bg-muted/20 transition-colors">
                    Previous
                  </button>
                  <button className="px-3 py-1.5 border border-foreground bg-foreground text-background rounded-md">
                    1
                  </button>
                  <button className="px-3 py-1.5 border border-border rounded-md text-muted-foreground hover:bg-muted/20 transition-colors">
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ═══════ WHATSAPP TAB ═══════ */}
          {activeTab === 'whatsapp' && (
            <div className="flex flex-col h-full">
              {/* Chat History Area (Empty for now) */}
              <div className="flex-1 overflow-y-auto mb-4">
                {/* Messages would go here */}
              </div>

              {/* Message Input */}
              <div className="flex gap-2 items-end pt-3 border-t border-border">
                <div className="flex-1">
                  <textarea
                    placeholder="Type a message..."
                    value={whatsappMessage}
                    onChange={(e) => setWhatsappMessage(e.target.value)}
                    rows={1}
                    className="w-full rounded-full border border-border bg-white px-4 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:border-slate-400 focus-visible:ring-[3px] focus-visible:ring-[rgba(0,0,0,0.08)] resize-none overflow-hidden min-h-[40px]"
                    style={{ height: '42px' }}
                  />
                </div>
                <button
                  type="button"
                  className="px-4 py-2 bg-foreground text-background cursor-pointer rounded-full hover:opacity-90 transition-opacity text-sm font-medium h-[42px]"
                >
                  Send
                </button>
              </div>
            </div>
          )}

          {/* ═══════ QUESTIONS TAB ═══════ */}
          {activeTab === 'questions' && (
            <div className="space-y-5">
              {answersLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  <span className="ml-2 text-sm text-muted-foreground">Loading answers…</span>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="crowdedSituations">Do you have difficulty in crowed or noisy situations?</Label>
                    <div className="flex items-center gap-2">
                      <select
                        id="crowdedSituations"
                        value={questions.crowdedSituations}
                        onChange={(e) => setQuestions({ ...questions, crowdedSituations: e.target.value })}
                        className="flex h-9 w-40 rounded-md border border-border bg-white px-3 py-1 text-sm transition-colors focus-visible:outline-none focus-visible:border-slate-400 focus-visible:ring-[3px] focus-visible:ring-[rgba(0,0,0,0.08)]"
                      >
                        <option value="">Select</option>
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                      </select>
                      {questions.crowdedSituations && (
                        <span className="text-emerald-500">✓</span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="peopleMumble">Do you think that other people mumble or sound muffled?</Label>
                    <div className="flex items-center gap-2">
                      <select
                        id="peopleMumble"
                        value={questions.peopleMumble}
                        onChange={(e) => setQuestions({ ...questions, peopleMumble: e.target.value })}
                        className="flex h-9 w-40 rounded-md border border-border bg-white px-3 py-1 text-sm transition-colors focus-visible:outline-none focus-visible:border-slate-400 focus-visible:ring-[3px] focus-visible:ring-[rgba(0,0,0,0.08)]"
                      >
                        <option value="">Select</option>
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                      </select>
                      {questions.peopleMumble && (
                        <span className="text-emerald-500">✓</span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="watchFaces">Do you intently watch peoples face when they speak to you?</Label>
                    <div className="flex items-center gap-2">
                      <select
                        id="watchFaces"
                        value={questions.watchFaces}
                        onChange={(e) => setQuestions({ ...questions, watchFaces: e.target.value })}
                        className="flex h-9 w-40 rounded-md border border-border bg-white px-3 py-1 text-sm transition-colors focus-visible:outline-none focus-visible:border-slate-400 focus-visible:ring-[3px] focus-visible:ring-[rgba(0,0,0,0.08)]"
                      >
                        <option value="">Select</option>
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                      </select>
                      {questions.watchFaces && (
                        <span className="text-emerald-500">✓</span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="howCanWeHelp">how can we help you?</Label>
                    <textarea
                      id="howCanWeHelp"
                      placeholder="Type your response here..."
                      value={questions.howCanWeHelp}
                      onChange={(e) => setQuestions({ ...questions, howCanWeHelp: e.target.value })}
                      rows={5}
                      className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:border-slate-400 focus-visible:ring-[3px] focus-visible:ring-[rgba(0,0,0,0.08)] resize-none"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={questions.benefitCheck}
                        onChange={(e) => setQuestions({ ...questions, benefitCheck: e.target.checked })}
                        className="w-4 h-4 rounded border-border text-foreground focus:ring-2 focus:ring-[rgba(0,0,0,0.08)]"
                      />
                      <span className="text-foreground">we can do a benefit check on your behalf?</span>
                    </label>

                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={questions.audiogram}
                        onChange={(e) => setQuestions({ ...questions, audiogram: e.target.checked })}
                        className="w-4 h-4 rounded border-border text-foreground focus:ring-2 focus:ring-[rgba(0,0,0,0.08)]"
                      />
                      <span className="text-foreground">do you have an audiogram not older than 6 months?</span>
                    </label>

                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={questions.bookAppointment}
                        onChange={(e) => setQuestions({ ...questions, bookAppointment: e.target.checked })}
                        className="w-4 h-4 rounded border-border text-foreground focus:ring-2 focus:ring-[rgba(0,0,0,0.08)]"
                      />
                      <span className="text-foreground">would you like to book an appointment for a full diagnostic?</span>
                    </label>
                  </div>

                  {/* Save Answers feedback */}
                  {answersSaveMsg && (
                    <p className={`text-sm font-medium ${answersSaveMsg.includes('Failed') ? 'text-red-600' : 'text-emerald-600'}`}>
                      {answersSaveMsg}
                    </p>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {activeTab === 'basic' && (
          <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-border bg-muted/10">
            {saveMsg && (
              <p className={`text-sm font-medium ${saveMsg.includes('Failed') ? 'text-red-600' : 'text-emerald-600'}`}>
                {saveMsg}
              </p>
            )}
            <div className="ml-auto">
              <button
                onClick={handleSave}
                disabled={saving || detailLoading}
                className="px-6 py-2.5 bg-foreground cursor-pointer text-background rounded-md hover:opacity-90 transition-opacity font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                Save Changes
              </button>
            </div>
          </div>
        )}

        {activeTab === 'questions' && (
          <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-border bg-muted/10">
            {answersSaveMsg && (
              <p className={`text-sm font-medium ${answersSaveMsg.includes('Failed') ? 'text-red-600' : 'text-emerald-600'}`}>
                {answersSaveMsg}
              </p>
            )}
            <div className="ml-auto">
              <button
                onClick={handleSaveAnswers}
                disabled={answersSaving || answersLoading}
                className="px-6 py-2.5 bg-foreground cursor-pointer text-background rounded-md hover:opacity-90 transition-opacity font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {answersSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                Save Changes
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}