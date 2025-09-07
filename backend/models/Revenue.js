const mongoose = require('mongoose');

const revenueSchema = new mongoose.Schema({
  revenueId: {
    type: String,
    unique: true,
    required: true
  },
  type: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TransactionType',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  description: {
    type: String,
    trim: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  member: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Remove the manual index definitions since we're using schema options
// revenueSchema.index({ revenueId: 1 });
// revenueSchema.index({ type: 1 });
// revenueSchema.index({ date: 1 });
// revenueSchema.index({ createdBy: 1 });
// revenueSchema.index({ member: 1 });

// Update the updatedAt field before saving
revenueSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Revenue', revenueSchema);