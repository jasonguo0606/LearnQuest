const mongoose = require('mongoose');

const taskTemplateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  points: { type: Number, required: true, min: 1 },
});

const subjectSchema = new mongoose.Schema({
  familyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Family',
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  icon: {
    type: String,
    default: '',
  },
  taskTemplates: [taskTemplateSchema],
  isDefault: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

subjectSchema.index({ familyId: 1 });

module.exports = mongoose.model('Subject', subjectSchema);
