// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const scanRoutes = require('./routes/scan');
const historyRoutes = require('./routes/history');
const reportRoutes = require('./routes/report');
const notificationRoutes = require('./routes/notification');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

// Rate limit — protects your VirusTotal/Google quota from abuse
const limiter = rateLimit({ windowMs: 60 * 1000, max: 20 }); // 20 scans/min per IP
app.use('/api/v1/scan', limiter);

app.use(scanRoutes);
app.use(historyRoutes);
app.use(reportRoutes);
app.use(notificationRoutes);

app.get('/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`QR Shield API running on port ${PORT}`));
