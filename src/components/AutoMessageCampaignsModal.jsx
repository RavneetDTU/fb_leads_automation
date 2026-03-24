import React, { useState, useEffect } from 'react';
import { X, Loader2, Bot, MessageSquare } from 'lucide-react';
import { campaignsService } from '../services/campaigns';

export function AutoMessageCampaignsModal({ onClose }) {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        setLoading(true);
        const data = await campaignsService.getAutoMessageEnabledCampaigns();
        setCampaigns(data || []);
      } catch (err) {
        console.error('Failed to fetch auto-message enabled campaigns', err);
        setError('Failed to load campaigns. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchCampaigns();
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden border border-border flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <Bot className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-xl font-heading font-semibold text-slate-900">
                Active Auto-Messages
              </h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                Campaigns currently sending automated AI messages
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-50/30">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mb-4" />
              <p className="text-slate-500 font-medium">Loading campaigns...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg text-center">
              {error}
            </div>
          ) : campaigns.length === 0 ? (
            <div className="text-center py-12 px-4 bg-white border border-dashed border-border rounded-xl">
              <div className="mx-auto w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-3">
                <MessageSquare className="w-6 h-6 text-slate-400" />
              </div>
              <h3 className="text-base font-medium text-slate-900 mb-1">No Active Auto-Messages</h3>
              <p className="text-sm text-slate-500">
                You haven't enabled auto-messages for any campaigns yet.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {campaigns.map((campaign) => (
                <div 
                  key={campaign.id} 
                  className="bg-white border border-border hover:border-emerald-200 hover:shadow-sm transition-all rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-slate-900">{campaign.name}</h4>
                      <span className="px-2 py-0.5 text-[10px] uppercase tracking-wider font-semibold rounded-full bg-emerald-100 text-emerald-700">
                        Active
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-mono">ID: {campaign.id}</p>
                  </div>
                  
                  <div className="bg-slate-50 border border-border px-3 py-2 rounded-md sm:text-right min-w-[200px]">
                    <div className="text-[11px] uppercase tracking-wider text-slate-500 font-medium mb-0.5">
                      Template
                    </div>
                    <div className={`text-sm font-medium ${campaign.template_name ? 'text-slate-700' : 'text-amber-600 italic'}`}>
                      {campaign.template_name || 'Not Selected'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
