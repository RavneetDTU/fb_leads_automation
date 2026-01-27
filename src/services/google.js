import { config } from '../config';

const SCOPES = 'https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/userinfo.profile';

export const googleService = {
    // Get token for specific calendar
    getTokenForCalendar: (calendarId) => {
        const data = localStorage.getItem(`google_calendar_${calendarId}`);
        if (!data) return null;

        try {
            const token = JSON.parse(data);
            // Check if token is expired
            if (token.expiresAt && token.expiresAt < Date.now()) {
                localStorage.removeItem(`google_calendar_${calendarId}`);
                return null;
            }
            return token;
        } catch (error) {
            console.error('Failed to parse token:', error);
            return null;
        }
    },

    // Check if user is already connected for specific calendar
    checkSession: (calendarId) => {
        const token = googleService.getTokenForCalendar(calendarId);
        return token !== null;
    },

    // Real Google Login Flow with calendar ID
    login: async (calendarId) => {
        return new Promise((resolve, reject) => {
            // Check if the script is loaded
            if (typeof google === 'undefined') {
                reject(new Error('Google Identity Services script not loaded'));
                return;
            }

            // Check for Client ID
            if (!config.googleClientId) {
                reject(new Error('Missing Google Client ID. Please add VITE_GOOGLE_CLIENT_ID to your .env file.'));
                return;
            }

            const client = google.accounts.oauth2.initTokenClient({
                client_id: config.googleClientId,
                scope: SCOPES,
                callback: (response) => {
                    if (response.access_token) {
                        // Store token with calendar ID
                        const tokenData = {
                            accessToken: response.access_token,
                            expiresAt: Date.now() + ((response.expires_in || 3599) * 1000)
                        };
                        localStorage.setItem(`google_calendar_${calendarId}`, JSON.stringify(tokenData));

                        resolve(response);
                    } else {
                        reject(new Error('No access token received'));
                    }
                },
                error_callback: (err) => {
                    reject(err);
                }
            });

            client.requestAccessToken();
        });
    },

    // Fetch Events for specific date and calendar
    getEvents: async (date = new Date(), calendarId) => {
        const tokenData = googleService.getTokenForCalendar(calendarId);
        if (!tokenData) throw new Error('Not authenticated');

        const token = tokenData.accessToken;

        try {
            // Calculate start and end of specific date
            const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59);


            const response = await fetch(
                `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${startOfDay.toISOString()}&timeMax=${endOfDay.toISOString()}&singleEvents=true&orderBy=startTime`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (!response.ok) {
                if (response.status === 401) {
                    localStorage.removeItem(`google_calendar_${calendarId}`);
                    throw new Error('Session expired');
                }
                throw new Error('Failed to fetch events');
            }

            const data = await response.json();
            // console.log("data is",data);

            const formatDate = (date) => {
                return new Intl.DateTimeFormat('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                }).format(date);
            };

            const formatTime = (isoString) => {
                if (!isoString) return 'All Day';
                return new Intl.DateTimeFormat('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                }).format(new Date(isoString));
            };

            // Transform API events to UI format
            const events = (data.items || []).map(event => ({
                id: event.id,
                title: event.summary || 'No Title',
                time: event.start.dateTime ? formatTime(event.start.dateTime) : 'All Day',
                color: '#3B82F6' // Default blue for now
            }));

            console.log("events are", events);

            return {
                date: formatDate(date),
                count: events.length,
                events: events
            };

        } catch (error) {
            console.error('Error fetching calendar events:', error);
            throw error;
        }
    },

    // Logout for specific calendar
    logout: (calendarId) => {
        localStorage.removeItem(`google_calendar_${calendarId}`);
    }
};
