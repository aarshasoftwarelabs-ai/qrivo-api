require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const supabase = require('./services/supabase');

// Advanced Features (VirusTotal, Safe Browsing, History)
const scanRoutes = require('./routes/scan');
const historyRoutes = require('./routes/history');
const reportRoutes = require('./routes/report');
const notificationRoutes = require('./routes/notification');

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Rate Limiter
const limiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 20
});

app.use('/api/v1/scan', limiter);

// Register Advanced Routes
app.use(scanRoutes);
app.use(historyRoutes);
app.use(reportRoutes);
app.use(notificationRoutes);

// =========================
// Root Route
// =========================
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'QR Shield API is running 🚀'
    });
});

// =========================
// Health Check
// =========================
app.get('/health', (req, res) => {
    res.json({
        success: true,
        status: 'ok'
    });
});

// =========================
// Test Database
// =========================
app.get('/test-db', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .limit(5);

        if (error) throw error;

        res.json({
            success: true,
            data
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
});

// =========================
// Get Product by QR Code
// =========================
app.get('/product/:qr', async (req, res) => {
    try {
        const qr = req.params.qr;

        const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('qr_code', qr)
            .single();

        if (error || !data) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        res.json({
            success: true,
            data
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
});

// =========================
// Start Server
// =========================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`🚀 QR Shield API running on port ${PORT}`);
});