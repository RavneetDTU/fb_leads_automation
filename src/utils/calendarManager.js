const STORAGE_KEY = 'mets_calendars';

export const calendarManager = {
    // Get all calendars
    getAll() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        } catch (error) {
            console.error('Failed to load calendars:', error);
            return [];
        }
    },

    // Get single calendar by ID
    getById(id) {
        return this.getAll().find(cal => cal.id === id);
    },

    // Create new calendar
    create(storeName) {
        const id = storeName.toLowerCase().replace(/\s+/g, '-');

        // Check if calendar with this ID already exists
        if (this.getById(id)) {
            throw new Error(`Calendar "${storeName}" already exists`);
        }

        const calendar = {
            id,
            storeName,
            email: null,
            createdAt: Date.now()
        };

        const calendars = this.getAll();
        calendars.push(calendar);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(calendars));

        return calendar;
    },

    // Update calendar (e.g., add email after Google login)
    update(id, updates) {
        const calendars = this.getAll();
        const index = calendars.findIndex(cal => cal.id === id);

        if (index !== -1) {
            calendars[index] = { ...calendars[index], ...updates };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(calendars));
            return calendars[index];
        }

        return null;
    },

    // Delete calendar
    delete(id) {
        const calendars = this.getAll().filter(cal => cal.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(calendars));

        // Also remove the associated Google token
        localStorage.removeItem(`google_calendar_${id}`);

        return true;
    }
};
