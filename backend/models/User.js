const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    googleId: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    avatar: { type: String },
    // Onboarding profile
    nickname: { type: String },
    age: { type: Number },
    expertise: { type: String, enum: ['beginner', 'enthusiast', 'pro'], default: 'beginner' },
    joinedAt: { type: Date, default: Date.now },
}, {
    toJSON: {
        virtuals: true,           // include the `id` virtual (string version of _id)
        transform: (doc, ret) => {
            ret.id = ret._id.toString(); // always expose id as plain string
            delete ret._id;
            delete ret.__v;
            return ret;
        }
    }
});

module.exports = mongoose.model('User', userSchema);
