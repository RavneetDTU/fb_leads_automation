import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Calendar, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { googleService } from '../services/google';
import { calendarManager } from '../utils/calendarManager';

export function CalendarPage() {
    const { calendarId } = useParams();
    const [calendarInfo, setCalendarInfo] = useState(null);
    const [googleState, setGoogleState] = useState({
        isConnected: false,
        isLoading: false,
        events: null,
        todayDate: null,
        currentDisplayDate: new Date(),
        isExpanded: true
    });

    const fetchEventsForDate = async (date) => {
        console.log('📅 Fetching events for date:', date, 'calendarId:', calendarId);
        setGoogleState(prev => ({ ...prev, isLoading: true, currentDisplayDate: date }));
        try {
            // Use the new getEvents method with the specific date and calendarId
            const data = await googleService.getEvents(date, calendarId);
            console.log('📅 Events data received:', data);
            console.log('📅 Number of events:', data.events?.length || 0);

            setGoogleState(prev => ({
                ...prev,
                isLoading: false,
                events: data.events,
                todayDate: data.date, // The service returns formatted date string
                isConnected: true
            }));

            console.log('✅ State updated - isConnected: true, events count:', data.events?.length || 0);
        } catch (error) {
            console.error('❌ Failed to fetch events for date:', error);
            setGoogleState(prev => ({ ...prev, isLoading: false }));
        }
    };

    const handleDateChange = (days) => {
        const newDate = new Date(googleState.currentDisplayDate);
        newDate.setDate(newDate.getDate() + days);
        fetchEventsForDate(newDate);
    };

    // Load calendar info and check session on mount or when calendarId changes
    useEffect(() => {
        console.log('🔄 Calendar ID changed to:', calendarId);

        // Reset state first to clear previous calendar's data
        setGoogleState({
            isConnected: false,
            isLoading: false,
            events: null,
            todayDate: null,
            currentDisplayDate: new Date(),
            isExpanded: true
        });

        // Load calendar metadata
        const calendar = calendarManager.getById(calendarId);
        console.log('📋 Calendar metadata:', calendar);
        setCalendarInfo(calendar);

        // Check if THIS SPECIFIC calendar has a connected Google account
        const isConnected = googleService.checkSession(calendarId);
        console.log('🔐 Is calendar connected?', isConnected);

        if (isConnected) {
            console.log('✅ Calendar is connected, fetching events...');
            fetchEventsForDate(new Date());
        } else {
            console.log('❌ Calendar not connected, showing sync button');
        }
    }, [calendarId]);

    const handleGoogleSync = async () => {
        console.log('🔵 Starting Google Sync for calendar:', calendarId);
        setGoogleState(prev => ({ ...prev, isLoading: true }));
        try {
            console.log('🔵 Calling googleService.login()...');
            await googleService.login(calendarId);
            console.log('✅ Google login successful!');

            console.log('🔵 Fetching events...');
            await fetchEventsForDate(new Date());
            console.log('✅ Events fetched successfully!');
        } catch (error) {
            console.error('❌ Google Sync Failed:', error);
            setGoogleState(prev => ({ ...prev, isLoading: false }));
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <div className="px-8 py-5">
                {/* Page Header */}
                <div className="mb-6 pb-4 border-b border-border">
                    <h1 className="text-3xl tracking-tight font-heading font-semibold text-slate-900">
                        Calendar Integration
                    </h1>
                </div>

                {/* Google Calendar Integration */}
                <div className="max-w-6xl mx-auto">
                    <div className="group bg-white border border-border rounded-lg px-5 py-5 transition-all duration-150 hover:border-slate-400 hover:shadow-[0_4px_12px_rgba(0,0,0,0.12)]">

                        {/* Header Section (Visible in both states) */}
                        <div className="flex items-start gap-3 mb-5 pb-4 border-b border-border">
                            <div className="w-10 h-10 bg-gradient-to-br from-[#4285F4] via-[#EA4335] to-[#FBBC05] text-white rounded-lg flex items-center justify-center flex-shrink-0">
                                <Calendar className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                                <h2 className="font-heading font-semibold text-lg mb-1">Google Calendar Integration</h2>
                                <p className="text-sm text-muted-foreground">
                                    {googleState.isConnected
                                        ? 'View and manage your upcoming calendar events'
                                        : 'Connect your Google Calendar to view upcoming events and sync your schedule'}
                                </p>
                                {googleState.isConnected && (
                                    <p className="text-xs text-[rgb(42,153,116)] font-medium mt-2">
                                        Connected • Showing events of the day
                                    </p>
                                )}
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/50 border border-border rounded-md">
                                <span className="text-xs font-medium text-muted-foreground">Store:</span>
                                <span className="text-sm font-semibold text-foreground">
                                    {calendarInfo?.storeName || 'Unknown'}
                                </span>
                            </div>
                        </div>

                        {!googleState.isConnected ? (
                            /* DISCONNECTED STATE */
                            <div className="text-center py-6">
                                <Button
                                    onClick={handleGoogleSync}
                                    disabled={googleState.isLoading}
                                    className="bg-foreground hover:bg-foreground/90 text-white px-8 py-5 text-base cursor-pointer"
                                >
                                    {googleState.isLoading ? (
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            <span>Connecting...</span>
                                        </div>
                                    ) : (
                                        <>
                                            <Calendar className="w-5 h-5 mr-2" />
                                            Sync Google Calendar Events
                                        </>
                                    )}
                                </Button>
                                <p className="text-xs text-muted-foreground mt-3">
                                    Securely connect with Google OAuth • Read-only access
                                </p>
                            </div>
                        ) : (
                            /* CONNECTED STATE */
                            <div className="space-y-4">
                                {/* Date & Controls Header */}
                                <div className="flex items-center justify-between pb-3 border-b border-border">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-foreground text-white rounded-lg flex items-center justify-center">
                                            <Calendar className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h4 className="font-heading font-semibold text-foreground">
                                                {googleState.todayDate}
                                            </h4>
                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                {googleState.events?.length || 0} events scheduled
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center gap-1 mr-2 px-2 py-1 bg-gray-100 rounded-md border border-gray-200">
                                            <button
                                                onClick={() => handleDateChange(-1)}
                                                className="p-1 hover:bg-gray-200 rounded-full transition-colors cursor-pointer"
                                                title="Previous Day"
                                            >
                                                <ChevronLeft className="w-4 h-4 text-gray-600" />
                                            </button>

                                            <button
                                                onClick={() => fetchEventsForDate(new Date())}
                                                className="px-2 text-xs font-medium text-gray-600 hover:text-foreground transition-colors cursor-pointer"
                                                title="Go to Today"
                                            >
                                                Today
                                            </button>

                                            <button
                                                onClick={() => handleDateChange(1)}
                                                className="p-1 hover:bg-gray-200 rounded-full transition-colors cursor-pointer"
                                                title="Next Day"
                                            >
                                                <ChevronRight className="w-4 h-4 text-gray-600" />
                                            </button>
                                        </div>

                                        <button
                                            onClick={() => setGoogleState(prev => ({ ...prev, isExpanded: !prev.isExpanded }))}
                                            className="flex items-center gap-1.5 text-sm font-medium text-foreground hover:text-gray-600 transition-colors px-3 py-1.5 border border-border rounded-md hover:border-slate-400 cursor-pointer"
                                        >
                                            {googleState.isExpanded ? (
                                                <>
                                                    <ChevronUp className="w-4 h-4" />
                                                    Collapse
                                                </>
                                            ) : (
                                                <>
                                                    <ChevronDown className="w-4 h-4" />
                                                    Expand
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>


                                {/* Events List - Timeline Style */}
                                {googleState.isExpanded && (
                                    <div className="max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                        <div className="space-y-2">
                                            {googleState.events?.map((event, index) => (
                                                <div
                                                    key={event.id}
                                                    className="group flex items-center gap-3 bg-gray-50 border border-border rounded-lg px-4 py-4 transition-all duration-150 hover:border-slate-400 hover:shadow-[0_2px_8px_rgba(0,0,0,0.08)] hover:bg-white"
                                                >
                                                    {/* Timeline Dot & Line Wrapper */}
                                                    <div className="flex flex-col items-center flex-shrink-0 relative">

                                                        {/* The Dot */}
                                                        <div className="w-2.5 h-2.5 rounded-full bg-foreground ring-4 ring-gray-200 group-hover:ring-slate-300 transition-all z-10"></div>

                                                        {/* The Line */}
                                                        {/* {index !== (googleState.events?.length || 0) - 1 && (
                                                            <div className="absolute top-3 left-1/2 -translate-x-1/2 w-0.5 bg-gray-300 h-[200%]"></div>
                                                        )} */}
                                                    </div>

                                                    {/* Time */}
                                                    <div className="flex-shrink-0 w-20">
                                                        <span className="text-sm font-semibold text-foreground">
                                                            {event.time}
                                                        </span>
                                                    </div>

                                                    {/* Event Title */}
                                                    <div className="flex-1 min-w-0">
                                                        <h5 className="font-medium text-sm text-foreground leading-tight truncate">
                                                            {event.title}
                                                        </h5>
                                                    </div>

                                                    {/* Hover Arrow */}
                                                    <div className="flex-shrink-0 w-6 h-6 bg-foreground/10 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <svg className="w-3.5 h-3.5 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                        </svg>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
