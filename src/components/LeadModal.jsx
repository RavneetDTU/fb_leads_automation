import React, { useState } from 'react';
import { X, Info } from 'lucide-react';
import { Input } from './ui/input';
import { Label } from './ui/label';

export function LeadModal({ lead, onClose }) {
  const [activeTab, setActiveTab] = useState('basic');
  const [formData, setFormData] = useState({
    branchName: 'TODO',
    surname: '',
    status: 'Inactive',
    quality: '',
    name: lead.name,
    email: 'ryan@example.com',
    phone: lead.phone,
    city: 'TODO',
  });
  const [noteText, setNoteText] = useState('');
  const [isReminder, setIsReminder] = useState(false);
  const [whatsappMessage, setWhatsappMessage] = useState('');
  const [questions, setQuestions] = useState({
    crowdedSituations: '',
    peopleMumble: '',
    watchFaces: '',
    howCanWeHelp: '',
    benefitCheck: false,
    audiogram: false,
    bookAppointment: false,
  });

  const tabs = [
    { id: 'basic', label: 'Basic Info' },
    { id: 'notes', label: 'Notes' },
    { id: 'calls', label: 'Calls' },
    { id: 'whatsapp', label: 'Whatsapp' },
    { id: 'questions', label: 'Questions' },
  ];

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

  const handleSave = () => {
    // Save logic here
    onClose();
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
          {activeTab === 'basic' && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="branchName">Branch Name(TODO)</Label>
                  <Input
                    id="branchName"
                    value={formData.branchName}
                    onChange={(e) => setFormData({ ...formData, branchName: e.target.value })}
                    className="bg-white border-border focus-visible:border-slate-400 focus-visible:ring-[rgba(0,0,0,0.08)]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="surname">Surname</Label>
                  <Input
                    id="surname"
                    value={formData.surname}
                    onChange={(e) => setFormData({ ...formData, surname: e.target.value })}
                    className="bg-white border-border focus-visible:border-slate-400 focus-visible:ring-[rgba(0,0,0,0.08)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <select
                    id="status"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="flex h-9 w-full rounded-md border border-border bg-white px-3 py-1 text-sm transition-colors focus-visible:outline-none focus-visible:border-slate-400 focus-visible:ring-[3px] focus-visible:ring-[rgba(0,0,0,0.08)]"
                  >
                    <option value="Inactive">Inactive</option>
                    <option value="Active">Active</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quality">Qualify (TO DO)</Label>
                  <select
                    id="quality"
                    value={formData.quality}
                    onChange={(e) => setFormData({ ...formData, quality: e.target.value })}
                    className="flex h-9 w-full rounded-md border border-border bg-white px-3 py-1 text-sm transition-colors focus-visible:outline-none focus-visible:border-slate-400 focus-visible:ring-[3px] focus-visible:ring-[rgba(0,0,0,0.08)]"
                  >
                    <option value="">Please select</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
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
                  <Label htmlFor="city">City (TODO)</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="bg-white border-border focus-visible:border-slate-400 focus-visible:ring-[rgba(0,0,0,0.08)]"
                  />
                </div>
              </div>
            </div>
          )}

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
                  className="px-4 py-2 border border-border rounded-md bg-foreground text-background cursor-pointer transition-colors text-sm font-medium"
                >
                  Save note
                </button>
              </div>

              {/* Notes Table */}
              <div className="border border-border rounded-md overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-muted/30 border-b border-border">
                      <th className="text-left px-4 py-3 text-sm font-medium text-foreground">User</th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-foreground">Status</th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-foreground">Message</th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-foreground">Created At</th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-sm text-muted-foreground">
                        No data available in table
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <a href="#" className="text-sm text-blue-600 hover:underline inline-block">
                View Sent Reminders History
              </a>
            </div>
          )}

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

          {activeTab === 'questions' && (
            <div className="space-y-5">
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
            </div>
          )}
        </div>

        {/* Footer */}
        {/* Footer - Only show for Basic Info and Questions */}
        {!['notes', 'calls', 'whatsapp'].includes(activeTab) && (
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border bg-muted/10">
            <button
              onClick={handleSave}
              className="px-6 py-2.5 bg-foreground cursor-pointer text-background rounded-md hover:opacity-90 transition-opacity font-medium"
            >
              Save Changes
            </button>
          </div>
        )}
      </div>
    </div>
  );
}