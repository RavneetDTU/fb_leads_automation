import { api, extractTime, extractDate, capitalizeStatus } from '../utils/apiClient';

/**
 * Transform API lead data to UI format
 */
function transformLeadData(apiLead) {
    return {
        id: apiLead.meta_lead_id || apiLead.lead_id,
        name: apiLead.name || 'N/A',
        phone: apiLead.phone || 'N/A',
        email: apiLead.email || 'N/A',
        campaign: apiLead.campaign_name || 'N/A',
        campaignId: apiLead.campaign_id,
        interest: apiLead.email || 'N/A', // Using email as interest since interest field isn't provided
        province: apiLead.province || 'N/A',
        preferred_practice: apiLead.preferred_practice || apiLead.practice_to_attend || apiLead.practice_to_visit || apiLead.practice_location || 'N/A',
        // practice_to_visit: apiLead.practice_to_visit || 'N/A',
        // practice_location: apiLead.practice_location || 'N/A',
        // practice_to_attend: apiLead.practice_to_attend || 'N/A',
        status: capitalizeStatus(apiLead.whatsapp_status || apiLead.status), // 'new' -> 'New', 'contacted' -> 'Contacted'
        time: extractTime(apiLead.created_at),
        date: extractDate(apiLead.created_at),
        last_message_date: (apiLead.last_message_time || apiLead.last_message_at) ? extractDate(apiLead.last_message_time || apiLead.last_message_at) : 'N/A',
        last_message_time: (apiLead.last_message_time || apiLead.last_message_at) ? extractTime(apiLead.last_message_time || apiLead.last_message_at): 'N/A', 

        // Additional fields from API
        adId: apiLead.ad_id,
        adName: apiLead.ad_name,
        adsetId: apiLead.adset_id,
        adsetName: apiLead.adset_name,
        platform: apiLead.platform,
        assignedTo: apiLead.assigned_to,
        createdAt: apiLead.created_at,
    };
}

