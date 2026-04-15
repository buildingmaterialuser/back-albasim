const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ========== MongoDB Connection for Railway ==========
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 30000,
            family: 4,
            retryWrites: true,
            retryReads: true
        });
        console.log('✅ MongoDB Railway Connected Successfully!');
        console.log('📊 Database:', mongoose.connection.db.databaseName);
    } catch (error) {
        console.error('❌ MongoDB Connection Error:', error.message);
        console.log('Retrying in 5 seconds...');
        setTimeout(connectDB, 5000);
    }
};

connectDB();

// ========== Define Models ==========
const productSchema = new mongoose.Schema({
    name: String, code: String, purchaseRate: Number, saleRate: Number, stock: Number,
    createdAt: { type: Date, default: Date.now }
});
const Product = mongoose.model('Product', productSchema);

const documentSchema = new mongoose.Schema({
    number: String, type: String, title: String, date: String,
    customerName: String, customerPhone: String, customerTRN: String, customerAddress: String,
    items: Array, subtotal: String, vat: String, totalWithVAT: String,
    advancePayment: String, balanceDue: String, savedAt: { type: Date, default: Date.now }
});
const Document = mongoose.model('Document', documentSchema);

const settingsSchema = new mongoose.Schema({
    companyName: { type: String, default: 'ABDULLAH LLC' },
    companyEmail: String, companyPhone: String,
    vatRate: { type: Number, default: 5 }, currency: { type: String, default: 'د.إ' }
});
const Settings = mongoose.model('Settings', settingsSchema);

// ========== Products API ==========
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
        res.json({ message: 'Product deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ========== Documents API ==========
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
        res.json({ message: 'Document deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ========== Settings API ==========
app.get('/api/settings', async (req, res) => {
    try {
        let settings = await Settings.findOne();
        if (!settings) {
            settings = new Settings();
            await settings.save();
        }
        res.json(settings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.put('/api/settings', async (req, res) => {
    try {
        let settings = await Settings.findOne();
        if (settings) {
            Object.assign(settings, req.body);
        } else {
            settings = new Settings(req.body);
        }
        await settings.save();
        res.json(settings);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// ========== Health Check ==========
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Server is running!',
        mongodb: mongoose.connection.readyState === 1 ? 'Connected to Railway' : 'Disconnected',
        timestamp: new Date().toISOString()
    });
});

app.get('/', (req, res) => {
    res.json({
        name: 'Business Management System API',
        version: '1.0.0',
        status: 'Running',
        mongodbStatus: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
    });
});

// ========== Start Server ==========
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`\n🚀 Server running on http://localhost:${PORT}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
    console.log(`\n✅ Ready to accept requests!\n`);
});