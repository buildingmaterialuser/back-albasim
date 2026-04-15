const express = require('express');
const router = express.Router();
const Ledger = require('../models/Ledger');

router.post('/', async (req, res) => {
    try {
        const { paymentNo, date, supplierName, amount, paymentMode, chequeNo, narration, billNo } = req.body;
        
        // Create ledger entry for supplier (credit)
        const supplierLedger = new Ledger({
            accountName: supplierName,
            date: new Date(date),
            voucherNo: paymentNo,
            voucherType: 'Payment',
            chequeNo: chequeNo || '',
            narration: narration || `Payment against ${billNo || 'purchase'}`,
            debit: 0,
            credit: amount,
            balance: amount,
            relatedAccount: paymentMode === 'Cash' ? 'Cash Account' : 'Bank Account'
        });
        
        await supplierLedger.save();
        
        // Create ledger entry for cash/bank (debit)
        const cashLedger = new Ledger({
            accountName: paymentMode === 'Cash' ? 'Cash Account' : 'Bank Account',
            date: new Date(date),
            voucherNo: paymentNo,
            voucherType: 'Payment',
            chequeNo: chequeNo || '',
            narration: narration || `Payment made to ${supplierName}`,
            debit: amount,
            credit: 0,
            balance: amount,
            relatedAccount: supplierName
        });
        
        await cashLedger.save();
        
        res.status(201).json({ message: 'Payment saved successfully', paymentNo });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;