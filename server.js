const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// ========== MODELS ==========

// Product Model
const productSchema = new mongoose.Schema({
    name: String,
    code: String,
    purchaseRate: Number,
    saleRate: Number,
    stock: Number,
    createdAt: { type: Date, default: Date.now }
});
const Product = mongoose.model('Product', productSchema);

// Document Model
const documentSchema = new mongoose.Schema({
    number: String,
    type: String,
    title: String,
    date: String,
    customerName: String,
    customerPhone: String,
    customerTRN: String,
    customerAddress: String,
    items: Array,
    subtotal: String,
    vat: String,
    totalWithVAT: String,
    advancePayment: String,
    balanceDue: String,
    savedAt: { type: Date, default: Date.now }
});
const Document = mongoose.model('Document', documentSchema);

// Settings Model
const settingsSchema = new mongoose.Schema({
    companyName: { type: String, default: 'ABDULLAH LLC' },
    companyEmail: { type: String, default: 'info@abdullah.ae' },
    companyPhone: { type: String, default: '+971 4 123 4567' },
    vatRate: { type: Number, default: 5 },
    currency: { type: String, default: 'د.إ' },
    headerImage: { type: String, default: null },
    footerImage: { type: String, default: null },
    updatedAt: { type: Date, default: Date.now }
});
const Settings = mongoose.model('Settings', settingsSchema);

// Account Model
const accountSchema = new mongoose.Schema({
    accountCode: String,
    accountName: String,
    accountType: String,
    phone: String,
    email: String,
    openingBalance: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});
const Account = mongoose.model('Account', accountSchema);

// Ledger Model
const ledgerSchema = new mongoose.Schema({
    accountName: String,
    date: Date,
    voucherNo: String,
    voucherType: String,
    chequeNo: String,
    narration: String,
    debit: { type: Number, default: 0 },
    credit: { type: Number, default: 0 },
    balance: { type: Number, default: 0 },
    relatedAccount: String,
    createdAt: { type: Date, default: Date.now }
});
const Ledger = mongoose.model('Ledger', ledgerSchema);

// ========== MONGODB CONNECTION ==========
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ MongoDB Connected Successfully!'))
    .catch(err => {
        console.error('❌ MongoDB Error:', err.message);
        console.log('Retrying in 5 seconds...');
        setTimeout(() => mongoose.connect(process.env.MONGODB_URI), 5000);
    });

// ========== HEALTH CHECK ==========
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Server is running!',
        mongodb: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
        timestamp: new Date().toISOString()
    });
});

app.get('/', (req, res) => {
    res.json({
        name: 'Business Management System API',
        version: '1.0.0',
        status: 'Running'
    });
});

