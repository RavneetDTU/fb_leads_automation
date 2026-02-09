/**
 * Templates Service
 * 
 * Handles all API calls related to WhatsApp message templates from WATI platform.
 * Provides functions to fetch approved templates with pagination support.
 */

// WATI API Base URL
const WATI_API_BASE = 'https://live-mt-server.wati.io/430845';

// Get API token from environment variables
const getAuthToken = () => {
    const token = import.meta.env.VITE_WATI_API_TOKEN;
    if (!token) {
        console.warn('[TemplatesService] No WATI API token found in environment variables');
    }
    return token;
};

export const templatesService = {
    /**
     * Fetch message templates with pagination
     * @param {number} pageSize - Number of templates per page (default: 5)
     * @param {number} pageNumber - Page number to fetch (default: 1)
     * @returns {Promise<Object>} - Object containing messageTemplates array and link object
     */
    async getTemplates(pageSize = 5, pageNumber = 1) {
        try {
            const url = `${WATI_API_BASE}/api/v1/getMessageTemplates?pageSize=${pageSize}&pageNumber=${pageNumber}`;

            console.log(`[TemplatesService] Fetching templates: page ${pageNumber}, size ${pageSize}`);

            const token = getAuthToken();
            const headers = {
                'Content-Type': 'application/json',
            };

            // Add authorization header if token is available
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(url, {
                method: 'GET',
                headers: headers,
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('[TemplatesService] API Error:', response.status, errorText);
                throw new Error(`Failed to fetch templates: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();

            console.log(`[TemplatesService] Successfully fetched ${data.messageTemplates?.length || 0} templates`);

            return {
                templates: data.messageTemplates || [],
                pagination: data.link || {},
                result: data.result,
            };
        } catch (error) {
            console.error('[TemplatesService] Error fetching templates:', error);
            throw error;
        }
    },

    /**
     * Fetch templates using a direct URL (for pagination)
     * @param {string} url - Full URL for the next page
     * @returns {Promise<Object>} - Object containing messageTemplates array and link object
     */
    async getTemplatesByUrl(url) {
        try {
            console.log('[TemplatesService] Fetching templates from URL:', url);

            const token = getAuthToken();
            const headers = {
                'Content-Type': 'application/json',
            };

            // Add authorization header if token is available
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(url, {
                method: 'GET',
                headers: headers,
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('[TemplatesService] API Error:', response.status, errorText);
                throw new Error(`Failed to fetch templates: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();

            console.log(`[TemplatesService] Successfully fetched ${data.messageTemplates?.length || 0} templates`);

            return {
                templates: data.messageTemplates || [],
                pagination: data.link || {},
                result: data.result,
            };
        } catch (error) {
            console.error('[TemplatesService] Error fetching templates:', error);
            throw error;
        }
    },

    /**
     * Filter templates to show only APPROVED ones
     * @param {Array} templates - Array of template objects
     * @returns {Array} - Filtered array of approved templates
     */
    filterApprovedTemplates(templates) {
        return templates.filter(template => template.status === 'APPROVED');
    },
};
