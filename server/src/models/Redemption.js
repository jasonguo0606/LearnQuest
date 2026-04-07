const mongoose = require('mongoose');

const redemptionSchema = new mongoose.Schema({
  familyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Family',
    required: true,
    index: true,
  },
  rewardId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Reward',
    required: true,
  },
  rewardName: { type: String, required: true },
  cost: { type: Number, required: true },
  status: {
    type: String,
    enum: ['pending', 'confirmed'],
    default: 'pending',
  },
  createdAt: { type: Date, default: Date.now },
  confirmedAt: Date,
});

module.exports = mongoose.model('Redemption', redemptionSchema);
