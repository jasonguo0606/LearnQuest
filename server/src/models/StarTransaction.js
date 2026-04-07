const mongoose = require('mongoose');

const starTransactionSchema = new mongoose.Schema({
  familyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Family',
    required: true,
    index: true,
  },
  type: {
    type: String,
    enum: ['earn', 'feed', 'redeem', 'unlock'],
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  referenceId: {
    type: mongoose.Schema.Types.ObjectId,
  },
  description: {
    type: String,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('StarTransaction', starTransactionSchema);
