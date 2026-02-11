import { config } from '../config';

/**
 * Custom error class for API errors
 */
export class APIError extends Error {
    constructor(message, status, data) {
        super(message);
        this.name = 'APIError';
        this.status = status;
        this.data = data;
    }
}

/**
 * Makes a fetch request with proper error handling
 * @param {string} url - Full URL or path (if path, will use leadsApiBaseUrl)
 * @param {object} options - Fetch options
 * @returns {Promise<any>} - Parsed JSON response
 */
export async function apiRequest(url, options = {}) {
    const fullUrl = url.startsWith('http') ? url : `${config.leadsApiBaseUrl}${url}`;

    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
        ...options,
    };

    try {
        console.log(`[API] Request: ${defaultOptions.method || 'GET'} ${fullUrl}`);

        const response = await fetch(fullUrl, defaultOptions);

        // Handle non-2xx responses
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new APIError(
                errorData.message || `HTTP ${response.status}: ${response.statusText}`,
                response.status,
                errorData
            );
        }

        const data = await response.json();
        console.log(`[API] Success: ${defaultOptions.method || 'GET'} ${fullUrl}`, data);

        return data;
    } catch (error) {
        // If it's already an APIError, rethrow it
        if (error instanceof APIError) {
            console.error(`[API] Error: ${error.message}`, error);
            throw error;
        }

        // Network or parsing errors
        console.error(`[API] Network/Parse Error:`, error);
        throw new APIError(
            error.message || 'Network request failed',
            0,
            { originalError: error }
        );
    }
}

/**
 * Utility functions for common HTTP methods
 */
export const api = {
    get: (url, options = {}) => apiRequest(url, { ...options, method: 'GET' }),
    post: (url, data, options = {}) => apiRequest(url, {
        ...options,
        method: 'POST',
        body: JSON.stringify(data),
    }),
    put: (url, data, options = {}) => apiRequest(url, {
        ...options,
        method: 'PUT',
        body: JSON.stringify(data),
    }),
    delete: (url, options = {}) => apiRequest(url, { ...options, method: 'DELETE' }),
};

/**
 * Helper to extract time from ISO datetime string
 * @param {string} isoString - ISO datetime string
 * @returns {string} - Time in HH:MM format
 */
export function extractTime(isoString) {
    if (!isoString) return 'N/A';
    try {
        const date = new Date(isoString);
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    } catch {
        return 'N/A';
    }
}

/**
 * Helper to extract date from ISO datetime string
 * @param {string} isoString - ISO datetime string
 * @returns {string} - Date in YYYY-MM-DD format
 */
export function extractDate(isoString) {
    if (!isoString) return 'N/A';
    try {
        const date = new Date(isoString);
        return date.toISOString().split('T')[0];
    } catch {
        return 'N/A';
    }
}

/**
 * Capitalize first letter of each word
 * @param {string} str - String to capitalize
 * @returns {string} - Capitalized string
 */
export function capitalizeStatus(str) {
    if (!str) return 'N/A';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}
