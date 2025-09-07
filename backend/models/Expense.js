const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  expenseId: {
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
// expenseSchema.index({ expenseId: 1 });
// expenseSchema.index({ type: 1 });
// expenseSchema.index({ date: 1 });
// expenseSchema.index({ createdBy: 1 });

// Update the updatedAt field before saving
expenseSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Expense', expenseSchema);