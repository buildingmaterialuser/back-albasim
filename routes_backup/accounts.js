const express = require('express');
const router = express.Router();
const Account = require('../models/Account');

// Get all accounts
router.get('/', async (req, res) => {
    try {
        const accounts = await Account.find().sort({ createdAt: -1 });
        res.json(accounts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create account
router.post('/', async (req, res) => {
    try {
        const { accountName, accountType, phone, email, openingBalance } = req.body;
        
        // Generate account code
        const accountCode = `${accountType.substring(0, 3)}-${Date.now()}`;
        
        const account = new Account({
            accountCode,
            accountName,
            accountType,
            phone,
            email,
            openingBalance: openingBalance || 0
        });
        
        const savedAccount = await account.save();
        res.status(201).json(savedAccount);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update account
router.put('/:accountName', async (req, res) => {
    try {
        const account = await Account.findOneAndUpdate(
            { accountName: req.params.accountName },
            req.body,
            { new: true }
        );
        if (!account) return res.status(404).json({ message: 'Account not found' });
        res.json(account);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;