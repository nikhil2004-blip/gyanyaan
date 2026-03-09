require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

const User = require('./models/User');
const Progress = require('./models/Progress');

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
app.use('/assets', express.static(path.join(__dirname, 'assets'), {
    maxAge: '1y',
    immutable: true
}));


// ─── MongoDB ───────────────────────────────────────────────────────────────────
mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB connected'))
    .catch((err) => console.error('MongoDB connection error:', err));

// ─── Auth Middleware ───────────────────────────────────────────────────────────
function authMiddleware(req, res, next) {
    const token = req.cookies.token || (req.headers.authorization && req.headers.authorization.split(' ')[1]);

    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
}

// ─── Routes ────────────────────────────────────────────────────────────────────

// Health check
app.get('/', (req, res) => res.send('Gyanyaan Backend Operational'));

// POST /api/auth/google
// Body: { accessToken: string }
// Verifies Google access token via userinfo endpoint, upserts user, returns JWT
app.post('/api/auth/google', async (req, res) => {
    try {
        const { accessToken } = req.body;
        if (!accessToken) return res.status(400).json({ error: 'accessToken required' });

        // Verify token by calling Google's userinfo endpoint
        const googleRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (!googleRes.ok) return res.status(401).json({ error: 'Invalid Google access token' });

        const { sub: googleId, email, name, picture: avatar } = await googleRes.json();

        let user = await User.findOne({ googleId });
        const isNewUser = !user;

        if (!user) {
            user = await User.create({ googleId, email, name, avatar });
        }

        const token = jwt.sign(
            { userId: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Secure HttpOnly Cookie Attachment
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        res.json({
            isNewUser,
            user: {
                id: user._id.toString(),
                email: user.email,
                name: user.name,
                avatar: user.avatar,
                nickname: user.nickname,
                age: user.age,
                expertise: user.expertise,
            },
        });
    } catch (err) {
        console.error('Auth error:', err);
        res.status(401).json({ error: 'Authentication failed' });
    }
});

// POST /api/auth/logout
// Clears the HttpOnly cookie
app.post('/api/auth/logout', (req, res) => {
    res.cookie('token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        expires: new Date(0)
    });
    res.json({ success: true });
});



// GET /api/users/profile
app.get('/api/users/profile', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-__v');
        if (!user) return res.status(404).json({ error: 'User not found' });

        res.json({
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            avatar: user.avatar,
            nickname: user.nickname,
            age: user.age,
            expertise: user.expertise,
        });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /api/users/profile
// Body: { nickname, age, expertise }
app.post('/api/users/profile', authMiddleware, async (req, res) => {
    try {
        const { nickname, age, expertise } = req.body;
        const user = await User.findByIdAndUpdate(
            req.user.userId,
            { nickname, age, expertise },
            { new: true, runValidators: true }
        ).select('-__v');

        res.json({
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            avatar: user.avatar,
            nickname: user.nickname,
            age: user.age,
            expertise: user.expertise,
        });
    } catch (err) {
        res.status(500).json({ error: 'Error saving profile' });
    }
});

// GET /api/progress/:missionId
app.get('/api/progress/:missionId', authMiddleware, async (req, res) => {
    try {
        const progress = await Progress.findOne({
            userId: req.user.userId,
            missionId: req.params.missionId,
        });
        // Default: Level 1 unlocked
        if (!progress) return res.json({ unlockedLevels: [1], completedLevels: [], missionComplete: false });
        res.json(progress);
    } catch (err) {
        res.status(500).json({ error: 'Error fetching progress' });
    }
});

// POST /api/progress/:missionId
// Body: { completedLevel: number }
app.post('/api/progress/:missionId', authMiddleware, async (req, res) => {
    try {
        const { completedLevel } = req.body;
        if (!completedLevel) return res.status(400).json({ error: 'completedLevel required' });

        const { missionId } = req.params;
        const userId = req.user.userId;

        let progress = await Progress.findOne({ userId, missionId });
        if (!progress) {
            progress = new Progress({ userId, missionId });
        }

        // Add to completed
        if (!progress.completedLevels.includes(completedLevel)) {
            progress.completedLevels.push(completedLevel);
        }
        // Unlock next level (up to 8)
        if (completedLevel < 8 && !progress.unlockedLevels.includes(completedLevel + 1)) {
            progress.unlockedLevels.push(completedLevel + 1);
        }
        progress.missionComplete = progress.completedLevels.length >= 8;
        progress.lastPlayed = new Date();

        await progress.save();
        res.json(progress);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error saving progress' });
    }
});

// ─── Start or Export ───────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'production' || process.env.VERCEL_DEV) {
    app.listen(PORT, () => console.log(`Backend server running at http://localhost:${PORT}`));
}

module.exports = app;
