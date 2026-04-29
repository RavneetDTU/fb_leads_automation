import { ChevronLeft, ChevronRight, Info, X, ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export function CalendarSettings() {
  const navigate = useNavigate();
  const { calendarId } = useParams();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Edit modal state
  const [editIsOpen, setEditIsOpen] = useState(true);
  const [editOpenTime, setEditOpenTime] = useState('11:00');
  const [editCloseTime, setEditCloseTime] = useState('22:00');

  // Helper functions
  const getMonthName = (date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const goToPreviousMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setCurrentDate(newDate);
  };

  const goToNextMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setCurrentDate(newDate);
  };

  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const firstDayOfWeek = firstDay.getDay();

    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();

    const prevMonthLastDay = new Date(year, month, 0).getDate();

    const days = [];

    // Previous month trailing days
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, prevMonthLastDay - i);
      days.push({ date, isOpen: false, isCurrentMonth: false });
    }

    // Current month days
    const today = new Date();
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dayOfWeek = date.getDay();
      // Placeholder: Wednesday closed, rest open
      const isClosed = dayOfWeek === 3;

      days.push({
        date,
        isOpen: !isClosed,
        openTime: !isClosed ? '11:00' : undefined,
        closeTime: !isClosed ? '22:00' : undefined,
        isToday:
          date.getDate() === today.getDate() &&
          date.getMonth() === today.getMonth() &&
          date.getFullYear() === today.getFullYear(),
        isCurrentMonth: true,
      });
    }

    // Next month leading days
    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day);
      days.push({ date, isOpen: false, isCurrentMonth: false });
    }

    return days;
  };

  const calendarDays = generateCalendarDays();
  const weekDays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  const handleDayClick = (day) => {
    if (!day.isCurrentMonth) return;
    setSelectedDay(day);
    setEditIsOpen(day.isOpen);
    setEditOpenTime(day.openTime || '11:00');
    setEditCloseTime(day.closeTime || '22:00');
    setEditModalOpen(true);
  };

  const handleSaveAvailability = async () => {
    if (!selectedDay) return;
    setIsSaving(true);
    // TODO: wire up API when ready
    setTimeout(() => {
      setIsSaving(false);
      setEditModalOpen(false);
      setSelectedDay(null);
    }, 600);
  };

  const formatTime = (time24) => {
    const [hours, minutes] = time24.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}${ampm}`;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-white">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-3">
          <button
            onClick={() => navigate(`/calendar/${calendarId}`)}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Calendar
          </button>
          <span className="text-muted-foreground">/</span>
          <div>
            <h1 className="font-heading font-semibold text-foreground">
              Calendar Settings
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Manage your open hours and closed dates
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="bg-white border border-border rounded-lg p-4">
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading font-semibold text-foreground">
              {getMonthName(currentDate)}
            </h2>

            <div className="flex items-center gap-2">
              <button
                onClick={goToPreviousMonth}
                className="px-2 py-1.5 border border-border rounded-md hover:bg-muted/20 hover:border-foreground transition-all cursor-pointer"
                title="Previous Month"
              >
                <ChevronLeft className="w-4 h-4 text-foreground" />
              </button>

              <button
                onClick={() => setCurrentDate(new Date())}
                className="px-3 py-1.5 border border-border rounded-md hover:bg-muted/20 hover:border-foreground transition-all text-xs font-medium cursor-pointer"
              >
                Today
              </button>

              <button
                onClick={goToNextMonth}
                className="px-2 py-1.5 border border-border rounded-md hover:bg-muted/20 hover:border-foreground transition-all cursor-pointer"
                title="Next Month"
              >
                <ChevronRight className="w-4 h-4 text-foreground" />
              </button>
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 mb-3 p-2 bg-muted/30 rounded-lg border border-border">
            <div className="flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground font-medium">Legend:</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span className="text-xs text-foreground">Open</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-red-100 border-2 border-red-400 rounded"></div>
              <span className="text-xs text-foreground">Closed</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 border-2 border-primary rounded"></div>
              <span className="text-xs text-foreground">Today</span>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-0 border border-border rounded-lg overflow-hidden">
            {/* Week Day Headers */}
            {weekDays.map((day) => (
              <div
                key={day}
                className="bg-muted/50 border-b border-r border-border last:border-r-0 px-2 py-2 text-center"
              >
                <span className="text-xs font-semibold text-foreground">{day}</span>
              </div>
            ))}

            {/* Calendar Days */}
            {calendarDays.map((day, index) => {
              const isLastInRow = (index + 1) % 7 === 0;

              return (
                <div
                  key={index}
                  onClick={() => handleDayClick(day)}
                  className={`
                    border-b border-r last:border-b-0 min-h-[85px] p-2 relative
                    ${!day.isCurrentMonth ? 'bg-gray-50/50' : 'bg-white'}
                    ${day.isCurrentMonth && !day.isOpen ? 'bg-red-50 border-red-200' : ''}
                    ${day.isToday ? 'ring-2 ring-primary ring-inset' : ''}
                    ${day.isCurrentMonth ? 'cursor-pointer hover:bg-muted/20' : 'cursor-default'}
                    ${isLastInRow ? 'border-r-0' : 'border-border'}
                    transition-all
                  `}
                >
                  {/* Date Number */}
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-sm ${
                        day.isCurrentMonth
                          ? day.isToday
                            ? 'text-primary font-semibold'
                            : 'text-foreground'
                          : 'text-muted-foreground'
                      }`}
                    >
                      {day.date.getDate()}
                    </span>
                  </div>

                  {/* Availability Status */}
                  {day.isCurrentMonth && (
                    <div className="mt-2">
                      {day.isOpen && day.openTime && day.closeTime ? (
                        <div className="bg-green-500 rounded px-1.5 py-1 text-center">
                          <div className="text-[10px] font-medium text-white leading-tight">
                            {formatTime(day.openTime)}-{formatTime(day.closeTime)}
                          </div>
                        </div>
                      ) : (
                        <div className="text-[10px] font-semibold text-red-600 text-center">
                          CLOSED
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editModalOpen && selectedDay && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg border border-border max-w-md w-full p-5">
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-heading font-semibold text-foreground">
                  Edit Availability
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {selectedDay.date.toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              </div>
              <button
                onClick={() => setEditModalOpen(false)}
                className="p-1 hover:bg-muted/20 rounded transition-colors cursor-pointer"
              >
                <X className="w-5 h-5 text-foreground" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="space-y-4">
              {/* Open/Closed Toggle */}
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border">
                <span className="text-sm font-medium text-foreground">
                  Status
                </span>
                <button
                  onClick={() => setEditIsOpen(!editIsOpen)}
                  className={`px-4 py-2 rounded-md font-medium text-sm transition-all cursor-pointer ${
                    editIsOpen
                      ? 'bg-green-500 text-white hover:bg-green-600'
                      : 'bg-red-500 text-white hover:bg-red-600'
                  }`}
                >
                  {editIsOpen ? 'Open' : 'Closed'}
                </button>
              </div>

              {/* Time Inputs (only if open) */}
              {editIsOpen && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1.5">
                      Opening Time
                    </label>
                    <input
                      type="time"
                      value={editOpenTime}
                      onChange={(e) => setEditOpenTime(e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-foreground"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1.5">
                      Closing Time
                    </label>
                    <input
                      type="time"
                      value={editCloseTime}
                      onChange={(e) => setEditCloseTime(e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-foreground"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center gap-3 mt-5 pt-4 border-t border-border">
              <button
                onClick={() => setEditModalOpen(false)}
                className="flex-1 px-4 py-2 border border-border text-foreground rounded-md hover:bg-muted/20 transition-colors text-sm font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAvailability}
                disabled={isSaving}
                className="flex-1 px-4 py-2 bg-foreground text-white rounded-md hover:bg-foreground/90 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSaving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
