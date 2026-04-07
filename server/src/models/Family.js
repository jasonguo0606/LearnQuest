const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const familySchema = new mongoose.Schema({
  familyId: {
    type: String,
    unique: true,
    required: true,
    default: () => crypto.randomBytes(4).toString('hex').toUpperCase(),
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  pin: {
    type: String,
    required: true,
  },
  initialPetChosen: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

familySchema.pre('save', async function () {
  if (this.isModified('pin')) {
    this.pin = await bcrypt.hash(this.pin, 10);
  }
});

familySchema.methods.comparePin = function (candidatePin) {
  return bcrypt.compare(candidatePin, this.pin);
};

module.exports = mongoose.model('Family', familySchema);
