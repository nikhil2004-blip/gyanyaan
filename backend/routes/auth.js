const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const connectDB = require('../db');

// Utility for fetch with timeout
async function fetchWithTimeout(resource, options = {}) {
    const { timeout = 8000 } = options;
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    const response = await fetch(resource, {
        ...options,
        signal: controller.signal
    });
    clearTimeout(id);
    return response;
}

// POST /api/auth/google
router.post('/google', async (req, res) => {
    try {
        await connectDB();
        const { accessToken } = req.body;
        if (!accessToken) return res.status(400).json({ error: 'accessToken required' });

        // Verify token with retry/timeout logic
        let googleRes;
        let attempts = 0;
        const maxAttempts = 2;

        while (attempts < maxAttempts) {
            try {
                googleRes = await fetchWithTimeout('https://www.googleapis.com/oauth2/v3/userinfo', {
                    headers: { Authorization: `Bearer ${accessToken}` },
                    timeout: 5000 // 5 seconds per attempt
                });
                if (googleRes.ok) break;
            } catch (e) {
                if (attempts === maxAttempts - 1) throw e;
                console.warn(`GAuth attempt ${attempts + 1} failed, retrying...`);
            }
            attempts++;
        }

        if (!googleRes || !googleRes.ok) {
            return res.status(401).json({
                error: 'Authentication failed',
                message: 'Failed to verify identity with Google'
            });
        }

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
        res.status(401).json({ error: 'Authentication failed', message: err.message, name: err.name });
    }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
    res.cookie('token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        expires: new Date(0)
    });
    res.json({ success: true });
});

module.exports = router;
