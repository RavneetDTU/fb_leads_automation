

const mongoose = require('mongoose');

const LeadSchema = new mongoose.Schema({
    
    // THE MISSING LINK (External ID) ---
    // This stores the unique Facebook Lead ID (e.g., "Lead_999").
    // We check this BEFORE saving to ensure we don't create duplicates.
    externalId: {
        type: String,
        required: true, 
        unique: true, // Ensures one lead ID exists only once in the whole DB
        trim: true
    },

    // reference the organization
    organization: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
        required: true
    },
    // refer the campaign
    campaign: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Campaign'
    },

    //  YOUR EXISTING FIELDS ---
    name: {
        type: String,
        required: true,
        trim: true
    },
    phone: {
        type: String,
        required: true, // Crucial for WhatsApp integration
        trim: true
    },
    email: {
        type: String,
        trim: true,
        lowercase: true
    },

    
    status: {
        type: String,
        enum: ['New', 'Contacted', 'Responded', 'Converted', 'Lost', 'Qualified'],
        default: 'New'
    },
    note: {
        type: String, // for putting the note about the lead
        trim: true
    },
    
}, {
    timestamps: true
});

// --- 3. INDICES (Optimized for Speed) ---

// Prevent Duplicates: "One Organization cannot have the same Facebook Lead ID twice"
LeadSchema.index({ organization: 1, externalId: 1 }, { unique: true });

// Dashboard Speed: "Get me all 'New' leads for this Organization"
LeadSchema.index({ organization: 1, status: 1 });

// Search Speed: "Find lead by phone number" (Essential for Webhooks)
LeadSchema.index({ organization: 1, phone: 1 });

module.exports = mongoose.model('Lead', LeadSchema);















// const mongoose = require('mongoose');

// const LeadSchema = new mongoose.Schema({
//     name: {
//         type: String,
//         required: true,
//         trim: true
//     },
//     phone: {
//         type: String,
//         required: true, // Crucial for WhatsApp integration
//         trim: true
//     },
//     email: {
//         type: String,
//         trim: true,
//         lowercase: true
//     },
//     organization: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'Organization',
//         required: true
//     },
//     campaign: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'Campaign'
//     },
//     status: {
//         type: String,
//         enum: ['New', 'Contacted', 'Responded', 'Converted', 'Lost', 'Qualified'],
//         default: 'New'
//     },
//     interest: {
//         type: String,
//         trim: true
//     },
//     source: {
//         type: String, // e.g., 'Facebook Ad', 'Website', 'Referral'
//         default: 'Facebook Ad'
//     },
//     lastContactedAt: {
//         type: Date
//     },
//     // Custom fields for flexible data storage
//     metadata: {
//         type: Map,
//         of: mongoose.Schema.Types.Mixed
//     }
// }, {
//     timestamps: true
// });

// // Indices for common queries
// LeadSchema.index({ organization: 1, status: 1 });
// LeadSchema.index({ organization: 1, phone: 1 });
// LeadSchema.index({ campaign: 1 });

// module.exports = mongoose.model('Lead', LeadSchema);




