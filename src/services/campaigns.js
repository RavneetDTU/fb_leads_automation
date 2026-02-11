import { api, capitalizeStatus } from '../utils/apiClient';

/**
 * Transform API campaign data to UI format
 */
function transformCampaignData(apiCampaign) {
  // Extract date from last_fetch_time (use as campaign date since creation date isn't provided)
  const createdAt = apiCampaign.last_fetch_time
    ? new Date(apiCampaign.last_fetch_time).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
    : 'N/A';

  return {
    id: apiCampaign.id,
    name: apiCampaign.name,
    platform: apiCampaign.platform ? apiCampaign.platform.charAt(0).toUpperCase() + apiCampaign.platform.slice(1) : 'Facebook', // Use API platform or default to Facebook
    status: capitalizeStatus(apiCampaign.status), // 'ACTIVE' -> 'Active'
    selectedTemplate: apiCampaign.template_name || 'No Template Selected',
    lastFetchTime: apiCampaign.last_fetch_time,
    createdAt: createdAt,

    // These fields are not provided by the API yet
    // Will be populated when stats API becomes available
    leads: 0,
    newLeads: 0,
    contactedLeads: 0,
    convertedLeads: 0,
  };
}

export const campaignsService = {
  /**
   * Fetch all campaigns for the organization
   * @param {boolean} sync - Whether to sync with Meta (default: false)
   * @returns {Promise<Array>} - List of campaigns
   */
  async getCampaigns(sync = false) {
    try {
      console.log('[CampaignsService] Fetching campaigns from API...');

      const data = await api.get(`/campaigns/?sync=${sync}`);

      // Transform the data to match UI expectations
      const transformedCampaigns = data.map(transformCampaignData);

      console.log('[CampaignsService] Successfully fetched and transformed campaigns:', transformedCampaigns);

      return transformedCampaigns;
    } catch (error) {
      console.error('[CampaignsService] Failed to fetch campaigns:', error);
      throw error;
    }
  },

  /**
   * Update template for a campaign
   * @param {string} campaignId - Campaign ID
   * @param {string} templateName - Template name to set
   * @returns {Promise<Object>} - Update response
   */
  async updateCampaignTemplate(campaignId, templateName) {
    try {
      console.log(`[CampaignsService] Updating template for campaign ${campaignId} to ${templateName}`);

      const data = await api.post(`/campaigns/${campaignId}/template?template_name=${templateName}`);

      console.log('[CampaignsService] Template updated successfully:', data);

      return data;
    } catch (error) {
      console.error('[CampaignsService] Failed to update campaign template:', error);
      throw error;
    }
  }
};
