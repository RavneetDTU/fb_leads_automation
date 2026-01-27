
// Mock data moved from DailyLeads.jsx
const mockLeads = [
    {
        id: 1,
        name: 'Sarah Johnson',
        phone: '+1 (555) 123-4567',
        campaign: 'Summer Sale 2024',
        interest: 'Enterprise Plan',
        status: 'Responded',
        time: '14:32',
        date: '2024-12-18',
    },
    {
        id: 2,
        name: 'Michael Chen',
        phone: '+1 (555) 234-5678',
        campaign: 'Product Launch',
        interest: 'Starter Plan',
        status: 'Contacted',
        time: '13:15',
        date: '2024-12-18',
    },
    {
        id: 3,
        name: 'Emily Rodriguez',
        phone: '+1 (555) 345-6789',
        campaign: 'Summer Sale 2024',
        interest: 'Pro Plan',
        status: 'New',
        time: '12:48',
        date: '2024-12-18',
    },
    {
        id: 4,
        name: 'David Kim',
        phone: '+1 (555) 456-7890',
        campaign: 'Holiday Promo',
        interest: 'Enterprise Plan',
        status: 'Contacted',
        time: '11:22',
        date: '2024-12-17',
    },
    {
        id: 5,
        name: 'Jessica Taylor',
        phone: '+1 (555) 567-8901',
        campaign: 'Product Launch',
        interest: 'Starter Plan',
        status: 'Responded',
        time: '10:05',
        date: '2024-12-17',
    },
    {
        id: 6,
        name: 'Robert Wilson',
        phone: '+1 (555) 678-9012',
        campaign: 'Brand Awareness Q2',
        interest: 'Pro Plan',
        status: 'New',
        time: '09:45',
        date: '2024-12-17',
    },
    {
        id: 7,
        name: 'Amanda Foster',
        phone: '+1 (555) 789-0123',
        campaign: 'Retargeting Campaign',
        interest: 'Enterprise Plan',
        status: 'Responded',
        time: '08:30',
        date: '2024-12-17',
    },
    {
        id: 8,
        name: 'James Patterson',
        phone: '+1 (555) 890-1234',
        campaign: 'Holiday Promo',
        interest: 'Starter Plan',
        status: 'Contacted',
        time: '07:15',
        date: '2024-12-17',
    },
];

