import { config } from '../config';

const SCOPES = 'https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/userinfo.profile';
const BACKEND_URL = config.backendUrl || 'http://localhost:5000'; // Make sure this is in your env

export const googleService = {
    // Get token for specific calendar
    getTokenForCalendar: (calendarId) => {
        const data = localStorage.getItem(`google_calendar_${calendarId}`);
        if (!data) return null;

        try {
            return JSON.parse(data);
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

    // Refresh Token Logic (Called automatically when 401 occurs)
    refreshAccessToken: async (calendarId) => {
        try {
            console.log(`[GoogleService] Attempting to refresh token for ${calendarId}...`);
            const response = await fetch(`${BACKEND_URL}/api/auth/refresh`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ calendarId })
            });

            if (!response.ok) {
                throw new Error('Failed to refresh token from backend');
            }

            const data = await response.json();
            
            if (data.success && data.access_token) {
                // Keep the same store format, just update the token and expiry
                const currentData = googleService.getTokenForCalendar(calendarId) || {};
                const tokenData = {
                    ...currentData,
                    accessToken: data.access_token,
                    expiresAt: data.expiry_date || (Date.now() + 3599 * 1000)
                };
                localStorage.setItem(`google_calendar_${calendarId}`, JSON.stringify(tokenData));
                console.log(`[GoogleService] Token refreshed successfully!`);
                return data.access_token;
            }
            throw new Error('No access token in refresh response');
        } catch (error) {
            console.error('[GoogleService] Formally Logging out due to refresh failure:', error);
            googleService.logout(calendarId);
            throw error; // Let the UI know so it can show the login button
        }
    },

    // Auth Code Flow to Backend
    login: async (calendarId, storeName) => {
        return new Promise((resolve, reject) => {
            if (typeof google === 'undefined') {
                reject(new Error('Google Identity Services script not loaded'));
                return;
            }

            if (!config.googleClientId) {
                reject(new Error('Missing Google Client ID. Please add VITE_GOOGLE_CLIENT_ID to your .env file.'));
                return;
            }

            const client = google.accounts.oauth2.initCodeClient({
                client_id: config.googleClientId,
                scope: SCOPES,
                ux_mode: 'popup',
                // This is absolutely critical to get a refresh_token from Google
                access_type: 'offline', 
                callback: async (response) => {
                    if (response.code) {
                        try {
                            console.log('Sending authorization code to backend...');
                            // Send Code to Backend
                            const res = await fetch(`${BACKEND_URL}/api/auth/google`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ 
                                    code: response.code,
                                    calendarId: calendarId,
                                    storeName: storeName
                                })
                            });

                            if (!res.ok) throw new Error('Backend failed to process Google Code');
                            
                            const data = await res.json();
                            
                            if (data.success && data.access_token) {
                                // Store frontend session info
                                const tokenData = {
                                    accessToken: data.access_token,
                                    expiresAt: data.expiry_date || (Date.now() + 3599 * 1000),
                                    storeName: storeName
                                };
                                localStorage.setItem(`google_calendar_${calendarId}`, JSON.stringify(tokenData));

                                // Also update the calendar manager with the email if provided
                                if (data.email) {
                                    import('../utils/calendarManager').then(({ calendarManager }) => {
                                        calendarManager.update(calendarId, { email: data.email });
                                    });
                                }

                                resolve(data);
                            } else {
                                reject(new Error('Backend did not return an access token'));
                            }
                        } catch (err) {
                            reject(err);
                        }
                    } else {
                        reject(new Error('No authorization code received from Google'));
                    }
                },
                error_callback: (err) => {
                    reject(err);
                }
            });

            // If the user previously logged in, we might need to prompt them to select account again to ensure we get a refresh token
            client.requestCode();
        });
    },

    // A helper method to perform fetch with automatic token refresh
    fetchWithRetry: async (calendarId, url, options = {}) => {
        let tokenData = googleService.getTokenForCalendar(calendarId);
        if (!tokenData || !tokenData.accessToken) {
            throw new Error('Not authenticated');
        }

        // Add Auth header
        let authOptions = {
            ...options,
            headers: {
                ...options.headers,
                'Authorization': `Bearer ${tokenData.accessToken}`,
                'Content-Type': 'application/json'
            }
        };

        let response = await fetch(url, authOptions);

        // If we get 401 Unauthorized, token probably expired!
        if (response.status === 401) {
            console.log('[GoogleService] Token expired (401). Intercepting and refreshing...');
            
            // Wait for new token
            const newAccessToken = await googleService.refreshAccessToken(calendarId);
            
            // Retry the original request with the new token
            authOptions.headers['Authorization'] = `Bearer ${newAccessToken}`;
            response = await fetch(url, authOptions);
        }

        return response;
    },

    // Fetch Events for specific date and calendar
    getEvents: async (date = new Date(), calendarId) => {
        try {
            const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59);

            const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${startOfDay.toISOString()}&timeMax=${endOfDay.toISOString()}&singleEvents=true&orderBy=startTime`;
            
            // Using the new wrapper that handles 401s invisibly
            const response = await googleService.fetchWithRetry(calendarId, url);

            if (!response.ok) {
                // If it's STILL 401 after retry, or something else went wrong
                if (response.status === 401) {
                     googleService.logout(calendarId);
                     throw new Error('Session completely expired. Needs re-login.');
                }
                throw new Error('Failed to fetch events');
            }

            const data = await response.json();

            const formatDate = (date) => {
                return new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).format(date);
            };

            const formatTime = (isoString) => {
                if (!isoString) return 'All Day';
                return new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }).format(new Date(isoString));
            };

            const events = (data.items || []).map(event => ({
                id: event.id,
                title: event.summary || 'No Title',
                time: event.start.dateTime ? formatTime(event.start.dateTime) : 'All Day',
                color: '#3B82F6'
            }));

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

    // Create a calendar event for a specific store/calendar
    createEvent: async (calendarId, eventData) => {
        try {
            const url = 'https://www.googleapis.com/calendar/v3/calendars/primary/events?sendUpdates=all';
            
            // Using the new wrapper that handles 401s invisibly
            const response = await googleService.fetchWithRetry(calendarId, url, {
                method: 'POST',
                body: JSON.stringify(eventData)
            });

            if (!response.ok) {
                 if (response.status === 401) {
                     googleService.logout(calendarId);
                     throw new Error('Session completely expired. Please reconnect Google account.');
                }
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error?.message || 'Failed to create event');
            }

            const createdEvent = await response.json();
            console.log('[GoogleService] Event created:', createdEvent.id, createdEvent.htmlLink);
            return createdEvent;
        } catch (error) {
            console.error('Error creating calendar event:', error);
            throw error;
        }
    },

    // Get all stores that have a connected (non-expired) Google account
    getConnectedStores: () => {
        const stores = [];
        const prefix = 'google_calendar_';

        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(prefix)) {
                const calendarId = key.slice(prefix.length);
                const token = googleService.getTokenForCalendar(calendarId);
                if (token && token.storeName) {
                    stores.push({ id: calendarId, name: token.storeName });
                }
            }
        }

        return stores;
    },

    // Logout for specific calendar
    logout: (calendarId) => {
        localStorage.removeItem(`google_calendar_${calendarId}`);
    }
};
