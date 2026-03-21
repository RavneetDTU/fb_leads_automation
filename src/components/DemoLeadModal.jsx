import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { leadsService } from '../services/leads';
import { campaignsService } from '../services/campaigns';

const EMPTY_FORM = {
    campaign_id: '',
    name: '',
    phone: '',
    email: '',
    province: '',
    preferred_practice: '',
    practice_to_visit: '',
    practice_location: '',
    practice_to_attend: '',
};

const FORM_FIELDS = [
    { key: 'name', label: 'Name', placeholder: 'Full name' },
    { key: 'phone', label: 'Phone', placeholder: 'e.g. 27821234567' },
    { key: 'email', label: 'Email', placeholder: 'email@example.com' },
    { key: 'province', label: 'Province', placeholder: 'e.g. Western Cape' },
    { key: 'preferred_practice', label: 'Preferred Practice', placeholder: 'Practice name' },
    { key: 'practice_to_visit', label: 'Practice to Visit', placeholder: 'Practice name' },
    { key: 'practice_location', label: 'Practice Location', placeholder: 'Address / area' },
    { key: 'practice_to_attend', label: 'Practice to Attend', placeholder: 'Practice name' },
];

/**
 * Modal for creating a demo lead.
 * Props:
 *   onClose    – called when the modal should close
 *   onCreated  – called after the demo lead is successfully created
 */
export function DemoLeadModal({ onClose, onCreated }) {
    const [form, setForm] = useState(EMPTY_FORM);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const [campaigns, setCampaigns] = useState([]);
    const [loadingCampaigns, setLoadingCampaigns] = useState(false);

    useEffect(() => {
        const fetchCampaigns = async () => {
            setLoadingCampaigns(true);
            try {
                const data = await campaignsService.getActiveCampaigns();
                setCampaigns(data);
            } catch (err) {
                console.error("Failed to load campaigns", err);
            } finally {
                setLoadingCampaigns(false);
            }
        };
        fetchCampaigns();
    }, []);

    const handleChange = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async () => {
        if (isSubmitting) return;
        setIsSubmitting(true);
        try {
            await leadsService.createDemoLead(form);
            alert('Demo lead created successfully!');
            setForm(EMPTY_FORM);
            onCreated?.();
            onClose();
        } catch (err) {
            console.error('[DemoLeadModal] Creation failed:', err);
            alert(`Failed to create demo lead: ${err.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/40" onClick={onClose} />

            {/* Modal */}
            <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                    <h2 className="text-lg font-heading font-semibold text-foreground">Create Demo Lead</h2>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-md hover:bg-muted/40 transition-colors cursor-pointer"
                    >
                        <X className="w-5 h-5 text-muted-foreground" />
                    </button>
                </div>

                {/* Form Body */}
                <div className="px-6 py-5 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1.5">Campaign Name</label>
                        <select
                            value={form.campaign_id}
                            onChange={(e) => handleChange('campaign_id', e.target.value)}
                            disabled={loadingCampaigns}
                            className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-white focus:outline-none focus:ring-1 focus:ring-blue-400"
                        >
                            <option value="">{loadingCampaigns ? 'Loading campaigns...' : 'Select a Campaign'}</option>
                            {campaigns.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>

                    {FORM_FIELDS.map(({ key, label, placeholder }) => (
                        <div key={key}>
                            <label className="block text-sm font-medium text-foreground mb-1.5">{label}</label>
                            <input
                                type="text"
                                value={form[key]}
                                onChange={(e) => handleChange(key, e.target.value)}
                                placeholder={placeholder}
                                className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-white focus:outline-none focus:ring-1 focus:ring-blue-400 placeholder:text-muted-foreground/60"
                            />
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium rounded-lg border border-border text-foreground hover:bg-muted/30 transition-colors cursor-pointer"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="px-5 py-2 text-sm font-medium rounded-lg bg-foreground text-white hover:bg-foreground/90 disabled:opacity-50 transition-colors flex items-center gap-2 cursor-pointer"
                    >
                        {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                        {isSubmitting ? 'Creating...' : 'Create'}
                    </button>
                </div>
            </div>
        </div>
    );
}
