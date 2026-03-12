import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Info, Loader2, Send } from 'lucide-react';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { leadsService } from '../services/leads';
import { getMessages, sendMessage, normalisePhone } from '../services/whatsapp';
import { googleService } from '../services/google';

// ── Branch names for dropdown ──
const BRANCH_NAMES = [
  'BLUFF', 'BRACKENFELL', 'CAPE TOWN', 'CASCADES', 'CENTURION',
  'HILLCREST', 'HOWICK', 'JEFFREYS BAY', 'KLOOF', 'LA LUCIA',
  'LANGEBAAN', 'LONGBEACH', 'MARGATE', 'MAYVILLE', 'MOFFETT',
  'MUSGRAVE', 'NORTHGATE', 'NORWOOD', 'ONLINE', 'SCOTTBURGH',
  'SHELLY', 'SOMERSET', 'SUMMERSTRAND', 'TOKAI', 'UMHLANGA',
  'VREDENBURG', 'WESTVILLE', 'WINDERMERE',
];

// ── Event types for calendar booking ──
const EVENT_TYPES = [
  { value: 'hearing-aid-test', label: 'Hearing Aid Test', duration: 45 },
  { value: 'wax-removal', label: 'Wax Removal Test', duration: 30 },
];

// ── Store list for calendar booking ──
const STORE_LIST = BRANCH_NAMES.map(name => ({ value: name, label: name }));

// ── WhatsApp helpers ──
function formatMessageTime(isoString) {
  if (!isoString) return '';
  const date = new Date(isoString);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  if (isToday) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return date.toLocaleDateString([], { day: 'numeric', month: 'short' });
}