// ========== PRODUCTS API ==========
app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post('/api/products', async (req, res) => {
    try {
        const product = new Product(req.body);
        await product.save();
        res.status(201).json(product);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

app.put('/api/products/:id', async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(product);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

app.delete('/api/products/:id', async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ========== DOCUMENTS API ==========
app.get('/api/documents', async (req, res) => {
    try {
        const docs = await Document.find().sort({ savedAt: -1 });
        res.json(docs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post('/api/documents', async (req, res) => {
    try {
        const doc = new Document(req.body);
        await doc.save();
        res.status(201).json(doc);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

app.get('/api/documents/:type/:number', async (req, res) => {
    try {
        const doc = await Document.findOne({ type: req.params.type, number: req.params.number });
        res.json(doc || {});
    } catch (error) {
        res.json({});
    }
});

app.delete('/api/documents/:type/:number', async (req, res) => {
    try {
        await Document.findOneAndDelete({ type: req.params.type, number: req.params.number });
        res.json({ message: 'Document deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ========== TAX INVOICE WITH LEDGER (FIXED) ==========
app.post('/api/invoice-with-ledger', async (req, res) => {
    try {
        const doc = new Document(req.body);
        await doc.save();
        
        // Create ledger entry if Ledger model exists
        try {
            const ledgerEntry = new Ledger({
                accountName: req.body.customerName,
                date: new Date(req.body.date),
                voucherNo: req.body.number,
                voucherType: 'Invoice',
                narration: `Tax Invoice ${req.body.number}`,
                debit: parseFloat(req.body.totalWithVAT),
                credit: 0,
                balance: parseFloat(req.body.totalWithVAT),
                relatedAccount: 'Sales Account'
            });
            await ledgerEntry.save();
        } catch (ledgerError) {
            console.log('Ledger entry skipped:', ledgerError.message);
        }
        
        res.status(201).json({ message: 'Tax Invoice saved successfully!', document: doc });
    } catch (error) {
        console.error('Invoice Error:', error);
        res.status(400).json({ message: error.message });
    }
});

// ========== SETTINGS API (FIXED) ==========
app.get('/api/settings', async (req, res) => {
    try {
        let settings = await Settings.findOne();
        if (!settings) {
            settings = new Settings();
            await settings.save();
        }
        res.json(settings);
    } catch (error) {
        console.error('Settings GET Error:', error);
        res.status(500).json({ message: error.message });
    }
});

app.put('/api/settings', async (req, res) => {
    try {
        let settings = await Settings.findOne();
        
        if (settings) {
            Object.assign(settings, req.body);
            settings.updatedAt = Date.now();
        } else {
            settings = new Settings(req.body);
        }
        
        await settings.save();
        console.log('Settings saved successfully');
        res.json(settings);
    } catch (error) {
        console.error('Settings PUT Error:', error);
        res.status(400).json({ message: error.message });
    }
});

// ========== ACCOUNTS API ==========
app.get('/api/accounts', async (req, res) => {
    try {
        const accounts = await Account.find().sort({ createdAt: -1 });
        res.json(accounts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post('/api/accounts', async (req, res) => {
    try {
        const { accountName, accountType, phone, email, openingBalance } = req.body;
        const accountCode = `${accountType.substring(0, 3)}-${Date.now()}`;
        const account = new Account({ accountCode, accountName, accountType, phone, email, openingBalance: openingBalance || 0 });
        await account.save();
        res.status(201).json(account);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

app.put('/api/accounts/:accountName', async (req, res) => {
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

// ========== LEDGER API ==========
app.get('/api/ledger/:accountName', async (req, res) => {
    try {
        const { accountName } = req.params;
        const { fromDate, toDate } = req.query;
        
        let query = { accountName };
        if (fromDate && toDate) {
            query.date = { $gte: new Date(fromDate), $lte: new Date(toDate) };
        }
        
        const entries = await Ledger.find(query).sort({ date: 1 });
        let runningBalance = 0;
        const entriesWithBalance = entries.map(entry => {
            runningBalance += (entry.debit - entry.credit);
            return { ...entry.toObject(), runningBalance };
        });
        
        const totalDebit = entries.reduce((sum, e) => sum + e.debit, 0);
        const totalCredit = entries.reduce((sum, e) => sum + e.credit, 0);
        
        res.json({
            entries: entriesWithBalance,
            summary: { totalDebit, totalCredit, closingBalance: totalDebit - totalCredit }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.get('/api/ledger/balance-sheet', async (req, res) => {
    try {
        const { asOnDate } = req.query;
        const date = asOnDate ? new Date(asOnDate) : new Date();
        
        const accounts = await Account.find();
        const assets = accounts.filter(a => ['Asset', 'Bank', 'Cash'].includes(a.accountType));
        const liabilities = accounts.filter(a => ['Liability', 'Equity'].includes(a.accountType));
        
        const getBalance = async (accountName) => {
            const entries = await Ledger.find({ accountName, date: { $lte: date } });
            return entries.reduce((sum, e) => sum + (e.debit - e.credit), 0);
        };
        
        const assetsWithBalance = await Promise.all(assets.map(async a => ({
            name: a.accountName, type: a.accountType, balance: await getBalance(a.accountName)
        })));
        
        const liabilitiesWithBalance = await Promise.all(liabilities.map(async l => ({
            name: l.accountName, type: l.accountType, balance: await getBalance(l.accountName)
        })));
        
        const totalAssets = assetsWithBalance.reduce((sum, a) => sum + a.balance, 0);
        const totalLiabilities = liabilitiesWithBalance.reduce((sum, l) => sum + l.balance, 0);
        
        res.json({
            assets: { items: assetsWithBalance, total: totalAssets },
            liabilities: { items: liabilitiesWithBalance, total: totalLiabilities },
            netWorth: totalAssets - totalLiabilities
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ========== RECEIPT API ==========
app.post('/api/receipt', async (req, res) => {
    try {
        const { receiptNo, date, customerName, amount, paymentMode, chequeNo, narration, invoiceNo } = req.body;
        
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

// ========== PAYMENT API ==========
app.post('/api/payment', async (req, res) => {
    try {
        const { paymentNo, date, supplierName, amount, paymentMode, chequeNo, narration, billNo } = req.body;
        
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

// ========== ERROR HANDLING ==========
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

app.use((req, res) => {
    res.status(404).json({ message: 'Route not found', requestedUrl: req.originalUrl });
});

// ========== START SERVER ==========
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`\n🚀 ========================================`);
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`🚀 ========================================`);
    console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
    console.log(`✅ Ready to accept requests!\n`);
});