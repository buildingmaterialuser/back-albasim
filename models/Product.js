const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    purchaseRate: {
        type: Number,
        required: true
    },
    saleRate: {
        type: Number,
        required: true
    },
    stock: {
        type: Number,
        default: 0
    },
    createdBy: {
        type: String,
        default: 'admin'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Product', productSchema);