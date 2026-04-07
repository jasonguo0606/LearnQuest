const mongoose = require('mongoose');

const familyAchievementSchema = new mongoose.Schema({
  familyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Family',
    required: true,
  },
  achievementId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Achievement',
    required: true,
  },
  isUnlocked: { type: Boolean, default: false },
  progress: { type: Number, default: 0 },
  unlockedAt: Date,
});

familyAchievementSchema.index({ familyId: 1, achievementId: 1 }, { unique: true });

module.exports = mongoose.model('FamilyAchievement', familyAchievementSchema);
