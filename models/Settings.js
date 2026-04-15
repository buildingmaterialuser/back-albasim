const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
    companyName: {
        type: String,
        default: 'Business Pro'
    },
    companyEmail: {
        type: String,
        default: 'info@businesspro.com'
    },
    companyPhone: {
        type: String,
        default: '+1 234 567 890'
    },
    vatRate: {
        type: Number,
        default: 5
    },
    currency: {
        type: String,
        default: '$'
    },
    headerImage: {
        type: String,
        default: null
    },
    footerImage: {
        type: String,
        default: null
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Settings', settingsSchema);