import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar } from 'lucide-react';
import { campaignsService } from '../services/campaigns';

/* 
  DUMMY DATA - Implemented as fallback when API is not available 
  Todo: Remove or move to separate file when API is fully integrated
*/
const DUMMY_METRICS = [
    {
        title: 'Number of Campaigns',
        value: '12',
        change: '— 0.0%',
    },
    {
        title: 'Total Leads',
        value: '2,847',
        change: '— 12%',
    },
    {
        title: 'WhatsApp Messages',
        value: '2,401',
        change: '— 18%',
    },
    {
        title: 'Converted Leads',
        value: '814',
        change: '— 9%',
    },
];

const DUMMY_CAMPAIGNS = [
    {
        id: 1,
        name: 'Summer Sale 2024',
        platform: 'Facebook',
        leads: 487,
        newLeads: 24,
        contactedLeads: 142,
        convertedLeads: 25,
        status: 'Active',
        createdAt: 'Dec 10, 2024',
    },
    {
        id: 2,
        name: 'Product Launch',
        platform: 'Instagram',
        leads: 612,
        newLeads: 31,
        contactedLeads: 203,
        convertedLeads: 25,
        status: 'Active',
        createdAt: 'Dec 8, 2024',
    },
    {
        id: 3,
        name: 'Brand Awareness Q2',
        platform: 'Facebook',
        leads: 324,
        newLeads: 8,
        contactedLeads: 87,
        convertedLeads: 25,
        status: 'Paused',
        createdAt: 'Dec 5, 2024',
    },
    {
        id: 4,
        name: 'Retargeting Campaign',
        platform: 'Instagram',
        leads: 891,
        newLeads: 42,
        contactedLeads: 289,
        convertedLeads: 25,
        status: 'Active',
        createdAt: 'Dec 1, 2024',
    },
    {
        id: 5,
        name: 'Holiday Promo',
        platform: 'Facebook',
        leads: 533,
        newLeads: 19,
        contactedLeads: 163,
        convertedLeads: 25,
        status: 'Active',
        createdAt: 'Nov 28, 2024',
    },
    {
        id: 6,
        name: 'Spring Collection',
        platform: 'Instagram',
        leads: 278,
        newLeads: 12,
        contactedLeads: 94,
        convertedLeads: 25,
        status: 'Active',
        createdAt: 'Nov 25, 2024',
    },
];

