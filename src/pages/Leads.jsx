import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Input } from '../components/ui/input';
import { Search, Loader2 } from 'lucide-react';
import { LeadModal } from '../components/LeadModal';
import { TemplateModal } from '../components/TemplateModal';

// Mock data stays here as a fallback
const mockLeads = [
    { id: 1, name: 'Sarah Johnson', phone: '+1 (555) 123-4567', campaign: 'Summer Sale 2024', campaignId: "1", interest: 'Enterprise Plan', status: 'Responded', date: '2024-12-17 14:32' },
    { id: 2, name: 'Michael Chen', phone: '+1 (555) 234-5678', campaign: 'Product Launch', campaignId: "2", interest: 'Starter Plan', status: 'Contacted', date: '2024-12-17 13:15' },
];

const statusColors = {
    New: 'bg-blue-50 text-blue-700 border border-blue-200',
    Contacted: 'bg-amber-50 text-amber-700 border border-amber-200',
    Responded: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    Converted: 'bg-purple-50 text-purple-700 border border-purple-200',
};

export function Leads() {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedLead, setSelectedLead] = useState(null);
    const [leads, setLeads] = useState(mockLeads); // Initialize with mock data
    const [loading, setLoading] = useState(false);
    const [searchParams] = useSearchParams();

    // Template selection state
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [showTemplateModal, setShowTemplateModal] = useState(false);

    const campaignFilter = searchParams.get('campaign');

    // API FETCH LOGIC
    useEffect(() => {
        const fetchSpecificLeads = async () => {
            if (!campaignFilter) return; // If no campaign selected, show all (mock)

            console.log(`📡 JARVIS: Fetching leads for Campaign ID: ${campaignFilter}`);
            setLoading(true);

            try {

                const response = await fetch(`http://localhost:5000/api/leads?campaignId=${campaignFilter}`);
                if (response.ok) {
                    const data = await response.json();
                    setLeads(data);
                    console.log("✅ JARVIS: Specific leads loaded from API.");
                } else {
                    throw new Error('API request failed');
                }
            } catch (error) {
                console.warn("⚠️ JARVIS: API not found. Filtering mock data instead.");
                // Filter mock data as a fallback
                const filtered = mockLeads.filter(l => String(l.campaignId) === String(campaignFilter));
                setLeads(filtered);
            } finally {
                setLoading(false);
            }
        };

        fetchSpecificLeads();
    }, [campaignFilter]);

    // Filtering for the Search Bar
    const displayLeads = leads.filter(lead =>
        lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.phone.includes(searchTerm)
    );

    const campaignName = campaignFilter && displayLeads.length > 0
        ? displayLeads[0].campaign
        : null;

    // Handle template selection
    const handleTemplateSelect = (template) => {
        setSelectedTemplate(template);
        console.log('Template selected:', template.elementName);
    };

    if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="min-h-screen bg-background">
            <div className="px-8 py-5">
                <div className="mb-6 pb-4 border-b border-border">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground mb-1">user@jarviscalling.ai's Org</p>
                            <h1 className="text-3xl tracking-tight font-heading font-semibold text-slate-900">
                                {campaignName ? `${campaignName} - Leads` : 'All Leads'}
                            </h1>
                        </div>

                        {/* Select Template Button */}
                        <button
                            onClick={() => setShowTemplateModal(true)}
                            className="px-4 py-2.5 border border-border rounded-md bg-white  text-foreground cursor-pointer hover:bg-slate-50 hover:border-slate-400 transition-all duration-150 font-medium text-sm shadow-sm whitespace-nowrap"
                        >
                            {selectedTemplate ? selectedTemplate.elementName : 'Select Template'}
                        </button>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="mb-5">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search leads..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 bg-white border-border focus:border-primary"
                        />
                    </div>
                </div>

                {/* Leads Table */}
                <div className="bg-white border border-border rounded-lg overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-50 border-b border-border">
                                    <th className="text-left px-5 py-3 text-sm font-medium text-slate-600">Name</th>
                                    <th className="text-left px-5 py-3 text-sm font-medium text-slate-600">Phone</th>
                                    <th className="text-left px-5 py-3 text-sm font-medium text-slate-600">Campaign</th>
                                    <th className="text-left px-5 py-3 text-sm font-medium text-slate-600">Status</th>
                                    <th className="text-left px-5 py-3 text-sm font-medium text-slate-600">Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {displayLeads.map((lead) => (
                                    <tr
                                        key={lead.id}
                                        onClick={() => setSelectedLead(lead)}
                                        className="border-b border-border last:border-0 transition-all hover:bg-slate-50 cursor-pointer"
                                    >
                                        <td className="px-5 py-3 text-sm font-medium text-slate-900">{lead.name}</td>
                                        <td className="px-5 py-3 text-sm text-slate-500">{lead.phone}</td>
                                        <td className="px-5 py-3 text-sm text-slate-500">{lead.campaign}</td>
                                        <td className="px-5 py-3">
                                            <span className={`text-xs px-2.5 py-1 rounded-md font-medium ${statusColors[lead.status]}`}>
                                                {lead.status}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3 text-sm text-slate-500">{lead.date}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {displayLeads.length === 0 && (
                    <div className="bg-white border border-border rounded-lg p-8 text-center mt-5">
                        <p className="text-muted-foreground">No leads found.</p>
                    </div>
                )}
            </div>

            {selectedLead && (
                <LeadModal lead={selectedLead} onClose={() => setSelectedLead(null)} />
            )}

            {showTemplateModal && (
                <TemplateModal
                    onClose={() => setShowTemplateModal(false)}
                    onSelectTemplate={handleTemplateSelect}
                />
            )}
        </div>
    );
}
