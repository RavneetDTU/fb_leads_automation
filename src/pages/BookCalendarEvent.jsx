import { useState } from 'react';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { CalendarPlus, ChevronDown, Loader2, Check } from 'lucide-react';

export default function BookCalendarEvent() {
    const CALENDAR_ACCOUNTS = [
        { id: 'store-a', label: 'Store A — store-a@gmail.com' },
        { id: 'store-b', label: 'Store B — store-b@gmail.com' },
    ];
 
    const [formData, setFormData] = useState({
        bookerName: '',
        bookerPhone: '',
        patientEmail: '',
        eventName: '',
        eventDate: '',
        eventStartTime: '',
        eventEndTime: '',
        description: '',
    });

    const [selectedCalendar, setSelectedCalendar] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };


    const handleSave = async () => {
        // Validate required fields
        if (!formData.bookerName || !formData.bookerPhone || !formData.eventName ||
            !formData.eventDate || !formData.eventStartTime || !selectedCalendar) {
            alert('Please fill in all required fields and select a calendar account');
            return;
        }

        setIsSaving(true);
        setSaveSuccess(false);

        try {
            // TODO: Replace with actual API call
            // The payload structure for Google Calendar API integration:
            // {
            //   summary: formData.eventName,
            //   description: formData.description,
            //   start: { dateTime: `${formData.eventDate}T${formData.eventStartTime}:00`, timeZone: 'auto' },
            //   end: { dateTime: `${formData.eventDate}T${formData.eventEndTime}:00`, timeZone: 'auto' },
            //   attendees: guestEmails.map(email => ({ email })),
            //   // calendarEmail is used to determine WHICH calendar account to book on
            //   // bookerName, bookerPhone are stored as custom metadata
            // }

            console.log('[BookCalendarEvent] Saving event:', {
                ...formData,
                selectedCalendar,
            });

            // Simulate API delay (remove when real API is connected)
            await new Promise(resolve => setTimeout(resolve, 1000));

            setSaveSuccess(true);

            // Reset success after 3s
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (error) {
            console.error('[BookCalendarEvent] Failed to save event:', error);
            alert('Failed to book event. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleReset = () => {
        setFormData({
            bookerName: '',
            bookerPhone: '',
            patientEmail: '',
            eventName: '',
            eventDate: '',
            eventStartTime: '',
            eventEndTime: '',
            description: '',
        });
        setSelectedCalendar('');
        setSaveSuccess(false);
    };

    return (
        <div className="min-h-screen bg-background">
            <div className="px-8 py-5">
                {/* Page Header */}
                <div className="mb-6 pb-4 border-b border-border">
                    <h1 className="text-3xl tracking-tight font-heading font-semibold">Book Calendar Event</h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        Schedule a new event on a connected Google Calendar
                    </p>
                </div>

                <div className="max-w-5xl mx-auto">
                    {/* Main Card */}
                    <div className="group bg-white border border-border rounded-lg px-5 py-5 transition-all duration-150 hover:border-slate-400 hover:shadow-[0_4px_12px_rgba(0,0,0,0.12)]">

                        {/* Card Header */}
                        <div className="flex items-start gap-3 mb-5 pb-4 border-b border-border">
                            <div className="w-10 h-10 bg-gradient-to-br from-[#4285F4] via-[#EA4335] to-[#FBBC05] text-white rounded-lg flex items-center justify-center flex-shrink-0">
                                <CalendarPlus className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                                <h2 className="font-heading font-semibold text-lg mb-1">New Calendar Event</h2>
                                <p className="text-sm text-muted-foreground">
                                    Fill in the details to book an event on a Google Calendar account
                                </p>
                            </div>
                        </div>

                        {/* Info Banner */}
                        {/* <div className="flex items-start gap-2 text-sm text-blue-700 bg-blue-50 border border-blue-200 rounded-md px-3 py-2.5 mb-5">
                            <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <span>
                                The <strong>Calendar Account Email</strong> determines which Google Calendar the event appears on.
                                This should be the email of the connected Google account where the booking should be reflected.
                            </span>
                        </div> */}

                        {/* Form */}
                        <div className="space-y-5">

                            {/* Calendar Account Email (prominent — at top) */}
                            {/* <div className="space-y-2 bg-slate-50 border border-border rounded-lg p-4">
                                <Label htmlFor="calendarEmail">Calendar Account Email *</Label>
                                <Input
                                    id="calendarEmail"
                                    type="email"
                                    placeholder="e.g. store-calendar@gmail.com"
                                    value={formData.calendarEmail}
                                    onChange={(e) => handleChange('calendarEmail', e.target.value)}
                                    className="bg-white border-border focus-visible:border-slate-400 focus-visible:ring-[rgba(0,0,0,0.08)]"
                                    required
                                />
                                <p className="text-xs text-muted-foreground">
                                    The Google account where this event will be created. The event will show up in this account's calendar.
                                </p>
                            </div> */}

                            {/* Booker Details Section */}
                            <div className="pt-2">
                                <h3 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wider">Booker Details</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <div className="space-y-2">
                                        <Label htmlFor="bookerName">Name *</Label>
                                        <Input
                                            id="bookerName"
                                            type="text"
                                            placeholder="Full name"
                                            value={formData.bookerName}
                                            onChange={(e) => handleChange('bookerName', e.target.value)}
                                            className="bg-white border-border focus-visible:border-slate-400 focus-visible:ring-[rgba(0,0,0,0.08)]"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="bookerPhone">Phone *</Label>
                                        <Input
                                            id="bookerPhone"
                                            type="tel"
                                            placeholder="e.g. +27 82 123 4567"
                                            value={formData.bookerPhone}
                                            onChange={(e) => handleChange('bookerPhone', e.target.value)}
                                            className="bg-white border-border focus-visible:border-slate-400 focus-visible:ring-[rgba(0,0,0,0.08)]"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="patientEmail">Patient Email</Label>
                                        <Input
                                            id="patientEmail"
                                            type="email"
                                            placeholder="patient@email.com"
                                            value={formData.patientEmail}
                                            onChange={(e) => handleChange('patientEmail', e.target.value)}
                                            className="bg-white border-border focus-visible:border-slate-400 focus-visible:ring-[rgba(0,0,0,0.08)]"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Event Details Section */}
                            <div className="pt-2">
                                <h3 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wider">Event Details</h3>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="eventName">Event Name *</Label>
                                        <Input
                                            id="eventName"
                                            type="text"
                                            placeholder="e.g. Hearing Test Appointment"
                                            value={formData.eventName}
                                            onChange={(e) => handleChange('eventName', e.target.value)}
                                            className="bg-white border-border focus-visible:border-slate-400 focus-visible:ring-[rgba(0,0,0,0.08)]"
                                            required
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="eventDate">Event Date *</Label>
                                            <Input
                                                id="eventDate"
                                                type="date"
                                                value={formData.eventDate}
                                                onChange={(e) => handleChange('eventDate', e.target.value)}
                                                className="bg-white border-border focus-visible:border-slate-400 focus-visible:ring-[rgba(0,0,0,0.08)]"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="eventStartTime">Start Time *</Label>
                                            <Input
                                                id="eventStartTime"
                                                type="time"
                                                value={formData.eventStartTime}
                                                onChange={(e) => handleChange('eventStartTime', e.target.value)}
                                                className="bg-white border-border focus-visible:border-slate-400 focus-visible:ring-[rgba(0,0,0,0.08)]"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="eventEndTime">End Time</Label>
                                            <Input
                                                id="eventEndTime"
                                                type="time"
                                                value={formData.eventEndTime}
                                                onChange={(e) => handleChange('eventEndTime', e.target.value)}
                                                className="bg-white cursor-pointer border-border focus-visible:border-slate-400 focus-visible:ring-[rgba(0,0,0,0.08)]"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="description">Description</Label>
                                        <textarea
                                            id="description"
                                            placeholder="Add any additional details about the event..."
                                            value={formData.description}
                                            onChange={(e) => handleChange('description', e.target.value)}
                                            rows={3}
                                            className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:border-slate-400 focus-visible:ring-[3px] focus-visible:ring-[rgba(0,0,0,0.08)] resize-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Calendar Account Dropdown */}
                            <div className="pt-2">
                                <h3 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wider">Calendar Account</h3>
                                <div className="space-y-2">
                                    <Label htmlFor="calendarAccount">Book Event On *</Label>
                                    <div className="relative">
                                        <select
                                            id="calendarAccount"
                                            value={selectedCalendar}
                                            onChange={(e) => setSelectedCalendar(e.target.value)}
                                            className="w-full appearance-none flex h-10 rounded-md border border-border bg-white px-3 pr-9 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:border-slate-400 focus-visible:ring-[3px] focus-visible:ring-[rgba(0,0,0,0.08)] cursor-pointer text-foreground"
                                            required
                                        >
                                            <option value="" disabled>Select a calendar account...</option>
                                            {CALENDAR_ACCOUNTS.map((account) => (
                                                <option key={account.id} value={account.id}>
                                                    {account.label}
                                                </option>
                                            ))}
                                        </select>
                                        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        The event will be created on this Google Calendar account and will reflect there after booking.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="flex items-center justify-between gap-3 pt-5 mt-5 border-t border-border">
                            <button
                                onClick={handleReset}
                                className="px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                            >
                                Reset Form
                            </button>

                            <div className="flex items-center gap-3">
                                {saveSuccess && (
                                    <span className="flex items-center gap-1.5 text-sm text-emerald-600 font-medium">
                                        <Check className="w-4 h-4" />
                                        Event booked successfully!
                                    </span>
                                )}

                                <Button
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className="px-6 cursor-pointer"
                                >
                                    {isSaving ? (
                                        <span className="flex items-center gap-2">
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Booking...
                                        </span>
                                    ) : (
                                        'Book Event'
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