function MessageText({ text }) {
  if (!text) return null;
  const lines = text.split('\n');
  return (
    <span>
      {lines.map((line, li) => {
        const parts = line.split(/(\*[^*]+\*)/g);
        return (
          <span key={li}>
            {parts.map((part, pi) =>
              part.startsWith('*') && part.endsWith('*')
                ? <strong key={pi}>{part.slice(1, -1)}</strong>
                : <span key={pi}>{part}</span>
            )}
            {li < lines.length - 1 && <br />}
          </span>
        );
      })}
    </span>
  );
}

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
  const [saveMsg, setSaveMsg] = useState('');

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

  // ── WhatsApp state ──
  const [whatsappMessages, setWhatsappMessages] = useState([]);
  const [whatsappLoading, setWhatsappLoading] = useState(false);
  const [whatsappError, setWhatsappError] = useState(null);
  const [whatsappMessage, setWhatsappMessage] = useState('');
  const [whatsappSending, setWhatsappSending] = useState(false);
  const messagesEndRef = useRef(null);
  const sendInFlightRef = useRef(false);

  // ── Calendar Booking state ──
  const [bookingData, setBookingData] = useState({
    eventType: '',
    eventDate: '',
    startTime: '',
    store: '',
    additionalNote: '',
  });
  const [bookingSaving, setBookingSaving] = useState(false);
  const [bookingSaveMsg, setBookingSaveMsg] = useState('');
  const [connectedStores, setConnectedStores] = useState([]);

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
    { id: 'booking', label: 'Book Event' },
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

  // ─── WhatsApp: fetch messages (uses phone from detail API) ───
  const fetchWhatsappMessages = useCallback(async (silent = false) => {
    const phone = formData.phone;
    if (!phone) return;

    if (silent && sendInFlightRef.current) return;

    if (!silent) {
      setWhatsappLoading(true);
      setWhatsappError(null);
    }
    try {
      const normPhone = normalisePhone(phone);
      const data = await getMessages(normPhone);
      const filtered = data.filter(m =>
        m.message_text && m.message_text.trim() !== '' && m.message_type !== 'session'
      );
      setWhatsappMessages(filtered);
    } catch (err) {
      console.error('Failed to load WhatsApp messages:', err);
      if (!silent) setWhatsappError(err.message);
    } finally {
      if (!silent) setWhatsappLoading(false);
    }
  }, [formData.phone]);

  // Load messages when WhatsApp tab is selected and phone is available
  useEffect(() => {
    if (activeTab === 'whatsapp' && formData.phone && !detailLoading) {
      fetchWhatsappMessages(false);
      const interval = setInterval(() => fetchWhatsappMessages(true), 5000);
      return () => clearInterval(interval);
    }
  }, [activeTab, formData.phone, detailLoading, fetchWhatsappMessages]);

  // ─── Load connected Google stores when booking tab is selected ───
  useEffect(() => {
    if (activeTab === 'booking') {
      const stores = googleService.getConnectedStores();
      setConnectedStores(stores);
    }
  }, [activeTab]);

  // Scroll to bottom when messages update
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [whatsappMessages]);

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
      await fetchNotes();
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

  // ─── WhatsApp: send message handler ───
  const handleSendWhatsapp = async () => {
    const text = whatsappMessage.trim();
    if (!text || !formData.phone || whatsappSending) return;

    const normPhone = normalisePhone(formData.phone);
    sendInFlightRef.current = true;

    // Optimistic UI
    const optimisticMsg = {
      message_id: `optimistic-${Date.now()}`,
      phone: normPhone,
      direction: 'OUT',
      message_type: 'text',
      message_text: text,
      status: 'sending',
      timestamp: new Date().toISOString(),
    };
    setWhatsappMessages(prev => [...prev, optimisticMsg]);
    setWhatsappMessage('');
    setWhatsappSending(true);

    try {
      await sendMessage(normPhone, text);
      // Hold lock for 3s while backend indexes
      setTimeout(() => {
        sendInFlightRef.current = false;
        fetchWhatsappMessages(true);
      }, 3000);
    } catch (err) {
      sendInFlightRef.current = false;
      console.error('Failed to send WhatsApp message:', err);
      setWhatsappMessages(prev => prev.filter(m => m.message_id !== optimisticMsg.message_id));
      setWhatsappMessage(text);
      alert(`Failed to send message: ${err.message}`);
    } finally {
      setWhatsappSending(false);
    }
  };

  // ─── Book calendar event handler ───
  const handleBookEvent = async () => {
    if (!bookingData.eventType || !bookingData.eventDate || !bookingData.startTime || !bookingData.store) {
      alert('Please fill in all required fields');
      return;
    }

    if (!formData.email) {
      alert('Patient email is required to send a calendar invitation. Please add an email in the Basic Info tab.');
      return;
    }

    setBookingSaving(true);
    setBookingSaveMsg('');

    const selectedEvent = EVENT_TYPES.find(e => e.value === bookingData.eventType);

    try {
      // Calculate end time based on event duration
      const [hours, minutes] = bookingData.startTime.split(':').map(Number);
      const startDate = new Date(2000, 0, 1, hours, minutes);
      const endDate = new Date(startDate.getTime() + selectedEvent.duration * 60000);
      const endTime = `${String(endDate.getHours()).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(2, '0')}`;

      // Build a description with patient details
      const descriptionParts = [
        `Patient: ${formData.name || 'N/A'}`,
        `Phone: ${formData.phone || 'N/A'}`,
        `Email: ${formData.email}`,
        `Store: ${bookingData.store}`,
      ];
      if (bookingData.additionalNote) {
        descriptionParts.push(`\nNote: ${bookingData.additionalNote}`);
      }

      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Africa/Johannesburg';

      const eventPayload = {
        summary: `${selectedEvent.label} — ${formData.name || 'Patient'}`,
        description: descriptionParts.join('\n'),
        start: { dateTime: `${bookingData.eventDate}T${bookingData.startTime}:00`, timeZone },
        end: { dateTime: `${bookingData.eventDate}T${endTime}:00`, timeZone },
        attendees: [
          { email: formData.email }
        ],
      };

      console.log('[LeadModal] Creating calendar event for store:', bookingData.store, eventPayload);

      const createdEvent = await googleService.createEvent(bookingData.store, eventPayload);

      setBookingSaveMsg(`Event booked! Invitation sent to ${formData.email}`);
      setTimeout(() => setBookingSaveMsg(''), 5000);
    } catch (err) {
      console.error('Failed to book event:', err);
      setBookingSaveMsg(`Failed: ${err.message}`);
      setTimeout(() => setBookingSaveMsg(''), 5000);
    } finally {
      setBookingSaving(false);
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

  // ─── Select class helper ───
  const selectClass = "flex h-9 w-full rounded-md border border-border bg-white px-3 py-1 text-sm transition-colors focus-visible:outline-none focus-visible:border-slate-400 focus-visible:ring-[3px] focus-visible:ring-[rgba(0,0,0,0.08)]";

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
        <div className="px-6 pt-[10px] flex-shrink-0 pr-[24px] pb-[0px] pl-[24px]">
          <div className="flex gap-1 border-b border-border flex-wrap">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-2.5 text-sm font-medium transition-all duration-150 border-b-2 -mb-px cursor-pointer whitespace-nowrap ${activeTab === tab.id
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
                      <select
                        id="branchName"
                        value={formData.branchName}
                        onChange={(e) => setFormData({ ...formData, branchName: e.target.value })}
                        className={selectClass}
                      >
                        <option value="">Select Branch</option>
                        {/* If API returned a branch not in our list, show it as an option */}
                        {formData.branchName && !BRANCH_NAMES.includes(formData.branchName.toUpperCase()) && (
                          <option value={formData.branchName}>{formData.branchName}</option>
                        )}
                        {BRANCH_NAMES.map(branch => (
                          <option key={branch} value={branch}>{branch}</option>
                        ))}
                      </select>
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
            <div className="flex flex-col" style={{ height: 'calc(100% - 0px)' }}>
              {/* Messages Area */}
              <div
                className="flex-1 overflow-y-auto p-3 rounded-lg mb-3"
                style={{
                  backgroundColor: '#EFEAE2',
                  backgroundImage: `url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")`,
                  backgroundRepeat: 'repeat',
                  backgroundBlendMode: 'overlay',
                  minHeight: '300px',
                }}
              >
                <div className="space-y-2">
                  {whatsappLoading && (
                    <div className="flex justify-center items-center py-12">
                      <div className="bg-white/80 rounded-full px-4 py-2 flex items-center gap-2 shadow-sm">
                        <Loader2 className="w-4 h-4 text-[#25D366] animate-spin" />
                        <span className="text-sm text-[#667781]">Loading messages...</span>
                      </div>
                    </div>
                  )}

                  {!whatsappLoading && whatsappError && (
                    <div className="bg-red-100 border border-red-200 rounded-lg p-3 mx-auto max-w-sm text-center">
                      <p className="text-sm text-red-700">Failed to load messages</p>
                      <p className="text-xs text-red-500 mt-1">{whatsappError}</p>
                    </div>
                  )}

                  {!whatsappLoading && !whatsappError && whatsappMessages.length === 0 && (
                    <div className="flex justify-center">
                      <div className="bg-white/80 rounded-lg px-4 py-2 text-sm text-[#667781] shadow-sm">
                        {formData.phone ? 'No messages yet' : 'No phone number available for this lead'}
                      </div>
                    </div>
                  )}

                  {!whatsappLoading && whatsappMessages.map((msg) => {
                    const isOut = msg.direction === 'OUT';
                    return (
                      <div
                        key={msg.message_id}
                        className={`flex ${isOut ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[75%] px-2.5 py-1.5 shadow-sm ${isOut ? 'bg-[#D9FDD3] text-[#111B21]' : 'bg-white text-[#111B21]'}`}
                          style={{
                            borderRadius: isOut ? '8px 8px 0px 8px' : '8px 8px 8px 0px',
                            boxShadow: '0 1px 0.5px rgba(0,0,0,0.13)',
                          }}
                        >
                          <p className="text-sm leading-[1.45]">
                            <MessageText text={msg.message_text} />
                          </p>
                          <div className="flex items-center justify-end gap-1 mt-0.5">
                            <span className="text-[#667781] text-[11px]">
                              {formatMessageTime(msg.timestamp)}
                            </span>
                            {isOut && (
                              <svg width="15" height="11" viewBox="0 0 16 11" fill="none">
                                <path
                                  d="M11.071 0.5L5.5 6.071l-2.071-2.07L2 5.429 5.5 8.929 12.5 1.929 11.071 0.5zM14.5 1.929L7.5 8.929l-2 2L4 8.429l1.429-1.429 1.071 1.071L13.071 0.5 14.5 1.929z"
                                  fill={msg.status === 'read' ? '#53BDEB' : '#8696A0'}
                                />
                              </svg>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Message Input */}
              <div className="flex gap-2 items-end pt-2 border-t border-border">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Type a message..."
                    value={whatsappMessage}
                    onChange={(e) => setWhatsappMessage(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleSendWhatsapp(); }}
                    disabled={whatsappSending || !formData.phone}
                    className="w-full rounded-full border border-border bg-white px-4 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:border-slate-400 focus-visible:ring-[3px] focus-visible:ring-[rgba(0,0,0,0.08)] h-[42px]"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSendWhatsapp}
                  disabled={whatsappSending || !whatsappMessage.trim() || !formData.phone}
                  className="p-2.5 bg-foreground text-background cursor-pointer rounded-full hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed h-[42px] w-[42px] flex items-center justify-center"
                >
                  <Send className="w-4 h-4" />
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

                  {answersSaveMsg && (
                    <p className={`text-sm font-medium ${answersSaveMsg.includes('Failed') ? 'text-red-600' : 'text-emerald-600'}`}>
                      {answersSaveMsg}
                    </p>
                  )}
                </>
              )}
            </div>
          )}

          {/* ═══════ BOOK EVENT TAB ═══════ */}
          {activeTab === 'booking' && (
            <div className="space-y-5">
              {/* Pre-filled lead info (read-only display) */}
              <div className="bg-slate-50 border border-border rounded-lg p-4">
                <h3 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wider">Patient Details</h3>
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">Name:</span>
                    <p className="font-medium text-foreground">{formData.name || '—'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Phone:</span>
                    <p className="font-medium text-foreground">{formData.phone || '—'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Email:</span>
                    <p className="font-medium text-foreground">{formData.email || '—'}</p>
                  </div>
                </div>
              </div>

              {/* Event Details */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="eventType">Event Type *</Label>
                  <select
                    id="eventType"
                    value={bookingData.eventType}
                    onChange={(e) => setBookingData({ ...bookingData, eventType: e.target.value })}
                    className={selectClass}
                  >
                    <option value="">Select event type...</option>
                    {EVENT_TYPES.map(evt => (
                      <option key={evt.value} value={evt.value}>
                        {evt.label} — {evt.duration} minutes
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="eventDate">Event Date *</Label>
                    <Input
                      id="eventDate"
                      type="date"
                      value={bookingData.eventDate}
                      onChange={(e) => setBookingData({ ...bookingData, eventDate: e.target.value })}
                      className="bg-white border-border focus-visible:border-slate-400 focus-visible:ring-[rgba(0,0,0,0.08)]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="startTime">Start Time *</Label>
                    <Input
                      id="startTime"
                      type="time"
                      value={bookingData.startTime}
                      onChange={(e) => setBookingData({ ...bookingData, startTime: e.target.value })}
                      className="bg-white border-border focus-visible:border-slate-400 focus-visible:ring-[rgba(0,0,0,0.08)]"
                    />
                    {bookingData.eventType && bookingData.startTime && (
                      <p className="text-xs text-muted-foreground">
                        End time: {(() => {
                          const evt = EVENT_TYPES.find(e => e.value === bookingData.eventType);
                          if (!evt) return '';
                          const [h, m] = bookingData.startTime.split(':').map(Number);
                          const end = new Date(2000, 0, 1, h, m + evt.duration);
                          return `${String(end.getHours()).padStart(2, '0')}:${String(end.getMinutes()).padStart(2, '0')}`;
                        })()}
                        {' '}({EVENT_TYPES.find(e => e.value === bookingData.eventType)?.duration} min)
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bookingStore">Choose Store (Google Connected) *</Label>
                  {connectedStores.length === 0 ? (
                    <div className="flex items-start gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2.5">
                      <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>No Google accounts connected. Please connect a store via the Calendar tab first.</span>
                    </div>
                  ) : (
                    <select
                      id="bookingStore"
                      value={bookingData.store}
                      onChange={(e) => setBookingData({ ...bookingData, store: e.target.value })}
                      className={selectClass}
                    >
                      <option value="">Select store...</option>
                      {connectedStores.map(store => (
                        <option key={store.id} value={store.id}>{store.name}</option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="additionalNote">Additional Note</Label>
                  <textarea
                    id="additionalNote"
                    placeholder="Add any additional details about the booking..."
                    value={bookingData.additionalNote}
                    onChange={(e) => setBookingData({ ...bookingData, additionalNote: e.target.value })}
                    rows={3}
                    className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:border-slate-400 focus-visible:ring-[3px] focus-visible:ring-[rgba(0,0,0,0.08)] resize-none"
                  />
                </div>
              </div>

              {bookingSaveMsg && (
                <p className={`text-sm font-medium ${bookingSaveMsg.includes('Failed') ? 'text-red-600' : 'text-emerald-600'}`}>
                  {bookingSaveMsg}
                </p>
              )}
            </div>
          )}
        </div>

        {/* ═══════ FOOTER ═══════ */}
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

        {activeTab === 'booking' && (
          <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-border bg-muted/10">
            {bookingSaveMsg && (
              <p className={`text-sm font-medium ${bookingSaveMsg.includes('Failed') ? 'text-red-600' : 'text-emerald-600'}`}>
                {bookingSaveMsg}
              </p>
            )}
            <div className="ml-auto">
              <button
                onClick={handleBookEvent}
                disabled={bookingSaving}
                className="px-6 py-2.5 bg-foreground cursor-pointer text-background rounded-md hover:opacity-90 transition-opacity font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {bookingSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                Book Event
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}