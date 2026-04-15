const express = require('express');
const router = express.Router();
const Ledger = require('../models/Ledger');
const Account = require('../models/Account');

router.post('/', async (req, res) => {
    try {
        const { receiptNo, date, customerName, amount, paymentMode, chequeNo, narration, invoiceNo } = req.body;
        
        // Create ledger entry for customer (debit)
        const customerLedger = new Ledger({
            accountName: customerName,
            date: new Date(date),
            voucherNo: receiptNo,
            voucherType: 'Receipt',
            chequeNo: chequeNo || '',
            narration: narration || `Receipt against ${invoiceNo || 'sale'}`,
            debit: amount,
            credit: 0,
            balance: amount,
            relatedAccount: 'Cash/Bank'
        });
        
        await customerLedger.save();
        
        // Create ledger entry for cash/bank (credit)
        const cashLedger = new Ledger({
            accountName: paymentMode === 'Cash' ? 'Cash Account' : 'Bank Account',
            date: new Date(date),
            voucherNo: receiptNo,
            voucherType: 'Receipt',
            chequeNo: chequeNo || '',
            narration: narration || `Payment received from ${customerName}`,
            debit: 0,
            credit: amount,
            balance: amount,
            relatedAccount: customerName
        });
        
        await cashLedger.save();
        
        res.status(201).json({ message: 'Receipt saved successfully', receiptNo });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;