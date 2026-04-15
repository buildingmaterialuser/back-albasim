const express = require('express');
const router = express.Router();
const Document = require('../models/Document');
const Ledger = require('../models/Ledger');
const Account = require('../models/Account');

// Get all documents
router.get('/', async (req, res) => {
    try {
        const documents = await Document.find().sort({ savedAt: -1 });
        res.json(documents);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get specific document
router.get('/:type/:number', async (req, res) => {
    try {
        const document = await Document.findOne({ 
            type: req.params.type, 
            number: req.params.number 
        });
        if (!document) {
            return res.status(404).json({ message: 'Document not found' });
        }
        res.json(document);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create document (with ledger for tax invoices)
router.post('/', async (req, res) => {
    try {
        const document = new Document(req.body);
        const savedDocument = await document.save();
        res.status(201).json(savedDocument);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Create invoice with ledger entry
router.post('/invoice-with-ledger', async (req, res) => {
    try {
        const document = new Document(req.body);
        const savedDocument = await document.save();
        
        // Create ledger entry for customer
        const ledgerEntry = new Ledger({
            accountName: req.body.customerName,
            date: new Date(req.body.date),
            voucherNo: req.body.number,
            voucherType: 'Invoice',
            narration: `Sale invoice ${req.body.number}`,
            debit: parseFloat(req.body.totalWithVAT),
            credit: 0,
            balance: parseFloat(req.body.totalWithVAT),
            relatedAccount: 'Sales Account'
        });
        
        await ledgerEntry.save();
        
        res.status(201).json(savedDocument);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete document
router.delete('/:type/:number', async (req, res) => {
    try {
        const deletedDocument = await Document.findOneAndDelete({ 
            type: req.params.type, 
            number: req.params.number 
        });
        if (!deletedDocument) {
            return res.status(404).json({ message: 'Document not found' });
        }
        res.json({ message: 'Document deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;