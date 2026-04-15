const mongoose = require('mongoose');

const ledgerSchema = new mongoose.Schema({
    accountName: {
        type: String,
        required: true,
        index: true
    },
    date: {
        type: Date,
        required: true
    },
    voucherNo: {
        type: String,
        required: true
    },
    voucherType: {
        type: String,
        required: true,
        enum: ['Invoice', 'Receipt', 'Payment', 'Journal', 'Purchase']
    },
    chequeNo: {
        type: String,
        default: ''
    },
    referenceNo: {
        type: String,
        default: ''
    },
    narration: {
        type: String,
        default: ''
    },
    debit: {
        type: Number,
        default: 0
    },
    credit: {
        type: Number,
        default: 0
    },
    balance: {
        type: Number,
        default: 0
    },
    relatedAccount: {
        type: String,
        default: ''
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Compound index for faster queries
ledgerSchema.index({ accountName: 1, date: -1 });
ledgerSchema.index({ voucherNo: 1 });

module.exports = mongoose.model('Ledger', ledgerSchema);