export function Campaigns() {
    const navigate = useNavigate();

    // State for data
    const [metrics, setMetrics] = useState([]);
    const [campaigns, setCampaigns] = useState([]);

    // State for UI handling
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    /* 
      DATA FETCHING & METRICS CALCULATION
    */
    useEffect(() => {
        const fetchData = async () => {
            console.log('Campaigns Page: Starting data fetch...');
            setIsLoading(true);
            let data = [];

            try {
                // Try fetching from the service (API)
                data = await campaignsService.getCampaigns();
                console.log('Campaigns Page: Data fetched successfully from API', data);
            } catch (err) {
                console.warn('Campaigns Page: API call failed or not connected. Using LOCAL DUMMY DATA fallback.', err);
                // Fallback to local dummy data
                data = DUMMY_CAMPAIGNS;
            }

            // Set Campaigns Data
            setCampaigns(data);

            // Calculate Metrics Dynamically based on the 'data' (whether API or Dummy)
            const totalCampaigns = data.length;
            const totalLeads = data.reduce((sum, item) => sum + (item.leads || 0), 0);
            const totalContacted = data.reduce((sum, item) => sum + (item.contactedLeads || 0), 0);
            const totalConverted = data.reduce((sum, item) => sum + (item.convertedLeads || 0), 0);

            // Format numbers with commas (e.g. 2,847)
            const format = (num) => num.toLocaleString();

            const calculatedMetrics = [
                {
                    title: 'Number of Campaigns',
                    value: format(totalCampaigns),
                    change: '— 0.0%', // This would need historical data to calculate real change
                },
                {
                    title: 'Total Leads',
                    value: format(totalLeads),
                    change: '— 12%', // hardcoded for now
                },
                {
                    title: 'WhatsApp Messages', // Assuming 'Contacted' maps to msgs for this context, or keep hardcoded if different
                    value: format(totalContacted),
                    change: '— 18%',
                },
                {
                    title: 'Converted Leads',
                    value: format(totalConverted),
                    change: '— 9%',
                },
            ];

            setMetrics(calculatedMetrics);
            setIsLoading(false);
            console.log('Campaigns Page: Metrics calculated and state updated.');
        };

        fetchData();
    }, []); // Run once on mount

    const handleCampaignClick = (campaignId) => {
        console.log(`Campaigns Page: Navigating to details for campaign ID: ${campaignId}`);
        navigate(`/leads?campaign=${campaignId}`);
    };

    // Loading State UI
    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-muted-foreground animate-pulse">Loading Campaigns Data...</div>
            </div>
        );
    }

    // Error State UI (Optional, currently showing content anyway because of fallback)
    if (error && campaigns.length === 0) {
        return (
            <div className="min-h-screen bg-background p-8">
                <div className="text-red-500">Error: {error}</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="px-8 py-5">
                {/* Page Header */}
                <div className="mb-6 pb-4 border-b border-border">
                    <h1 className="text-3xl tracking-tight font-heading font-semibold">Campaigns</h1>
                </div>

                {/* Metrics Section */}
                <div className="mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                        {metrics.map((metric, index) => (
                            <div
                                key={index}
                                className="group bg-white border border-border rounded-lg px-5 py-4 transition-all duration-150 cursor-pointer hover:border-slate-400 hover:shadow-[0_6px_16px_rgba(0,0,0,0.18)]"
                            >
                                <div className="text-sm text-muted-foreground mb-1.5">
                                    {metric.title}
                                </div>
                                <div className="flex items-baseline gap-2">
                                    <div className="text-2xl font-heading font-semibold text-foreground">
                                        {metric.value}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        {metric.change}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Campaigns Grid Header */}
                <div className="mb-4 pb-3 border-b border-border">
                    <h2 className="text-xl font-heading font-semibold">All Campaigns</h2>
                </div>

                {/* Campaigns Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {campaigns.map((campaign) => (
                        <div
                            key={campaign.id}
                            onClick={() => handleCampaignClick(campaign.id)}
                            className="group bg-white border border-border rounded-lg px-5 py-4 cursor-pointer transition-all duration-150 hover:border-slate-400 hover:shadow-[0_6px_14px_rgba(0,0,0,0.16)]"
                        >
                            <div className="flex items-start justify-between mb-3 pb-2.5 border-b border-border">
                                <div className="flex-1">
                                    <h3 className="font-heading font-semibold mb-0.5 text-foreground">{campaign.name}</h3>
                                    <p className="text-sm text-muted-foreground">{campaign.platform}</p>
                                </div>
                                <span className={`text-xs px-2.5 py-1 rounded-md font-medium ${campaign.status === 'Active'
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : 'bg-gray-50 text-gray-600 border border-gray-200'
                                    }`}>
                                    {campaign.status}
                                </span>
                            </div>

                            <div className="space-y-2 mb-2.5">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Total Leads</span>
                                    <span className="text-sm font-medium text-foreground">{campaign.leads}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Today Leads</span>
                                    <span className="text-sm font-medium text-foreground">{campaign.newLeads}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Contacted Leads</span>
                                    <span className="text-sm font-medium text-foreground">{campaign.contactedLeads}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Converted Leads</span>
                                    <span className="text-sm font-medium text-foreground">{campaign.convertedLeads}</span>
                                </div>
                            </div>

                            <div className="pt-2.5 border-t border-border flex items-center gap-2 text-xs text-muted-foreground">
                                <Calendar className="w-3 h-3" />
                                {campaign.createdAt}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
