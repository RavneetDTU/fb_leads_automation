const mongoose = require('mongoose');

const OrganizationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // Integration Settings
    integrations: {
        meta: {
            pageId: { type: String, trim: true },
            accessToken: { type: String, trim: true },
            isValid: { type: Boolean, default: false },
            lastSync: { type: Date }
        },
        wati: {
            apiToken: { type: String, trim: true },
            baseUrl: { type: String, default: 'https://api.wati.io', trim: true },
            isValid: { type: Boolean, default: false }
        },
        google: {
            accessToken: { type: String },
            refreshToken: { type: String },
            isConnected: { type: Boolean, default: false },
            email: { type: String }
        }
    },
    // Global Settings
    settings: {
        timezone: { type: String, default: 'UTC' },
        currency: { type: String, default: 'USD' }
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Organization', OrganizationSchema);
