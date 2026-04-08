import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { LeadModal } from '../components/LeadModal';
import { AutoMessageCampaignsModal } from '../components/AutoMessageCampaignsModal';
import { leadsService } from '../services/leads';
import { sendTemplateMessage } from '../services/whatsapp';
import { Bot, Calendar, ChevronLeft, ChevronRight, X } from 'lucide-react';

const statusColors = {
    New: 'bg-blue-50 text-blue-700 border border-blue-200',
    Contacted: 'bg-amber-50 text-amber-700 border border-amber-200',
    Responded: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    Converted: 'bg-purple-50 text-purple-700 border border-purple-200',
    Unread: 'bg-red-50 text-red-700 border border-red-200',
    Template_sent: 'bg-amber-50 text-amber-700 border border-amber-200',
};

// ─── Helpers ────────────────────────────────────────────────────────────────
function toYMD(date) {
    // Returns "YYYY-MM-DD" for a Date object, local time
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

function formatDisplayDate(ymd) {
    if (!ymd) return '';
    const [y, m, d] = ymd.split('-');
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return `${months[parseInt(m, 10) - 1]} ${parseInt(d, 10)}, ${y}`;
}

function formatRangeLabel(start, end) {
    if (!start) return 'Date Range';
    if (!end || start === end) return formatDisplayDate(start);
    return `${formatDisplayDate(start)} – ${formatDisplayDate(end)}`;
}

// ─── DateRangePicker Component ───────────────────────────────────────────────
function DateRangePicker({ dateRange, onChange }) {
    const [isOpen, setIsOpen] = useState(false);
    const [pickerMonth, setPickerMonth] = useState(() => {
        // Default to current month
        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth(), 1);
    });
    const [pickingStep, setPickingStep] = useState('start'); // 'start' | 'end'
    const [hoverDate, setHoverDate] = useState(null);
    const containerRef = useRef(null);

    // Close on outside click
    useEffect(() => {
        function handleOutsideClick(e) {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        }
        if (isOpen) {
            document.addEventListener('mousedown', handleOutsideClick);
        }
        return () => document.removeEventListener('mousedown', handleOutsideClick);
    }, [isOpen]);

    // Reset picking step when picker opens
    const handleToggle = () => {
        if (!isOpen) {
            setPickingStep(dateRange.start ? 'end' : 'start');
            setHoverDate(null);
        }
        setIsOpen(prev => !prev);
    };

    const handleClearRange = (e) => {
        e.stopPropagation();
        onChange({ start: null, end: null });
        setPickingStep('start');
        setHoverDate(null);
        setIsOpen(false);
    };

    const handleDayClick = (ymd) => {
        if (pickingStep === 'start') {
            onChange({ start: ymd, end: null });
            setPickingStep('end');
        } else {
            // End step
            if (ymd === dateRange.start) {
                // Clicked same day → single-day range
                onChange({ start: ymd, end: ymd });
                setIsOpen(false);
                setPickingStep('start');
            } else if (ymd < dateRange.start) {
                // Clicked before start → swap
                onChange({ start: ymd, end: dateRange.start });
                setIsOpen(false);
                setPickingStep('start');
            } else {
                onChange({ start: dateRange.start, end: ymd });
                setIsOpen(false);
                setPickingStep('start');
            }
            setHoverDate(null);
        }
    };

    // Build calendar days for the current pickerMonth
    const calendarDays = useMemo(() => {
        const year = pickerMonth.getFullYear();
        const month = pickerMonth.getMonth();
        const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        // Shift so week starts Monday: Sun → 6, Mon → 0 ... Sat → 5
        const startOffset = (firstDay + 6) % 7;
        const days = [];
        // Leading empty cells
        for (let i = 0; i < startOffset; i++) days.push(null);
        for (let d = 1; d <= daysInMonth; d++) {
            days.push(toYMD(new Date(year, month, d)));
        }
        // Trailing empties so grid is full weeks
        while (days.length % 7 !== 0) days.push(null);
        return days;
    }, [pickerMonth]);

    const monthLabel = pickerMonth.toLocaleString('default', { month: 'long', year: 'numeric' });

    // Compute range boundaries for highlight logic
    const effectiveEnd = pickingStep === 'end' && hoverDate
        ? (hoverDate >= (dateRange.start || '') ? hoverDate : dateRange.start)
        : (dateRange.end || dateRange.start);
    const effectiveStart = pickingStep === 'end' && hoverDate && hoverDate < (dateRange.start || '')
        ? hoverDate
        : dateRange.start;

    const getDayClasses = (ymd) => {
        if (!ymd) return '';

        const isStart = ymd === dateRange.start;
        const isEnd = ymd === effectiveEnd;
        const isInRange = effectiveStart && effectiveEnd && ymd > effectiveStart && ymd < effectiveEnd;
        const isHoverPreview = pickingStep === 'end' && hoverDate &&
            effectiveStart && effectiveEnd &&
            ymd > effectiveStart && ymd < effectiveEnd;
        const isToday = ymd === toYMD(new Date());

        let classes = 'relative flex items-center justify-center w-8 h-8 text-sm cursor-pointer select-none rounded-full transition-all duration-100 ';

        if (isStart || (isEnd && dateRange.start)) {
            classes += 'bg-slate-800 text-white font-semibold shadow-sm ';
        } else if (isInRange || isHoverPreview) {
            classes += 'bg-slate-100 text-slate-800 rounded-none ';
        } else if (isToday) {
            classes += 'border border-slate-300 text-slate-800 font-medium hover:bg-slate-100 ';
        } else {
            classes += 'text-slate-700 hover:bg-slate-100 ';
        }

        return classes;
    };

    const hasRange = !!dateRange.start;
    const isActive = hasRange;

    return (
        <div className="relative" ref={containerRef}>
            {/* Trigger Button */}
            <button
                id="date-range-picker-btn"
                onClick={handleToggle}
                className={`flex items-center gap-2 h-9 px-3 rounded-md border text-sm font-medium transition-all duration-150 cursor-pointer whitespace-nowrap ${
                    isActive
                        ? 'bg-slate-800 text-white border-slate-800 shadow-sm'
                        : 'bg-white border-border text-slate-600 hover:border-slate-400 hover:bg-slate-50'
                }`}
            >
                <Calendar className="w-4 h-4 flex-shrink-0" />
                <span className={isActive ? 'text-white' : 'text-slate-600'}>
                    Date Range
                </span>
            </button>

            {/* Dropdown Calendar Panel */}
            {isOpen && (
                <div
                    className="absolute top-full left-0 mt-2 z-50 bg-white border border-border rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.12)] p-4 w-[280px]"
                    style={{ minWidth: 280 }}
                >
                    {/* Instruction */}
                    <p className="text-xs text-slate-400 mb-3 font-medium">
                        {pickingStep === 'start' ? '📌 Click a start date' : '📌 Click an end date (or the same date for a single day)'}
                    </p>

                    {/* Month Navigation */}
                    <div className="flex items-center justify-between mb-3">
                        <button
                            onClick={() => setPickerMonth(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))}
                            className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <span className="text-sm font-semibold text-slate-800">{monthLabel}</span>
                        <button
                            onClick={() => setPickerMonth(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))}
                            className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Weekday headers */}
                    <div className="grid grid-cols-7 mb-1">
                        {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map(d => (
                            <div key={d} className="flex items-center justify-center w-8 h-7 text-xs font-medium text-slate-400">
                                {d}
                            </div>
                        ))}
                    </div>

                    {/* Day Grid */}
                    <div className="grid grid-cols-7 gap-y-1">
                        {calendarDays.map((ymd, idx) => {
                            if (!ymd) return <div key={`empty-${idx}`} className="w-8 h-8" />;

                            // Compute range wrapper bg for in-between days
                            const inRange = effectiveStart && effectiveEnd && ymd > effectiveStart && ymd < effectiveEnd;
                            const isRangeStart = ymd === effectiveStart && effectiveEnd && effectiveStart !== effectiveEnd;
                            const isRangeEnd = ymd === effectiveEnd && effectiveStart && effectiveStart !== effectiveEnd;

                            return (
                                <div
                                    key={ymd}
                                    className={`relative flex items-center justify-center h-8 ${
                                        inRange ? 'bg-slate-100' : ''
                                    } ${isRangeStart ? 'rounded-l-full' : ''} ${isRangeEnd ? 'rounded-r-full' : ''}`}
                                    onMouseEnter={() => pickingStep === 'end' && setHoverDate(ymd)}
                                    onMouseLeave={() => setHoverDate(null)}
                                    onClick={() => handleDayClick(ymd)}
                                >
                                    <span className={getDayClasses(ymd)}>
                                        {parseInt(ymd.split('-')[2], 10)}
                                    </span>
                                </div>
                            );
                        })}
                    </div>

                    {/* Footer */}
                    <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
                        <div className="text-xs text-slate-400">
                            {dateRange.start && !dateRange.end && pickingStep === 'end' && (
                                <span>Start: <span className="text-slate-600 font-medium">{formatDisplayDate(dateRange.start)}</span></span>
                            )}
                            {dateRange.start && dateRange.end && (
                                <span className="text-slate-600 font-medium">
                                    {dateRange.start === dateRange.end
                                        ? formatDisplayDate(dateRange.start)
                                        : `${formatDisplayDate(dateRange.start)} – ${formatDisplayDate(dateRange.end)}`}
                                </span>
                            )}
                        </div>
                        {(dateRange.start || dateRange.end) && (
                            <button
                                onClick={handleClearRange}
                                className="text-xs text-slate-400 hover:text-red-500 transition-colors cursor-pointer font-medium"
                            >
                                Clear
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function Last30DaysLeads() {
    const [selectedLead, setSelectedLead] = useState(null);
    const [leads, setLeads] = useState([]);
    const [stats, setStats] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCampaign, setFilterCampaign] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [dateRange, setDateRange] = useState({ start: null, end: null });

    // Send message state
    const [sendingLeadId, setSendingLeadId] = useState(null);
    const [sentLeadIds, setSentLeadIds] = useState(new Set());

    // Auto message modal visibility
    const [showAutoMessageModal, setShowAutoMessageModal] = useState(false);

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

    // Filter leads by search + campaign + status + date range (AND logic)
    const displayLeads = leads.filter(lead => {
        const matchesSearch = !searchTerm ||
            lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            lead.phone.includes(searchTerm) ||
            (lead.campaign || '').toLowerCase().includes(searchTerm.toLowerCase()) || String(lead.hal_leadId).includes(searchTerm);

        const matchesCampaign = !filterCampaign || lead.campaign === filterCampaign;
        const matchesStatus = !filterStatus || lead.status === filterStatus;

        const matchesDateRange = (() => {
            if (!dateRange.start) return true;
            const leadDate = lead.date; // already "YYYY-MM-DD"
            const rangeEnd = dateRange.end || dateRange.start;
            return leadDate >= dateRange.start && leadDate <= rangeEnd;
        })();

        return matchesSearch && matchesCampaign && matchesStatus && matchesDateRange;
    });

    const hasAnyFilter = filterCampaign || filterStatus || dateRange.start;

    const clearAllFilters = () => {
        setFilterCampaign('');
        setFilterStatus('');
        setDateRange({ start: null, end: null });
    };

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

                    {/* Search */}
                    <div className="relative w-56">
                        <input
                            type="search"
                            placeholder="Search leads..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full h-9 rounded-md border border-border bg-white px-3 py-1 text-sm transition-colors focus-visible:outline-none focus-visible:border-slate-400 focus-visible:ring-[3px] focus-visible:ring-[rgba(0,0,0,0.08)]"
                        />
                    </div>

                    {/* Filter by Campaign */}
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

                    {/* Filter by Status */}
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="h-9 rounded-md border border-border bg-white px-3 py-1 text-sm transition-colors focus-visible:outline-none cursor-pointer focus-visible:border-slate-400 focus-visible:ring-[3px] focus-visible:ring-[rgba(0,0,0,0.08)] min-w-[180px]"
                    >
                        <option value="">Filter by Status</option>
                        {uniqueStatuses.map(s => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>

                    {/* ── Date Range Picker ── */}
                    <DateRangePicker
                        dateRange={dateRange}
                        onChange={setDateRange}
                    />

                    {/* Clear Filters — shows when any filter is active */}
                    {hasAnyFilter && (
                        <button
                            onClick={clearAllFilters}
                            className="h-9 px-3 rounded-md border border-border bg-white text-sm text-muted-foreground hover:text-foreground hover:border-slate-400 transition-colors cursor-pointer"
                        >
                            Clear Filters
                        </button>
                    )}

                    {/* Auto-Message Campaigns Button */}
                    <button
                        onClick={() => setShowAutoMessageModal(true)}
                        className="flex items-center ml-auto gap-2 px-4 py-1.5 h-9 bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300 rounded-md font-medium text-sm transition-all shadow-sm cursor-pointer whitespace-nowrap"
                    >
                        <Bot className="w-4 h-4" />
                        Auto-Message Campaigns
                    </button>
                </div>

                {/* Active filter summary */}
                {dateRange.start && (
                    <div className="mb-3 flex items-center gap-2">
                        <span className="text-xs text-slate-500">
                            Showing leads for:
                        </span>
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full">
                            <Calendar className="w-3 h-3" />
                            {dateRange.start === dateRange.end || !dateRange.end
                                ? formatDisplayDate(dateRange.start)
                                : `${formatDisplayDate(dateRange.start)} – ${formatDisplayDate(dateRange.end)}`}
                        </span>
                        <span className="text-xs text-slate-400">
                            ({displayLeads.length} {displayLeads.length === 1 ? 'lead' : 'leads'})
                        </span>
                    </div>
                )}

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
                                    <th className="text-left px-2 py-3 text-sm font-medium text-foreground" style={{ width: '8%' }}>Lead ID</th>
                                    <th className="text-left px-2 py-3 text-sm font-medium text-foreground" style={{ width: '10%' }}>Created Date/Time</th>
                                    <th className="text-left px-2 py-3 text-sm font-medium text-foreground" style={{ width: '10%' }}>Last Message</th>
                                    <th className="text-left px-2 py-3 text-sm font-medium text-foreground" style={{ width: '12%' }}>Name</th>
                                    <th className="text-left px-2 py-3 text-sm font-medium text-foreground" style={{ width: '12%' }}>Phone</th>
                                    <th className="text-left px-2 py-3 text-sm font-medium text-foreground" style={{ width: '18%' }}>Campaign</th>
                                    <th className="text-left px-2 py-3 text-sm font-medium text-foreground" style={{ width: '12%' }}>Province/Branch</th>
                                    <th className="text-left px-2 py-3 text-sm font-medium text-foreground" style={{ width: '9%' }}>Status</th>
                                    <th className="text-center px-2 py-3 text-sm font-medium text-foreground" style={{ width: '8%' }}>AI Mode</th>
                                    <th className="text-center px-2 py-3 text-sm font-medium text-foreground" style={{ width: '10%' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {!isLoading && displayLeads.map((lead) => (
                                    <tr
                                        key={lead.id}
                                        className="border-b border-border last:border-0 transition-all duration-150 hover:bg-muted/20"
                                    >
                                        <td
                                            className="px-2 py-2.5 text-sm font-medium text-foreground cursor-pointer overflow-hidden"
                                            onClick={() => setSelectedLead(lead)}
                                        >
                                            <div className="truncate" title={lead.hal_leadId}>{lead.hal_leadId}</div>
                                        </td>
                                        <td
                                            className="px-2 py-2.5 text-sm text-muted-foreground cursor-pointer overflow-hidden"
                                            onClick={() => setSelectedLead(lead)}
                                        >
                                            <div className="truncate" title={lead.date}>
                                                {lead.date}/<br />
                                                {lead.time}
                                            </div>
                                        </td>
                                        <td
                                            className="px-2 py-2.5 text-sm text-muted-foreground cursor-pointer overflow-hidden"
                                            onClick={() => setSelectedLead(lead)}
                                        >
                                            <div className="truncate" title={lead.last_message_date !== 'N/A' ? `${lead.last_message_date} ${lead.last_message_time}` : 'N/A'}>
                                                {lead.last_message_date}/<br />
                                                {lead.last_message_time}
                                            </div>
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
                                        <td className="px-2 py-2.5 text-center" onClick={(e) => e.stopPropagation()}>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input type="checkbox" className="sr-only peer" defaultChecked={false} />
                                                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                                            </label>
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
                            {dateRange.start
                                ? `No leads found for the selected date range`
                                : searchTerm
                                    ? 'No leads match your search'
                                    : 'No leads found for the last 30 days'}
                        </div>
                    )}
                </div>
            </div>

            {selectedLead && (
                <LeadModal lead={selectedLead} onClose={() => setSelectedLead(null)} />
            )}

            {/* Auto Message Modal */}
            {showAutoMessageModal && (
                <AutoMessageCampaignsModal onClose={() => setShowAutoMessageModal(false)} />
            )}
        </div>
    );
}
