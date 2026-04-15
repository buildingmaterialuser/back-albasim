const express = require('express');
const router = express.Router();
const Ledger = require('../models/Ledger');
const Account = require('../models/Account');

// Get ledger entries for an account
router.get('/:accountName', async (req, res) => {
    try {
        const { accountName } = req.params;
        const { fromDate, toDate } = req.query;
        
        let query = { accountName };
        
        if (fromDate && toDate) {
            query.date = {
                $gte: new Date(fromDate),
                $lte: new Date(toDate)
            };
        }
        
        const entries = await Ledger.find(query).sort({ date: 1 });
        
        // Calculate running balance
        let runningBalance = 0;
        const entriesWithBalance = entries.map(entry => {
            runningBalance += (entry.debit - entry.credit);
            return {
                ...entry.toObject(),
                runningBalance
            };
        });
        
        const totalDebit = entries.reduce((sum, e) => sum + e.debit, 0);
        const totalCredit = entries.reduce((sum, e) => sum + e.credit, 0);
        
        res.json({
            entries: entriesWithBalance,
            summary: {
                totalDebit,
                totalCredit,
                closingBalance: totalDebit - totalCredit
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get balance sheet
router.get('/balance-sheet', async (req, res) => {
    try {
        const { asOnDate } = req.query;
        const date = asOnDate ? new Date(asOnDate) : new Date();
        
        const accounts = await Account.find();
        
        const assets = accounts.filter(a => 
            ['Asset', 'Bank', 'Cash'].includes(a.accountType)
        );
        const liabilities = accounts.filter(a => 
            ['Liability', 'Equity'].includes(a.accountType)
        );
        
        // Calculate balances from ledger
        const getBalance = async (accountName) => {
            const entries = await Ledger.find({ accountName, date: { $lte: date } });
            const balance = entries.reduce((sum, e) => sum + (e.debit - e.credit), 0);
            return balance;
        };
        
        const assetsWithBalance = await Promise.all(
            assets.map(async a => ({
                name: a.accountName,
                type: a.accountType,
                balance: await getBalance(a.accountName)
            }))
        );
        
        const liabilitiesWithBalance = await Promise.all(
            liabilities.map(async l => ({
                name: l.accountName,
                type: l.accountType,
                balance: await getBalance(l.accountName)
            }))
        );
        
        const totalAssets = assetsWithBalance.reduce((sum, a) => sum + a.balance, 0);
        const totalLiabilities = liabilitiesWithBalance.reduce((sum, l) => sum + l.balance, 0);
        
        res.json({
            assets: {
                items: assetsWithBalance,
                total: totalAssets
            },
            liabilities: {
                items: liabilitiesWithBalance,
                total: totalLiabilities
            },
            netWorth: totalAssets - totalLiabilities
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;