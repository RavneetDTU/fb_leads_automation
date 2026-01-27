import { config } from '../config';

// Change this to your actual API base URL when ready
const API_BASE_URL = config.apiBaseUrl;

export const campaignsService = {
    /**
     * Fetch all campaigns for the organization
     * @returns {Promise<Array>} - List of campaigns
     */
    async getCampaigns() {
        // --- REAL API IMPLEMENTATION ---
        /*
        const response = await fetch(`${API_BASE_URL}/campaigns`, {
          method: 'GET',
          headers: { 
            'Content-Type': 'application/json',
            // 'Authorization': `Bearer ${token}` 
          },
        });
    
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch campaigns');
        }
    
        return response.json();
        */

        // --- MOCK IMPLEMENTATION / FALLBACK TRIGGER ---
        // If the API is not ready, we can throw an error to trigger the fallback in the component
        // OR we can return null/undefined to indicate no data found.
        // For now, let's simulate a failed connection so the component uses its local dummy data.

        console.log('[CampaignsService] Fetching campaigns endpoint...');
        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 800));

        // Throw error to simulate "API not connected" -> triggers Component Fallback
        throw new Error('API_NOT_CONNECTED');
    }
};
