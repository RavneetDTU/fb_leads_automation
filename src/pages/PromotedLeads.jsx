import React, { useState, useEffect } from 'react';
import { Input } from '../components/ui/input';
import { leadsService } from '../services/leads';

export default function PromotedLeads() {
    const [selectedDate, setSelectedDate] = useState('2026-01-15');
    const [leads, setLeads] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
    });

    // Fetch leads when date changes
    useEffect(() => {
        const fetchLeads = async () => {
            setIsLoading(true);
            try {
                const data = await leadsService.getPromotedLeads(selectedDate, pagination.page, pagination.limit);
                setLeads(data.leads);
                setPagination(data.pagination);
            } catch (error) {
                console.error("Failed to load promoted leads:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchLeads();
    }, [selectedDate, pagination.page]);

    return (
        <div className="min-h-screen bg-background">
            <div className="px-8 py-5">
                {/* Page Header */}
                <div className="mb-6 pb-4 border-b border-border">
                    <h1 className="text-3xl tracking-tight font-heading font-semibold">Promoted Leads</h1>
                </div>

                {/* Date Picker */}
                <div className="mb-5">
                    <label className="block text-sm font-medium text-foreground mb-2">Select Date</label>
                    <Input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="max-w-[200px] bg-white border-border  cursor-pointer focus:ring-1 focus:ring-primary"
                    />
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
                                    <th className="text-left px-5 py-3 text-sm font-medium text-foreground">Name</th>
                                    <th className="text-left px-5 py-3 text-sm font-medium text-foreground">Phone</th>
                                    <th className="text-left px-5 py-3 text-sm font-medium text-foreground">WhatsApp</th>
                                    <th className="text-left px-5 py-3 text-sm font-medium text-foreground">Store Name</th>
                                    <th className="text-left px-5 py-3 text-sm font-medium text-foreground">Notes</th>
                                </tr>
                            </thead>
                            <tbody>
                                {!isLoading && leads.map((lead) => (
                                    <tr
                                        key={lead.id}
                                        className="border-b border-border last:border-0 transition-all duration-150 hover:bg-muted/20"
                                    >
                                        <td className="px-5 py-4 text-sm font-medium text-foreground">{lead.name}</td>
                                        <td className="px-5 py-4 text-sm text-muted-foreground">{lead.phone}</td>
                                        <td className="px-5 py-4 text-sm text-muted-foreground">{lead.whatsapp}</td>
                                        <td className="px-5 py-4 text-sm text-muted-foreground">{lead.store_name}</td>
                                        <td className="px-5 py-4 text-sm text-muted-foreground">
                                            {lead.notes || '-'}
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

                {/* Pagination Info */}
                {!isLoading && leads.length > 0 && (
                    <div className="mt-4 text-sm text-muted-foreground">
                        Showing {leads.length} of {pagination.total} leads (Page {pagination.page} of {pagination.totalPages})
                    </div>
                )}
            </div>
        </div>
    );
}
