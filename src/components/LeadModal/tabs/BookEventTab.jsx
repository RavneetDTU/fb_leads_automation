import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { Info } from 'lucide-react';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { googleService } from '../../../services/google';
import { EVENT_TYPES } from '../constants';
import { selectClass } from '../helpers';

export const BookEventTab = forwardRef(function BookEventTab({ formData }, ref) {
  const [bookingData, setBookingData] = useState({
    eventType: '',
    eventDate: '',
    startTime: '',
    store: '',
    additionalNote: '',
  });
  const [connectedStores, setConnectedStores] = useState([]);

  useEffect(() => {
    const stores = googleService.getConnectedStores();
    setConnectedStores(stores);
  }, []);

  // Expose book() to parent so the fixed footer can trigger it
  useImperativeHandle(ref, () => ({
    book: async () => {
      if (!bookingData.eventType || !bookingData.eventDate || !bookingData.startTime || !bookingData.store) {
        throw new Error('Please fill in all required fields');
      }

      if (!formData.email) {
        throw new Error('Patient email is required to send a calendar invitation. Please add an email in the Basic Info tab.');
      }

      const selectedEvent = EVENT_TYPES.find(e => e.value === bookingData.eventType);

      const [hours, minutes] = bookingData.startTime.split(':').map(Number);
      const startDate = new Date(2000, 0, 1, hours, minutes);
      const endDate = new Date(startDate.getTime() + selectedEvent.duration * 60000);
      const endTime = `${String(endDate.getHours()).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(2, '0')}`;

      const descriptionParts = [
        `Patient: ${formData.name || 'N/A'}`,
        `Phone: ${formData.phone || 'N/A'}`,
        `Email: ${formData.email}`,
        `Store: ${bookingData.store}`,
      ];
      if (bookingData.additionalNote) {
        descriptionParts.push(`\nNote: ${bookingData.additionalNote}`);
      }

      if (bookingData.eventType === 'wax-removal') {
        const [hourStr, minuteStr] = bookingData.startTime.split(':');
        const hour = parseInt(hourStr, 10);
        const ampm = hour >= 12 ? 'pm' : 'am';
        const formattedHour = hour % 12 || 12;
        const formattedTime = `${formattedHour}:${minuteStr}${ampm}`;
        const appointmentTime = `${bookingData.eventDate} at ${formattedTime}`;
        const customMessage = `Good Day,

Thank you for booking your ear wax removal appointment with us.
Your appointment has been confirmed for ${appointmentTime}
 
The cost is R200.00 per ear or R400.00 for both ears.
 
We will first examine your ears to check for wax and make sure it is safe to proceed. If suitable, we will gently remove the wax using a cleaning solution and specialised equipment. Once the procedure is complete, we will re-examine your ears to ensure they are fully clear.
 
We are located in Checkers Hyper in Blue Route Mall (corner of Vans Road& Tokai Road), opposite teller number  15/16. As you enter the checkers hyper you will see shops along the left we are the 4th Shop.
Pin Location : https://goo.gl/maps/qpNFizrYWaUnEeQB6
We look forward to meeting you!
If you have any questions, feel free to contact us on the number below.
Hearing Aid Labs Blue Route Mall
Shop –G260
16 Tokai Road, Corner Vans & Tokai Road
Tokai,7945
Phone: 021 110 0275`;
        descriptionParts.push(`\n${customMessage}`);
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

      if (bookingData.eventType === 'wax-removal') {
        eventPayload.colorId = '7';
      }

      console.log('[BookEventTab] Creating calendar event for store:', bookingData.store, eventPayload);

      await googleService.createEvent(bookingData.store, eventPayload);

      return { email: formData.email };
    },
  }), [bookingData, formData]);

  return (
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
    </div>
  );
});
