const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
    accountCode: {
        type: String,
        required: true,
        unique: true
    },
    accountName: {
        type: String,
        required: true,
        unique: true
    },
    accountType: {
        type: String,
        required: true,
        enum: ['Customer', 'Supplier', 'Bank', 'Cash', 'Expense', 'Income', 'Asset', 'Liability', 'Equity']
    },
    parentAccount: {
        type: String,
        default: null
    },
    openingBalance: {
        type: Number,
        default: 0
    },
    balanceType: {
        type: String,
        enum: ['DR', 'CR'],
        default: 'DR'
    },
    phone: String,
    email: String,
    address: String,
    trn: String,
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Account', accountSchema);