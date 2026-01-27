const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        select: false // Do not return password by default
    },
    role: {
        type: String,
        enum: ['admin', 'manager', 'editor', 'viewer'],
        default: 'admin'
    },
    organization: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
        required: true
    },
    profileImage: {
        type: String
    },
    lastLogin: {
        type: Date
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('User', UserSchema);
