const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
    number: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true,
        enum: ['quotation', 'sale', 'delivery', 'tax']
    },
    title: String,
    date: String,
    customerName: String,
    customerPhone: String,     // 🔴 YEH FIELD ADD KARO
    customerTRN: String,
    customerAddress: String,
    items: [{
        product: String,
        quantity: String,
        rate: String,
        amount: String
    }],
    subtotal: String,
    vat: String,
    totalWithVAT: String,
    advancePayment: String,
    balanceDue: String,
    savedBy: String,
    savedAt: {
        type: Date,
        default: Date.now
    }
});

// Compound index for unique document number per type
documentSchema.index({ type: 1, number: 1 }, { unique: true });

module.exports = mongoose.model('Document', documentSchema);