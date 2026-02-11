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
        status: capitalizeStatus(apiLead.status), // 'new' -> 'New', 'contacted' -> 'Contacted'
        time: extractTime(apiLead.created_at),
        date: extractDate(apiLead.created_at),

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

            // Transform the data to match UI expectations
            const transformedLeads = data.map(transformLeadData);

            console.log(`[LeadsService] Successfully fetched ${transformedLeads.length} leads for ${date}`);

            return transformedLeads;
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

            // Transform the data to match UI expectations
            const transformedLeads = data.map(transformLeadData);

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
    }
};
