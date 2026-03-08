const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    missionId: { type: String, required: true },
    unlockedLevels: { type: [Number], default: [1] },
    completedLevels: { type: [Number], default: [] },
    missionComplete: { type: Boolean, default: false },
    lastPlayed: { type: Date, default: Date.now },
});

// Compound index — one progress doc per user per mission
progressSchema.index({ userId: 1, missionId: 1 }, { unique: true });

module.exports = mongoose.model('Progress', progressSchema);
