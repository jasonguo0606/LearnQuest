const mongoose = require('mongoose');

const rewardSchema = new mongoose.Schema({
  familyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Family',
    required: true,
    index: true,
  },
  name: { type: String, required: true, trim: true },
  icon: { type: String, default: '' },
  cost: { type: Number, required: true, min: 1 },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Reward', rewardSchema);
