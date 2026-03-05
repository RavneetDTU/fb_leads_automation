import React, { useState, useEffect } from 'react';
import { LeadModal } from '../components/LeadModal';
import { leadsService } from '../services/leads';
import { sendTemplateMessage } from '../services/whatsapp';

const statusColors = {
    New: 'bg-blue-50 text-blue-700 border border-blue-200',
    Contacted: 'bg-amber-50 text-amber-700 border border-amber-200',
    Responded: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    Converted: 'bg-purple-50 text-purple-700 border border-purple-200',
};

export default function Last30DaysLeads() {
    const [selectedLead, setSelectedLead] = useState(null);
    const [leads, setLeads] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    // Send message state
    const [sendingLeadId, setSendingLeadId] = useState(null);
    const [sentLeadIds, setSentLeadIds] = useState(new Set());

    const handleSendMessage = async (e, lead) => {
        e.stopPropagation();
        if (sendingLeadId === lead.id) return;

        if (!lead.campaignId) {
            alert(`Cannot send: no campaign ID found for lead "${lead.name}"`);
            return;
        }
        if (!lead.phone) {
            alert(`Cannot send: no phone number found for lead "${lead.name}"`);
            return;
        }

        setSendingLeadId(lead.id);
        try {
            await sendTemplateMessage(lead.campaignId, lead.phone);
            setSentLeadIds(prev => new Set(prev).add(lead.id));
        } catch (err) {
            console.error('[Last30Days] sendTemplateMessage error:', err.message);
            alert(`Failed to send message to ${lead.name}: ${err.message}`);
        } finally {
            setSendingLeadId(null);
        }
    };

    // Fetch leads on mount + poll every 30s
    useEffect(() => {
        const fetchLeads = async (silent = false) => {
            if (!silent) {
                setIsLoading(true);
                setError(null);
            }
            try {
                const data = await leadsService.getLast30DaysLeads();
                setLeads(data);
            } catch (err) {
                console.error('[Last30Days] Failed to load leads:', err);
                if (!silent) {
                    setError(err.message || 'Failed to load leads');
                    setLeads([]);
                }
            } finally {
                if (!silent) setIsLoading(false);
            }
        };
        fetchLeads(false);
        const interval = setInterval(() => fetchLeads(true), 30000);
        return () => clearInterval(interval);
    }, []);

    // Filter leads by search
    const displayLeads = leads.filter(lead =>
        lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.phone.includes(searchTerm) ||
        (lead.campaign || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-background">
            <div className="px-8 py-5">
                {/* Page Header */}
                <div className="mb-6 pb-4 border-b border-border">
                    <h1 className="text-3xl tracking-tight font-heading font-semibold">Last 30 Days</h1>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
                    <div className="group bg-white border border-border rounded-lg px-5 py-4 transition-all duration-150 cursor-pointer hover:border-slate-400 hover:shadow-[0_4px_12px_rgba(0,0,0,0.12)]">
                        <div className="text-sm text-muted-foreground mb-1.5">Total Leads</div>
                        <div className="text-2xl font-heading font-semibold text-foreground">
                            {isLoading ? '...' : leads.length}
                        </div>
                    </div>
                    <div className="group bg-white border border-border rounded-lg px-5 py-4 transition-all duration-150 cursor-pointer hover:border-slate-400 hover:shadow-[0_4px_12px_rgba(0,0,0,0.12)]">
                        <div className="text-sm text-muted-foreground mb-1.5">Contacted</div>
                        <div className="text-2xl font-heading font-semibold text-foreground">
                            {isLoading ? '...' : leads.filter(l => l.status === 'Contacted' || l.status === 'Responded').length}
                        </div>
                    </div>
                    <div className="group bg-white border border-border rounded-lg px-5 py-4 transition-all duration-150 cursor-pointer hover:border-slate-400 hover:shadow-[0_4px_12px_rgba(0,0,0,0.12)]">
                        <div className="text-sm text-muted-foreground mb-1.5">New</div>
                        <div className="text-2xl font-heading font-semibold text-foreground">
                            {isLoading ? '...' : leads.filter(l => l.status === 'New').length}
                        </div>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="mb-5">
                    <div className="relative max-w-md">
                        <input
                            type="search"
                            placeholder="Search leads..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full h-9 rounded-md border border-border bg-white px-3 py-1 text-sm transition-colors focus-visible:outline-none focus-visible:border-slate-400 focus-visible:ring-[3px] focus-visible:ring-[rgba(0,0,0,0.08)] pl-3"
                        />
                    </div>
                </div>

                {/* Leads Table */}
                <div className="bg-white border border-border rounded-lg overflow-hidden min-h-[200px] relative">
                    {isLoading && (
                        <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    )}

                    {error && (
                        <div className="p-4 m-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-700 font-medium">Failed to load leads</p>
                            <p className="text-xs text-red-500 mt-1">{error}</p>
                        </div>
                    )}

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-muted/30 border-b border-border">
                                    <th className="text-left px-3 py-3 text-sm font-medium text-foreground w-32">Date</th>
                                    <th className="text-left px-3 py-3 text-sm font-medium text-foreground w-24">Time</th>
                                    <th className="text-left px-3 py-3 text-sm font-medium text-foreground w-32">Name</th>
                                    <th className="text-left px-3 py-3 text-sm font-medium text-foreground w-32">Phone</th>
                                    <th className="text-left px-3 py-3 text-sm font-medium text-foreground w-56">Campaign</th>
                                    <th className="text-left px-5 py-3 text-sm font-medium text-foreground w-32">Province/Branch</th>
                                    <th className="text-left px-3 py-3 text-sm font-medium text-foreground w-28">Status</th>
                                    <th className="text-center px-3 py-3 text-sm font-medium text-foreground w-32">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {!isLoading && displayLeads.map((lead) => (
                                    <tr
                                        key={lead.id}
                                        className="border-b border-border last:border-0 transition-all duration-150 hover:bg-muted/20"
                                    >
                                        <td
                                            className="px-3 py-2.5 text-sm text-muted-foreground cursor-pointer"
                                            onClick={() => setSelectedLead(lead)}
                                        >
                                            {lead.date}
                                        </td>
                                        <td
                                            className="px-3 py-2.5 text-sm text-muted-foreground cursor-pointer"
                                            onClick={() => setSelectedLead(lead)}
                                        >
                                            {lead.time}
                                        </td>
                                        <td
                                            className="px-3 py-2.5 text-sm font-medium text-foreground cursor-pointer"
                                            onClick={() => setSelectedLead(lead)}
                                        >
                                            {lead.name}
                                        </td>
                                        <td
                                            className="px-3 py-2.5 text-sm text-muted-foreground cursor-pointer"
                                            onClick={() => setSelectedLead(lead)}
                                        >
                                            {lead.phone}
                                        </td>
                                        <td
                                            className="px-3 py-2.5 text-sm text-muted-foreground cursor-pointer"
                                            onClick={() => setSelectedLead(lead)}
                                        >
                                            {lead.campaign}
                                        </td>
                                        <td
                                            className="px-3 py-2.5 text-sm text-muted-foreground cursor-pointer"
                                            onClick={() => setSelectedLead(lead)}
                                        >
                                            {lead.province} / {lead.preferred_practice}
                                        </td>
                                        <td
                                            className="px-3 py-2.5 cursor-pointer"
                                            onClick={() => setSelectedLead(lead)}
                                        >
                                            <span className={`text-xs px-2.5 py-1 rounded-md font-medium ${statusColors[lead.status]}`}>
                                                {lead.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-2.5 text-center">
                                            <button
                                                onClick={(e) => handleSendMessage(e, lead)}
                                                disabled={sendingLeadId === lead.id}
                                                className={`px-4 py-1.5 text-xs font-medium rounded-md transition-colors shadow-sm cursor-pointer ${sentLeadIds.has(lead.id)
                                                    ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                                                    : sendingLeadId === lead.id
                                                        ? 'bg-blue-300 text-white cursor-not-allowed'
                                                        : 'bg-blue-500 text-white hover:bg-blue-600'
                                                    }`}
                                            >
                                                {sendingLeadId === lead.id
                                                    ? 'Sending...'
                                                    : sentLeadIds.has(lead.id)
                                                        ? '✓ Sent'
                                                        : 'Send Message'
                                                }
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {!isLoading && !error && displayLeads.length === 0 && (
                        <div className="p-8 text-center text-muted-foreground">
                            {searchTerm ? 'No leads match your search' : 'No leads found for the last 30 days'}
                        </div>
                    )}
                </div>
            </div>

            {selectedLead && (
                <LeadModal lead={selectedLead} onClose={() => setSelectedLead(null)} />
            )}
        </div>
    );
}
