const mongoose = require('mongoose');

const petSchema = new mongoose.Schema({
  familyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Family',
    required: true,
    index: true,
  },
  type: { type: String, required: true },
  name: { type: String, required: true, trim: true },
  level: { type: Number, default: 1 },
  exp: { type: Number, default: 0 },
  mood: { type: String, enum: ['happy', 'normal', 'hungry'], default: 'happy' },
  lastFedAt: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: false },
  unlockedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Pet', petSchema);
