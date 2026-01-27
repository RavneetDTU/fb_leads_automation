

const mongoose = require('mongoose');

const CampaignSchema = new mongoose.Schema({
    // --- 1. THE MISSING LINK (External ID) ---
    // This stores the Facebook Form ID (e.g., "777888").
    // We use this to know WHICH form to fetch leads from.
    externalId: {
        type: String,
        required: true, 
        trim: true
    },
    
    // Optional: Store the Ad Account ID if you manage multiple accounts
    externalAdAccountId: { type: String, trim: true },
    
    // reference the organization
    organization: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
        required: true
    },

    // common fields
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    platform: {
        type: String,
        // Matches the source (e.g., Facebook Lead Ads)
        enum: ['Facebook', 'Instagram', 'Google', 'WhatsApp', 'Email', 'Other'],
        required: true
    },
    status: {
        type: String,
        enum: ['Active', 'Paused', 'Completed', 'Draft'],
        default: 'Active'
    },

    
    // --- 3. METRICS (Perfect for Dashboard Speed) ---
    metrics: {
        totalLeads: { type: Number, default: 0 },
        contactedLeads: { type: Number, default: 0 },
        convertedLeads: { type: Number, default: 0 },
        lastUpdated: { type: Date, default: Date.now }
    }
}, {
    timestamps: true
});

// --- 4. COMPOUND INDEX (Crucial!) ---
// This ensures one Organization cannot accidentally have two campaigns with the same Facebook ID.
// It prevents "Double Sync" issues at the Campaign level.
CampaignSchema.index({ organization: 1, externalId: 1 }, { unique: true });

module.exports = mongoose.model('Campaign', CampaignSchema);