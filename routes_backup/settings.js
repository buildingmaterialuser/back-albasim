const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Import routes - USING CORRECT PLURAL NAMES from your routes folder
const productRoutes = require('./routes/products');
const documentRoutes = require('./routes/documents');
const settingsRoutes = require('./routes/settings');
const accountRoutes = require('./routes/accounts');
const ledgerRoutes = require('./routes/ledgers');
const receiptRoutes = require('./routes/receipts');
const paymentRoutes = require('./routes/payments');

// MongoDB Connection
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('✅ MongoDB Atlas Connected Successfully!');
        console.log('📊 Database:', mongoose.connection.db.databaseName);
    } catch (error) {
        console.error('❌ MongoDB Connection Error:', error.message);
        console.log('Retrying connection in 5 seconds...');
        setTimeout(connectDB, 5000);
    }
};

connectDB();

// Routes - API endpoints
app.use('/api/products', productRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/ledger', ledgerRoutes);
app.use('/api/receipt', receiptRoutes);
app.use('/api/payment', paymentRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Server is running!',
        mongodb: mongoose.connection.readyState === 1 ? 'Connected to Atlas' : 'Disconnected',
        database: mongoose.connection.db?.databaseName || 'Not connected',
        timestamp: new Date().toISOString()
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        name: 'Business Management System API',
        version: '1.0.0',
        status: 'Running',
        endpoints: {
            products: '/api/products',
            documents: '/api/documents',
            settings: '/api/settings',
            accounts: '/api/accounts',
            ledger: '/api/ledger',
            receipt: '/api/receipt',
            payment: '/api/payment',
            health: '/api/health'
        }
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    res.status(500).json({ 
        message: 'Something went wrong!', 
        error: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

// 404 handler for undefined routes
app.use((req, res) => {
    res.status(404).json({ 
        message: 'Route not found',
        requestedUrl: req.originalUrl
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`\n🚀 Server running on port ${PORT}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
    console.log(`🌐 Base URL: http://localhost:${PORT}`);
    console.log(`\n📋 Available API Endpoints:`);
    console.log(`   ✅ GET  /api/products     - Get all products`);
    console.log(`   ✅ POST /api/products     - Create new product`);
    console.log(`   ✅ GET  /api/documents    - Get all documents`);
    console.log(`   ✅ POST /api/documents    - Create new document`);
    console.log(`   ✅ GET  /api/settings     - Get settings`);
    console.log(`   ✅ PUT  /api/settings     - Update settings`);
    console.log(`   ✅ GET  /api/accounts     - Get all accounts`);
    console.log(`   ✅ POST /api/accounts     - Create new account`);
    console.log(`   ✅ GET  /api/ledger       - Get ledger entries`);
    console.log(`   ✅ POST /api/receipt      - Create receipt`);
    console.log(`   ✅ POST /api/payment      - Create payment`);
    console.log(`\n✅ Server is ready to accept requests!\n`);
});