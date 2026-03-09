const express = require('express');
const router = express.Router();
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');
const connectDB = require('../db');

// GET /api/users/profile
router.get('/profile', authMiddleware, async (req, res) => {
    try {
        await connectDB();
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
router.post('/profile', authMiddleware, async (req, res) => {
    try {
        await connectDB();
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

module.exports = router;
