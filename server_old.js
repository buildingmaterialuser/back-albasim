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

// Import routes - ONLY THE ONES THAT EXIST
const productRoutes = require('./routes/product');
const documentRoutes = require('./routes/document');
const settingsRoutes = require('./routes/setting');

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

// Routes - ONLY THE ONES THAT EXIST
app.use('/api/products', productRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/settings', settingsRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Server is running!',
        mongodb: mongoose.connection.readyState === 1 ? 'Connected to Atlas' : 'Disconnected',
        database: mongoose.connection.db?.databaseName || 'Not connected'
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

// 404 handler for undefined routes
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
    console.log(`📋 Available endpoints:`);
    console.log(`   - GET  /api/products`);
    console.log(`   - POST /api/products`);
    console.log(`   - GET  /api/documents`);
    console.log(`   - POST /api/documents`);
    console.log(`   - GET  /api/settings`);
    console.log(`   - PUT  /api/settings`);
});