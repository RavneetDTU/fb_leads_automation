import React, { useState, useEffect } from 'react';
import { X, Loader2, Search } from 'lucide-react';
import { templatesService } from '../services/templates';

/**
 * TemplateModal Component
 * 
 * Displays a modal with WhatsApp message templates for selection.
 * Features:
 * - Shows 5 templates initially
 * - "Load More" button for pagination
 * - Template selection with visual feedback
 * - Clean horizontal layout with dividers
 */
export function TemplateModal({ onClose, onSelectTemplate }) {
    // State Management
    const [templates, setTemplates] = useState([]);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState(null);
    const [nextPageUrl, setNextPageUrl] = useState(null);
    const [templateSearch, setTemplateSearch] = useState('');

    // Fetch initial templates on component mount
    useEffect(() => {
        fetchInitialTemplates();
    }, []);

    /**
     * Fetch the first page of templates
     */
    const fetchInitialTemplates = async () => {
        setLoading(true);
        setError(null);

        try {
            const { templates: fetchedTemplates, pagination } = await templatesService.getTemplates(5, 1);

            // Filter to show only approved templates
            const approvedTemplates = templatesService.filterApprovedTemplates(fetchedTemplates);

            setTemplates(approvedTemplates);
            setNextPageUrl(pagination.nextPage || null);
        } catch (err) {
            setError('Failed to load templates. Please try again.');
            console.error('Error loading templates:', err);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Load more templates using pagination
     */
    const handleLoadMore = async () => {
        if (!nextPageUrl || loadingMore) return;
        console.log("next page url-", nextPageUrl)

        setLoadingMore(true);

        try {
            const { templates: fetchedTemplates, pagination } = await templatesService.getTemplatesByUrl(nextPageUrl);

            // Filter to show only approved templates
            const approvedTemplates = templatesService.filterApprovedTemplates(fetchedTemplates);

            // Append new templates to existing ones
            setTemplates(prev => [...prev, ...approvedTemplates]);
            setNextPageUrl(pagination.nextPage || null);
        } catch (err) {
            setError('Failed to load more templates. Please try again.');
            console.error('Error loading more templates:', err);
        } finally {
            setLoadingMore(false);
        }
    };

    /**
     * Handle template selection
     */
    const handleTemplateClick = (template) => {
        setSelectedTemplate(template);
    };

    /**
     * Handle save button click
     */
    const handleSave = () => {
        if (selectedTemplate) {
            onSelectTemplate(selectedTemplate);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-[0_8px_24px_rgba(0,0,0,0.15)] w-full max-w-4xl flex flex-col" style={{ height: '85vh' }}>

                {/* Header */}
                <div className="flex items-start justify-between px-6 py-5 border-b border-border flex-shrink-0">
                    <div>
                        <h2 className="text-xl font-heading font-semibold text-foreground">Select Template</h2>
                        <p className="text-sm text-muted-foreground mt-0.5">Choose a WhatsApp message template</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Search Bar */}
                <div className="px-6 pt-4 pb-1 flex-shrink-0">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                        <input
                            type="text"
                            placeholder="Search templates by name..."
                            value={templateSearch}
                            onChange={(e) => setTemplateSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-border rounded-md outline-none focus:border-slate-400 focus:ring-[3px] focus:ring-[rgba(0,0,0,0.08)] placeholder:text-muted-foreground transition-colors"
                        />
                    </div>
                </div>

                {/* Content - Scrollable area */}
                <div className="flex-1 overflow-y-auto px-6 py-5 min-h-0">
                    {/* Loading State */}
                    {loading && (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                        </div>
                    )}

                    {/* Error State */}
                    {error && !loading && (
                        <div className="bg-red-50 border border-red-200 rounded-md px-4 py-3 text-sm text-red-700">
                            {error}
                        </div>
                    )}

                    {/* Templates List */}
                    {!loading && !error && templates.length > 0 && (() => {
                        const filtered = templates.filter(t =>
                            (t.elementName || '').toLowerCase().includes(templateSearch.toLowerCase())
                        );
                        return filtered.length > 0 ? (
                            <div className="space-y-0">
                                {filtered.map((template, index) => (
                                    <div key={template.id}>
                                        <div
                                            onClick={() => handleTemplateClick(template)}
                                            className={`px-5 py-4 cursor-pointer transition-all duration-150 ${selectedTemplate?.id === template.id
                                                ? 'bg-blue-50 border-l-4 border-l-blue-500'
                                                : 'hover:bg-slate-50'
                                                }`}
                                        >
                                            <h3 className="text-base font-heading font-semibold text-foreground mb-2">
                                                {template.elementName}
                                            </h3>
                                            <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                                                {template.body}
                                            </p>
                                            <div className="mt-3 flex items-center gap-2">
                                                <span className="text-xs px-2.5 py-1 rounded-md font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                    {template.status}
                                                </span>
                                                <span className="text-xs px-2.5 py-1 rounded-md font-medium bg-slate-50 text-slate-600 border border-slate-200">
                                                    {template.category}
                                                </span>
                                            </div>
                                        </div>
                                        {index < filtered.length - 1 && (
                                            <div className="border-b border-border"></div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <p className="text-muted-foreground text-sm">No templates match &ldquo;{templateSearch}&rdquo;</p>
                            </div>
                        );
                    })()}

                    {/* No Templates State */}
                    {!loading && !error && templates.length === 0 && (
                        <div className="text-center py-12">
                            <p className="text-muted-foreground">No approved templates found.</p>
                        </div>
                    )}

                    {/* Load More Button */}
                    {!loading && !error && nextPageUrl && (
                        <div className="flex justify-center mt-5 pt-5 border-t border-border">
                            <button
                                onClick={handleLoadMore}
                                disabled={loadingMore}
                                className="cursor-pointer px-6 py-2.5 border border-border rounded-md bg-white text-foreground hover:bg-slate-50 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {loadingMore && <Loader2 className="w-4 h-4 animate-spin" />}
                                {loadingMore ? 'Loading...' : 'Load More'}
                            </button>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border bg-muted/10 flex-shrink-0">
                    <button
                        onClick={onClose}
                        className="cursor-pointer px-6 py-2.5 border border-border rounded-md bg-white text-foreground hover:bg-slate-50 transition-colors font-medium"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={!selectedTemplate}
                        className="cursor-pointer px-6 py-2.5 bg-foreground text-background rounded-md hover:opacity-90 transition-opacity font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
}
