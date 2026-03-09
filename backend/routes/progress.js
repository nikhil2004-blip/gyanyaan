const express = require('express');
const router = express.Router();
const Progress = require('../models/Progress');
const authMiddleware = require('../middleware/auth');
const connectDB = require('../db');

// GET /api/progress/:missionId
router.get('/:missionId', authMiddleware, async (req, res) => {
    try {
        await connectDB();
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
router.post('/:missionId', authMiddleware, async (req, res) => {
    try {
        await connectDB();
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

module.exports = router;
