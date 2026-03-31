import React, { useState, useEffect, useRef } from 'react';
import { X, Info, Loader2 } from 'lucide-react';
import { leadsService } from '../../services/leads';
import { TABS } from './constants';

// ── Tab components ──
import { BasicInfoTab } from './tabs/BasicInfoTab';
import { NotesTab } from './tabs/NotesTab';
import { CallsTab } from './tabs/CallsTab';
import { WhatsAppTab } from './tabs/WhatsAppTab';
import { QuestionsTab } from './tabs/QuestionsTab';
import { BookEventTab } from './tabs/BookEventTab';
import { SendConversionTab } from './tabs/SendConversionTab';

export function LeadModal({ lead, onClose }) {
  const [activeTab, setActiveTab] = useState('basic');

  // ── Shared lead detail state (used by BasicInfo, WhatsApp, BookEvent) ──
  const [formData, setFormData] = useState({
    branchName: '',
    status: '',
    name: '',
    email: '',
    phone: '',
    city: '',
  });
  const [detailLoading, setDetailLoading] = useState(true);

  // ── Basic Info footer state ──
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  // ── Questions footer state ──
  const questionsRef = useRef(null);
  const [questionsSaving, setQuestionsSaving] = useState(false);
  const [questionsSaveMsg, setQuestionsSaveMsg] = useState('');

  // ── Booking footer state ──
  const bookingRef = useRef(null);
  const [bookingSaving, setBookingSaving] = useState(false);
  const [bookingSaveMsg, setBookingSaveMsg] = useState('');

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

  // ─── Save questions handler ───
  const handleSaveQuestions = async () => {
    if (!questionsRef.current) return;
    setQuestionsSaving(true);
    setQuestionsSaveMsg('');
    try {
      await questionsRef.current.save();
      setQuestionsSaveMsg('Answers saved!');
      setTimeout(() => setQuestionsSaveMsg(''), 3000);
    } catch (err) {
      console.error('Failed to save answers:', err);
      setQuestionsSaveMsg('Failed to save answers.');
      setTimeout(() => setQuestionsSaveMsg(''), 4000);
    } finally {
      setQuestionsSaving(false);
    }
  };

  // ─── Book event handler ───
  const handleBookEvent = async () => {
    if (!bookingRef.current) return;
    setBookingSaving(true);
    setBookingSaveMsg('');
    try {
      const result = await bookingRef.current.book();
      setBookingSaveMsg(`Event booked! Invitation sent to ${result.email}`);
      setTimeout(() => setBookingSaveMsg(''), 5000);
    } catch (err) {
      console.error('Failed to book event:', err);
      setBookingSaveMsg(`Failed: ${err.message}`);
      setTimeout(() => setBookingSaveMsg(''), 5000);
    } finally {
      setBookingSaving(false);
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
        <div className="px-6 pt-[10px] flex-shrink-0 pr-[24px] pb-[0px] pl-[24px]">
          <div className="flex gap-1 border-b border-border flex-wrap">
            {TABS.map((tab) => (
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

        {/* Content — scrollable area */}
        <div className="flex-1 overflow-y-auto px-6 py-5 min-h-0">
          {activeTab === 'basic' && (
            <BasicInfoTab
              formData={formData}
              setFormData={setFormData}
              detailLoading={detailLoading}
            />
          )}

          {activeTab === 'notes' && (
            <NotesTab leadId={lead.id} />
          )}

          {activeTab === 'calls' && (
            <CallsTab />
          )}

          {activeTab === 'whatsapp' && (
            <WhatsAppTab phone={!detailLoading ? formData.phone : null} />
          )}

          {activeTab === 'questions' && (
            <QuestionsTab ref={questionsRef} leadId={lead.id} />
          )}

          {activeTab === 'booking' && (
            <BookEventTab ref={bookingRef} formData={formData} />
          )}

          {activeTab === 'sendConversion' && (
            <SendConversionTab />
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
            {questionsSaveMsg && (
              <p className={`text-sm font-medium ${questionsSaveMsg.includes('Failed') ? 'text-red-600' : 'text-emerald-600'}`}>
                {questionsSaveMsg}
              </p>
            )}
            <div className="ml-auto">
              <button
                onClick={handleSaveQuestions}
                disabled={questionsSaving || questionsRef.current?.isLoading}
                className="px-6 py-2.5 bg-foreground cursor-pointer text-background rounded-md hover:opacity-90 transition-opacity font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {questionsSaving && <Loader2 className="w-4 h-4 animate-spin" />}
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
