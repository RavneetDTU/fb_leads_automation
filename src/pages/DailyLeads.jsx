import React, { useState, useEffect } from 'react';
import { Input } from '../components/ui/input';
import { LeadModal } from '../components/LeadModal'; // Verified named export
import { leadsService } from '../services/leads';

const statusColors = {
    New: 'bg-blue-50 text-blue-700 border border-blue-200',
    Contacted: 'bg-amber-50 text-amber-700 border border-amber-200',
    Responded: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    Converted: 'bg-purple-50 text-purple-700 border border-purple-200',
};

export default function DailyLeads() {
    // Set default date to today in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];
    const [selectedDate, setSelectedDate] = useState(today);
    const [selectedLead, setSelectedLead] = useState(null);
    const [leads, setLeads] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [sendWithAI, setSendWithAI] = useState(false);

    // Fetch leads when date changes
    useEffect(() => {
        const fetchLeads = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const data = await leadsService.getDailyLeads(selectedDate);
                setLeads(data);
            } catch (error) {
                console.error("Failed to load daily leads:", error);
                setError(error.message || 'Failed to load leads');
                setLeads([]); // Clear leads on error
            } finally {
                setIsLoading(false);
            }
        };

        fetchLeads();
    }, [selectedDate]);

    return (
        <div className="min-h-screen bg-background">
            <div className="px-8 py-5">
                {/* Page Header */}
                <div className="mb-6 pb-4 border-b border-border">
                    <h1 className="text-3xl tracking-tight font-heading font-semibold">Daily Leads</h1>
                </div>

                {/* Date Picker with AI Toggle */}
                <div className="mb-5 flex items-end justify-between">
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Select Date</label>
                        <Input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="max-w-xs bg-white border-border focus:ring-1 focus:ring-primary"
                        />
                    </div>

                    {/* AI Toggle */}
                    <div className="flex items-center gap-2 pb-1">
                        <span className="text-sm text-muted-foreground font-medium">Send with AI</span>
                        <button
                            onClick={() => setSendWithAI(!sendWithAI)}
                            className={`relative inline-flex h-6 w-11 items-center cursor-pointer rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 ${sendWithAI ? 'bg-blue-500' : 'bg-slate-300'
                                }`}
                        >
                            <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${sendWithAI ? 'translate-x-6' : 'translate-x-1'
                                    }`}
                            />
                        </button>
                    </div>
                </div>

                {/* Stats for selected date */}
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

                {/* Leads Table */}
                <div className="bg-white border border-border rounded-lg overflow-hidden min-h-[200px] relative">
                    {isLoading && (
                        <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    )}

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-muted/30 border-b border-border">
                                    <th className="text-left px-2 py-3 text-sm font-medium text-foreground w-20">Time</th>
                                    <th className="text-left px-2 py-3 text-sm font-medium text-foreground">Name</th>
                                    <th className="text-left px-2 py-3 text-sm font-medium text-foreground">Phone</th>
                                    <th className="text-left px-2 py-3 text-sm font-medium text-foreground">Campaign</th>
                                    <th className="text-left px-2 py-3 text-sm font-medium text-foreground">Interest</th>
                                    <th className="text-left px-2 py-3 text-sm font-medium text-foreground w-28">Status</th>
                                    <th className="text-center px-2 py-3 text-sm font-medium text-foreground w-24">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {!isLoading && leads.map((lead) => (
                                    <tr
                                        key={lead.id}
                                        className="border-b border-border last:border-0 transition-all duration-150 hover:bg-muted/20"
                                    >
                                        <td
                                            className="px-2 py-2.5 text-sm text-muted-foreground cursor-pointer"
                                            onClick={() => setSelectedLead(lead)}
                                        >
                                            {lead.time}
                                        </td>
                                        <td
                                            className="px-2 py-2.5 text-sm font-medium text-foreground cursor-pointer"
                                            onClick={() => setSelectedLead(lead)}
                                        >
                                            {lead.name}
                                        </td>
                                        <td
                                            className="px-2 py-2.5 text-sm text-muted-foreground cursor-pointer"
                                            onClick={() => setSelectedLead(lead)}
                                        >
                                            {lead.phone}
                                        </td>
                                        <td
                                            className="px-2 py-2.5 text-sm text-muted-foreground cursor-pointer"
                                            onClick={() => setSelectedLead(lead)}
                                        >
                                            {lead.campaign}
                                        </td>
                                        <td
                                            className="px-2 py-2.5 text-sm text-muted-foreground cursor-pointer"
                                            onClick={() => setSelectedLead(lead)}
                                        >
                                            {lead.interest}
                                        </td>
                                        <td
                                            className="px-2 py-2.5 cursor-pointer"
                                            onClick={() => setSelectedLead(lead)}
                                        >
                                            <span className={`text-xs px-2.5 py-1 rounded-md font-medium ${statusColors[lead.status]}`}>
                                                {lead.status}
                                            </span>
                                        </td>
                                        <td className="px-2 py-2.5 text-center">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    console.log('Send message to:', lead.name);
                                                    // API call will go here later
                                                }}
                                                className="px-3 py-1.5 text-xs font-medium bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors shadow-sm cursor-pointer"
                                            >
                                                Send Msg
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {!isLoading && leads.length === 0 && (
                        <div className="p-8 text-center text-muted-foreground">
                            No leads found for {selectedDate}
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