export const leadsService = {
    /**
     * Get leads for a specific date
     * @param {string} date - Format YYYY-MM-DD
     * @returns {Promise<Array>}
     */
    async getDailyLeads(date) {
        // --- REAL API IMPLEMENTATION ---
        /*
        try {
          const response = await fetch(`/api/leads?date=${date}`);
          if (!response.ok) throw new Error('Failed to fetch leads');
          return await response.json();
        } catch (error) {
          console.error('API Error:', error);
          throw error;
        }
        */

        // --- MOCK IMPLEMENTATION ---
        console.log(`[LeadsService] Fetching leads for date: ${date}`);
        await new Promise(resolve => setTimeout(resolve, 600)); // Simulate delay

        return mockLeads.filter(lead => lead.date === date);
    },

    /**
     * Get promoted leads for a specific date
     * @param {string} date - Format YYYY-MM-DD
     * @param {number} page - Page number
     * @param {number} limit - Items per page
     * @returns {Promise<Object>} - Returns {leads: Array, pagination: Object}
     */
    async getPromotedLeads(date, page = 1, limit = 10) {
        // --- REAL API IMPLEMENTATION ---
        /*
        try {
          const response = await fetch(`/api/promoted-leads?date=${date}&page=${page}&limit=${limit}`);
          if (!response.ok) throw new Error('Failed to fetch promoted leads');
          return await response.json();
        } catch (error) {
          console.error('API Error:', error);
          throw error;
        }
        */

        // --- MOCK IMPLEMENTATION ---
        console.log(`[LeadsService] Fetching promoted leads for date: ${date}, page: ${page}, limit: ${limit}`);
        await new Promise(resolve => setTimeout(resolve, 600)); // Simulate delay

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
            {
                id: 157,
                name: "Paul Bethke",
                phone: "0795025199",
                other_phone: "",
                whatsapp: "27795025199",
                store_name: "VREDENBERG",
                store_id: "43",
                date_created: "2026-01-15",
                lead_source_id: 9,
                created_at: "2026-01-15T14:44:46.368091+00:00",
                updated_at: "2026-01-15T14:44:46.368091+00:00",
                store_location: null,
                first_name: "Paul",
                last_name: "Bethke",
                notes: ""
            },
            {
                id: 160,
                name: "Elsa De Bieh",
                phone: "0763547638",
                other_phone: "",
                whatsapp: "27763547638",
                store_name: "VREDENBERG",
                store_id: "43",
                date_created: "2026-01-15",
                lead_source_id: 9,
                created_at: "2026-01-15T14:55:13.872773+00:00",
                updated_at: "2026-01-15T14:55:13.872773+00:00",
                store_location: null,
                first_name: "Elsa",
                last_name: "De Bieh",
                notes: ""
            },
            {
                id: 161,
                name: "Fleris Fourie",
                phone: "0796958213",
                other_phone: "",
                whatsapp: "27796958213",
                store_name: "VREDENBERG",
                store_id: "43",
                date_created: "2026-01-15",
                lead_source_id: 9,
                created_at: "2026-01-15T14:58:05.109381+00:00",
                updated_at: "2026-01-15T14:58:05.109381+00:00",
                store_location: null,
                first_name: "Fleris",
                last_name: "Fourie",
                notes: ""
            },
            {
                id: 155,
                name: "Kristal Africa",
                phone: "0602619532",
                other_phone: "",
                whatsapp: "27602619532",
                store_name: "VREDENBERG",
                store_id: "43",
                date_created: "2026-01-15",
                lead_source_id: 9,
                created_at: "2026-01-15T14:38:43.658088+00:00",
                updated_at: "2026-01-15T14:38:43.658088+00:00",
                store_location: null,
                first_name: "Kristal",
                last_name: "Africa",
                notes: ""
            },
            {
                id: 156,
                name: "Donaven Moodley",
                phone: "0614238375",
                other_phone: "",
                whatsapp: "27614238375",
                store_name: "VREDENBERG",
                store_id: "43",
                date_created: "2026-01-15",
                lead_source_id: 9,
                created_at: "2026-01-15T14:42:03.520143+00:00",
                updated_at: "2026-01-15T14:42:03.520143+00:00",
                store_location: null,
                first_name: "Donaven",
                last_name: "Moodley",
                notes: ""
            },
            {
                id: 158,
                name: "Chad Collins",
                phone: "0662733106",
                other_phone: "",
                whatsapp: "27662733106",
                store_name: "VREDENBERG",
                store_id: "43",
                date_created: "2026-01-15",
                lead_source_id: 9,
                created_at: "2026-01-15T14:46:37.05185+00:00",
                updated_at: "2026-01-15T14:46:37.05185+00:00",
                store_location: "<p>Shop U33 Weskus Mall</p><p>110 Saldanha Road</p><p>Vredenburg</p><p>7380</p>",
                first_name: "Chad",
                last_name: "Collins",
                notes: "Normal Hearing\r\nAnnual Monitoring"
            },
            {
                id: 152,
                name: "Abraham Rabe",
                phone: "0738706871",
                other_phone: "",
                whatsapp: "27738706871",
                store_name: "VREDENBERG",
                store_id: "43",
                date_created: "2026-01-08",
                lead_source_id: 9,
                created_at: "2026-01-08T14:50:37.722987+00:00",
                updated_at: "2026-01-08T14:50:37.722987+00:00",
                store_location: "<p>Shop U33 Weskus Mall</p><p>110 Saldanha Road</p><p>Vredenburg</p><p>7380</p>",
                first_name: "Abraham",
                last_name: "Rabe",
                notes: "Test at clinic, 1 ear HL? Struggle at distance"
            },
            {
                id: 153,
                name: "Bernond Brown",
                phone: "0785831773",
                other_phone: "",
                whatsapp: "27785831773",
                store_name: "VREDENBERG",
                store_id: "43",
                date_created: "2026-01-08",
                lead_source_id: 9,
                created_at: "2026-01-08T14:52:21.884414+00:00",
                updated_at: "2026-01-08T14:52:21.884414+00:00",
                store_location: null,
                first_name: "Bernond",
                last_name: "Brown",
                notes: ""
            },
            {
                id: 150,
                name: "Abram Nieuwoudt",
                phone: "0847643941",
                other_phone: "",
                whatsapp: "27847643941",
                store_name: "VREDENBERG",
                store_id: "43",
                date_created: "2026-01-08",
                lead_source_id: 9,
                created_at: "2026-01-08T14:39:47.825985+00:00",
                updated_at: "2026-01-08T14:39:47.825985+00:00",
                store_location: null,
                first_name: "Abram",
                last_name: "Nieuwoudt",
                notes: ""
            }
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

