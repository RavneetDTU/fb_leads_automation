import React, { useState, useEffect, useMemo } from 'react';
import { LeadModal } from '../components/LeadModal';
import { leadsService } from '../services/leads';
import { sendTemplateMessage } from '../services/whatsapp';

const statusColors = {
    New: 'bg-blue-50 text-blue-700 border border-blue-200',
    Contacted: 'bg-amber-50 text-amber-700 border border-amber-200',
    Responded: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    Converted: 'bg-purple-50 text-purple-700 border border-purple-200',
    Unread: 'bg-red-50 text-red-700 border border-red-200',
    Template_sent: 'bg-amber-50 text-amber-700 border border-amber-200',
};

export default function Last30DaysLeads() {
    const [selectedLead, setSelectedLead] = useState(null);
    const [leads, setLeads] = useState([]);
    const [stats, setStats] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCampaign, setFilterCampaign] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    // Send message state
    const [sendingLeadId, setSendingLeadId] = useState(null);
    const [sentLeadIds, setSentLeadIds] = useState(new Set());

    // Derive unique campaign names and statuses from loaded leads
    const uniqueCampaigns = useMemo(() => {
        const campaigns = [...new Set(leads.map(l => l.campaign).filter(Boolean))];
        return campaigns.sort();
    }, [leads]);

    const uniqueStatuses = useMemo(() => {
        const statuses = [...new Set(leads.map(l => l.status).filter(Boolean))];
        return statuses.sort();
    }, [leads]);

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
                const result = await leadsService.getLast30DaysLeads();
                setLeads(result.leads);
                if (result.stats) setStats(result.stats);
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

    // Filter leads by search + campaign + status (AND logic)
    const displayLeads = leads.filter(lead => {
        const matchesSearch = !searchTerm ||
            lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            lead.phone.includes(searchTerm) ||
            (lead.campaign || '').toLowerCase().includes(searchTerm.toLowerCase());

        const matchesCampaign = !filterCampaign || lead.campaign === filterCampaign;
        const matchesStatus = !filterStatus || lead.status === filterStatus;

        return matchesSearch && matchesCampaign && matchesStatus;
    });

    return (
        <div className="min-h-screen bg-background">
            <div className="px-8 py-5">
                {/* Page Header */}
                <div className="mb-6 pb-4 border-b border-border">
                    <h1 className="text-3xl tracking-tight font-heading font-semibold">Last 30 Days</h1>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
                    <div className="group bg-white border border-border rounded-lg px-4 py-3 transition-all duration-150 cursor-pointer hover:border-slate-400 hover:shadow-[0_4px_12px_rgba(0,0,0,0.12)]">
                        <div className="text-xs text-muted-foreground mb-1">Total Leads</div>
                        <div className="text-xl font-heading font-semibold text-foreground">
                            {isLoading ? '...' : (stats?.total ?? leads.length)}
                        </div>
                    </div>
                    <div className="group bg-white border border-border rounded-lg px-4 py-3 transition-all duration-150 cursor-pointer hover:border-slate-400 hover:shadow-[0_4px_12px_rgba(0,0,0,0.12)]">
                        <div className="text-xs text-muted-foreground mb-1">New</div>
                        <div className="text-xl font-heading font-semibold text-blue-600">
                            {isLoading ? '...' : (stats?.new ?? 0)}
                        </div>
                    </div>
                    <div className="group bg-white border border-border rounded-lg px-4 py-3 transition-all duration-150 cursor-pointer hover:border-slate-400 hover:shadow-[0_4px_12px_rgba(0,0,0,0.12)]">
                        <div className="text-xs text-muted-foreground mb-1">Template Sent</div>
                        <div className="text-xl font-heading font-semibold text-amber-600">
                            {isLoading ? '...' : (stats?.initial_template_sent ?? 0)}
                        </div>
                    </div>
                    <div className="group bg-white border border-border rounded-lg px-4 py-3 transition-all duration-150 cursor-pointer hover:border-red-400 hover:shadow-[0_4px_12px_rgba(0,0,0,0.12)]">
                        <div className="text-xs text-muted-foreground mb-1">Unread</div>
                        <div className="text-xl font-heading font-semibold text-red-600">
                            {isLoading ? '...' : (stats?.unread ?? 0)}
                        </div>
                    </div>
                    <div className="group bg-white border border-border rounded-lg px-4 py-3 transition-all duration-150 cursor-pointer hover:border-slate-400 hover:shadow-[0_4px_12px_rgba(0,0,0,0.12)]">
                        <div className="text-xs text-muted-foreground mb-1">Responded</div>
                        <div className="text-xl font-heading font-semibold text-emerald-600">
                            {isLoading ? '...' : (stats?.responded ?? 0)}
                        </div>
                    </div>
                </div>

                {/* Search + Filters Row */}
                <div className="mb-5 flex flex-wrap items-center gap-3">
                    <div className="relative w-56">
                        <input
                            type="search"
                            placeholder="Search leads..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full h-9 rounded-md border border-border bg-white px-3 py-1 text-sm transition-colors focus-visible:outline-none focus-visible:border-slate-400 focus-visible:ring-[3px] focus-visible:ring-[rgba(0,0,0,0.08)]"
                        />
                    </div>

                    <select
                        value={filterCampaign}
                        onChange={(e) => setFilterCampaign(e.target.value)}
                        className="h-9 rounded-md border border-border bg-white px-3 py-1 text-sm transition-colors focus-visible:outline-none cursor-pointer focus-visible:border-slate-400 focus-visible:ring-[3px] focus-visible:ring-[rgba(0,0,0,0.08)] min-w-[180px]"
                    >
                        <option value="">Filter by Campaigns</option>
                        {uniqueCampaigns.map(c => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>

                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="h-9 rounded-md border border-border bg-white px-3 py-1 text-sm transition-colors focus-visible:outline-none cursor-pointer focus-visible:border-slate-400 focus-visible:ring-[3px] focus-visible:ring-[rgba(0,0,0,0.08)] min-w-[180px]"
                    >
                        <option value="">Filter by Statuses</option>
                        {uniqueStatuses.map(s => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>

                    {(filterCampaign || filterStatus) && (
                        <button
                            onClick={() => { setFilterCampaign(''); setFilterStatus(''); }}
                            className="h-9 px-3 rounded-md border border-border bg-white text-sm text-muted-foreground hover:text-foreground hover:border-slate-400 transition-colors cursor-pointer"
                        >
                            Clear Filters
                        </button>
                    )}
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

                    <div>
                        <table className="w-full table-fixed">
                            <thead>
                                <tr className="bg-muted/30 border-b border-border">
                                    <th className="text-left px-2 py-3 text-sm font-medium text-foreground" style={{ width: '10%' }}>Date</th>
                                    <th className="text-left px-2 py-3 text-sm font-medium text-foreground" style={{ width: '7%' }}>Time</th>
                                    <th className="text-left px-2 py-3 text-sm font-medium text-foreground" style={{ width: '13%' }}>Name</th>
                                    <th className="text-left px-2 py-3 text-sm font-medium text-foreground" style={{ width: '12%' }}>Phone</th>
                                    <th className="text-left px-2 py-3 text-sm font-medium text-foreground" style={{ width: '22%' }}>Campaign</th>
                                    <th className="text-left px-2 py-3 text-sm font-medium text-foreground" style={{ width: '14%' }}>Province/Branch</th>
                                    <th className="text-left px-2 py-3 text-sm font-medium text-foreground" style={{ width: '9%' }}>Status</th>
                                    <th className="text-center px-2 py-3 text-sm font-medium text-foreground" style={{ width: '13%' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {!isLoading && displayLeads.map((lead) => (
                                    <tr
                                        key={lead.id}
                                        className="border-b border-border last:border-0 transition-all duration-150 hover:bg-muted/20"
                                    >
                                        <td
                                            className="px-2 py-2.5 text-sm text-muted-foreground cursor-pointer overflow-hidden"
                                            onClick={() => setSelectedLead(lead)}
                                        >
                                            <div className="truncate" title={lead.date}>{lead.date}</div>
                                        </td>
                                        <td
                                            className="px-2 py-2.5 text-sm text-muted-foreground cursor-pointer overflow-hidden"
                                            onClick={() => setSelectedLead(lead)}
                                        >
                                            <div className="truncate">{lead.time}</div>
                                        </td>
                                        <td
                                            className="px-2 py-2.5 text-sm font-medium text-foreground cursor-pointer overflow-hidden"
                                            onClick={() => setSelectedLead(lead)}
                                        >
                                            <div className="truncate" title={lead.name}>{lead.name}</div>
                                        </td>
                                        <td
                                            className="px-2 py-2.5 text-sm text-muted-foreground cursor-pointer overflow-hidden"
                                            onClick={() => setSelectedLead(lead)}
                                        >
                                            <div className="truncate" title={lead.phone}>{lead.phone}</div>
                                        </td>
                                        <td
                                            className="px-2 py-2.5 text-sm text-muted-foreground cursor-pointer overflow-hidden"
                                            onClick={() => setSelectedLead(lead)}
                                        >
                                            <div className="truncate" title={lead.campaign}>{lead.campaign}</div>
                                        </td>
                                        <td
                                            className="px-2 py-2.5 text-sm text-muted-foreground cursor-pointer overflow-hidden"
                                            onClick={() => setSelectedLead(lead)}
                                        >
                                            <div className="truncate" title={`${lead.province} / ${lead.preferred_practice}`}>{lead.province} / {lead.preferred_practice}</div>
                                        </td>
                                        <td
                                            className="px-2 py-2.5 cursor-pointer overflow-hidden"
                                            onClick={() => setSelectedLead(lead)}
                                        >
                                            <span className={`text-xs px-2 py-1 rounded-md font-medium whitespace-nowrap ${statusColors[lead.status]}`}>
                                                {lead.status}
                                            </span>
                                        </td>
                                        <td className="px-2 py-2.5 text-center">
                                            <button
                                                onClick={(e) => handleSendMessage(e, lead)}
                                                disabled={sendingLeadId === lead.id}
                                                className={`px-6 py-2.5 text-xs font-medium rounded-md transition-colors shadow-sm cursor-pointer whitespace-nowrap ${sentLeadIds.has(lead.id)
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
                                                        : 'Send'
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
