const mongoose = require('mongoose');

const transactionTypeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    enum: ['revenue', 'expense'],
    required: true
  },
  description: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
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
// transactionTypeSchema.index({ name: 1 });
// transactionTypeSchema.index({ category: 1 });
// transactionTypeSchema.index({ isActive: 1 });

// Update the updatedAt field before saving
transactionTypeSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('TransactionType', transactionTypeSchema);