export const leadsService = {
    /**
     * Get leads for a specific date
     * @param {string} date - Format YYYY-MM-DD
     * @returns {Promise<Array>}
     */
    async getDailyLeads(date) {
        try {
            console.log(`[LeadsService] Fetching leads for date: ${date}`);

            const data = await api.get(`/leads/date/${date}`);

            // Handle both { leads: [...], stats: {...} } wrapper and direct array responses
            const leadsArray = Array.isArray(data) ? data : (data.leads || []);
            const stats = data.stats || null;

            // Transform the data to match UI expectations
            const transformedLeads = leadsArray.map(transformLeadData);

            console.log(`[LeadsService] Successfully fetched ${transformedLeads.length} leads for ${date}`);

            return { leads: transformedLeads, stats };
        } catch (error) {
            console.error('[LeadsService] Failed to fetch daily leads:', error);
            throw error;
        }
    },

    /**
     * Get leads for a specific campaign
     * @param {string} campaignId - Campaign ID
     * @returns {Promise<Array>}
     */
    async getLeadsByCampaign(campaignId) {
        try {
            console.log(`[LeadsService] Fetching leads for campaign: ${campaignId}`);

            const data = await api.get(`/leads/campaign/${campaignId}`);

            // Handle both { leads: [...] } wrapper and direct array responses
            const leadsArray = Array.isArray(data) ? data : (data.leads || []);

            // Transform the data to match UI expectations
            const transformedLeads = leadsArray.map(transformLeadData);

            console.log(`[LeadsService] Successfully fetched ${transformedLeads.length} leads for campaign ${campaignId}`);

            return transformedLeads;
        } catch (error) {
            console.error('[LeadsService] Failed to fetch campaign leads:', error);
            throw error;
        }
    },

    /**
     * Get promoted leads for a specific date
     * @param {string} date - Format YYYY-MM-DD
     * @param {number} page - Page number
     * @param {number} limit - Items per page
     * @returns {Promise<Object>} - Returns {leads: Array, pagination: Object}
     */
    async getPromotedLeads(date, page = 1, limit = 10) {
        // This is still using mock data as the API endpoint isn't provided yet
        // Keep the existing implementation for now
        console.log(`[LeadsService] Note: getPromotedLeads still using mock data`);

        // Mock data matching the API response structure
        const mockPromotedLeads = [
            {
                id: 159,
                name: "Daniel Du Preez",
                phone: "0824935465",
                other_phone: "",
                whatsapp: "27824935465",
                store_name: "VREDENBERG",
                store_id: "43",
                date_created: "2026-01-15",
                lead_source_id: 9,
                created_at: "2026-01-15T14:52:19.310268+00:00",
                updated_at: "2026-01-15T14:52:19.310268+00:00",
                store_location: "<p>Shop U33 Weskus Mall</p><p>110 Saldanha Road</p><p>Vredenburg</p><p>7380</p>",
                first_name: "Daniel",
                last_name: "Du Preez",
                notes: "Explain results to PT- will contact us - No Funds at the moment"
            },
            // ... other mock data entries
        ];

        // Filter by date
        const filteredLeads = mockPromotedLeads.filter(lead => lead.date_created === date);

        return {
            leads: filteredLeads,
            pagination: {
                page: 1,
                limit: 10,
                total: filteredLeads.length,
                totalPages: Math.ceil(filteredLeads.length / 10)
            }
        };
    },

    /**
     * Create a demo lead
     * POST /leads/demo
     * @param {Object} demoLead - Demo lead data
     * @returns {Promise<Object>}
     */
    async createDemoLead(demoLead) {
        try {
            console.log('[LeadsService] Creating demo lead:', demoLead);
            const data = await api.post('/leads/demo', demoLead);
            console.log('[LeadsService] Demo lead created successfully:', data);
            return data;
        } catch (error) {
            console.error('[LeadsService] Failed to create demo lead:', error);
            throw error;
        }
    },

    /**
     * Get detail for a specific lead
     * @param {string} leadId
     * @returns {Promise<Object>}
     */
    async getLeadDetail(leadId) {
        try {
            console.log(`[LeadsService] Fetching detail for lead: ${leadId}`);
            const data = await api.get(`/leads/${leadId}/detail`);
            console.log('[LeadsService] Lead detail fetched:', data);
            return data;
        } catch (error) {
            console.error('[LeadsService] Failed to fetch lead detail:', error);
            throw error;
        }
    },

    /**
     * Update detail for a specific lead
     * @param {string} leadId
     * @param {Object} detail - { branch_name, status, name, email, phone_number, city }
     * @returns {Promise<Object>}
     */
    async updateLeadDetail(leadId, detail) {
        try {
            console.log(`[LeadsService] Updating detail for lead: ${leadId}`, detail);
            const data = await api.put(`/leads/${leadId}/detail`, detail);
            console.log('[LeadsService] Lead detail updated:', data);
            return data;
        } catch (error) {
            console.error('[LeadsService] Failed to update lead detail:', error);
            throw error;
        }
    },

    /**
     * Get all notes for a lead (ordered by note_number 1→10)
     * @param {string} leadId
     * @returns {Promise<Array>}
     */
    async getLeadNotes(leadId) {
        try {
            console.log(`[LeadsService] Fetching notes for lead: ${leadId}`);
            const data = await api.get(`/leads/${leadId}/notes`);
            console.log(`[LeadsService] Fetched ${data.length} notes`);
            return data;
        } catch (error) {
            console.error('[LeadsService] Failed to fetch lead notes:', error);
            throw error;
        }
    },

    /**
     * Add a note to a lead
     * @param {string} leadId
     * @param {string} content - Note content
     * @returns {Promise<Object>}
     */
    async addLeadNote(leadId, content) {
        try {
            console.log(`[LeadsService] Adding note to lead: ${leadId}`);
            const data = await api.post(`/leads/${leadId}/notes`, { content });
            console.log('[LeadsService] Note added:', data);
            return data;
        } catch (error) {
            console.error('[LeadsService] Failed to add lead note:', error);
            throw error;
        }
    },

    /**
     * Get answers for a lead's questions
     * @param {string} leadId
     * @returns {Promise<Object>} - { lead_id, difficulty_crowded, mumble_or_muffled, watch_face, updated_at }
     */
    async getLeadAnswers(leadId) {
        try {
            console.log(`[LeadsService] Fetching answers for lead: ${leadId}`);
            const data = await api.get(`/leads/${leadId}/answers`);
            console.log('[LeadsService] Lead answers fetched:', data);
            return data;
        } catch (error) {
            console.error('[LeadsService] Failed to fetch lead answers:', error);
            throw error;
        }
    },

    /**
     * Update answers for a lead's questions
     * @param {string} leadId
     * @param {Object} answers - { difficulty_crowded, mumble_or_muffled, watch_face }
     * @returns {Promise<Object>}
     */
    /**
     * Get leads from the last 30 days
     * @returns {Promise<Array>}
     */
    async getLast30DaysLeads() {
        try {
            console.log('[LeadsService] Fetching last 30 days leads');
            const data = await api.get('/leads/last-30-days');

            // Handle both { leads: [...], stats: {...} } wrapper and direct array responses
            const leadsArray = Array.isArray(data) ? data : (data.leads || []);
            const stats = data.stats || null;
            const transformedLeads = leadsArray.map(transformLeadData);
            console.log(`[LeadsService] Fetched ${transformedLeads.length} leads (last 30 days)`);
            return { leads: transformedLeads, stats };
        } catch (error) {
            console.error('[LeadsService] Failed to fetch last 30 days leads:', error);
            throw error;
        }
    },

    async updateLeadAnswers(leadId, answers) {
        try {
            console.log(`[LeadsService] Updating answers for lead: ${leadId}`, answers);
            const data = await api.put(`/leads/${leadId}/answers`, answers);
            console.log('[LeadsService] Lead answers updated:', data);
            return data;
        } catch (error) {
            console.error('[LeadsService] Failed to update lead answers:', error);
            throw error;
        }
    }
};
