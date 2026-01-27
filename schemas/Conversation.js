const mongoose = require('mongoose');

const ConversationSchema = new mongoose.Schema({
    // 1. LINKING
    organization: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Organization', 
        required: true,
        index: true 
    },
    lead: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Lead', 
        required: true 
    },

    // 2. SIDEBAR DATA (Cached for Speed)
    // We update these every time a new Message is created.
    lastMessage: { 
        type: String, 
        default: '' 
    },
    lastMessageAt: { 
        type: Date, 
        default: Date.now 
    },
    unreadCount: { 
        type: Number, 
        default: 0 
    },

    // 3. PLATFORM SPECIFICS
    platform: {
        type: String,
        enum: ['whatsapp', 'sms', 'email'],
        default: 'whatsapp'
    },
    
    // Useful if Wati gives you a specific thread ID
    externalThreadId: { type: String }

}, { timestamps: true });

// COMPOUND INDEXES (Critical for Performance)

// 1. Ensure one lead only has ONE conversation thread per organization
ConversationSchema.index({ organization: 1, lead: 1 }, { unique: true });

// 2. FAST SORT: "Get me all chats for this Org, sorted by newest message first"
// This makes the sidebar load in < 10ms
ConversationSchema.index({ organization: 1, lastMessageAt: -1 });

module.exports = mongoose.model('Conversation', ConversationSchema);