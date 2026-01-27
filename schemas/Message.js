const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    // 1. PARENT LINK (The Critical Connection)
    conversationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Conversation',
        required: true,
        index: true // Essential for fetching history: find({ conversationId: ... })
    },

    // 2. CONTEXT LINKS
    lead: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lead',
        required: true
    },
    organization: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
        required: true
    },

    // 3. MESSAGE CONTENT
    content: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['text', 'image', 'video', 'document', 'audio', 'template'],
        default: 'text'
    },
    direction: {
        type: String,
        enum: ['inbound', 'outbound'], // inbound = lead sent it, outbound = we sent it
        required: true
    },
    
    // 4. DELIVERY STATUS
    status: {
        type: String,
        enum: ['queued', 'sent', 'delivered', 'read', 'failed'],
        default: 'queued'
    },

    // 5. EXTERNAL SYNC (Meta/Wati IDs)
    externalId: {
        type: String,
        trim: true,
        unique: true,     // Prevents saving the same message twice from webhooks
        sparse: true      // Allows null values (for internal notes/system messages)
    },
    
    // 6. RICH MEDIA DATA
    metadata: {
        fileUrl: String,
        fileName: String,
        caption: String,
        mimeType: String
    }

}, { timestamps: true });

// INDEXES

// 1. For loading the chat bubble history quickly
MessageSchema.index({ conversationId: 1, createdAt: 1 });

// 2. For Analytics: "How many messages did we send yesterday?"
MessageSchema.index({ organization: 1, createdAt: -1 });

module.exports = mongoose.model('Message', MessageSchema);