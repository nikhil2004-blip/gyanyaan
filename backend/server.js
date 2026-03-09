require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const progressRoutes = require('./routes/progress');

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Middleware ────────────────────────────────────────────────────────────────
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173')
    .split(',')
    .map(o => o.trim());

app.use(cors({
    origin: (origin, callback) => {
        // Vercel proxy origins, or allowed explicit domains in env
        if (!origin || origin.includes('vercel.app') || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
}));

app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(express.json());
app.use(cookieParser());

// ─── MongoDB ───────────────────────────────────────────────────────────────────
const connectDB = require('./db');
connectDB();

// ─── Routes ────────────────────────────────────────────────────────────────────

// Health check
app.get('/', (req, res) => res.send('Gyanyaan Backend Operational'));

// Modular Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/progress', progressRoutes);

// ─── Global Error Handler ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
    console.error(`[Error] ${err.message}`);
    const status = err.status || 500;
    res.status(status).json({
        error: err.message || 'Internal Server Error',
        status: status
    });
});

// ─── Start or Export ───────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'production' || process.env.VERCEL_DEV) {
    app.listen(PORT, () => console.log(`Backend server running at http://localhost:${PORT}`));
}

module.exports = app;
