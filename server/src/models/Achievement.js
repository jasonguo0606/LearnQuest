const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['learning', 'persistence', 'pet'],
    required: true,
  },
  title: { type: String, required: true },
  description: { type: String, required: true },
  icon: { type: String, default: '' },
  condition: {
    type: {
      type: String,
      enum: ['count', 'streak', 'pet_level', 'pet_count', 'all_subjects'],
      required: true,
    },
    subjectFilter: String,
    target: { type: Number, required: true },
  },
  isHidden: { type: Boolean, default: false },
  unlocksPetType: String,
});

module.exports = mongoose.model('Achievement', achievementSchema);
