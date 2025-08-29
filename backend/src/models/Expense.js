// models/Expense.js
const mongoose = require('mongoose');
const Counter = require('./Counter');
const { type } = require('@hapi/joi/lib/extend');
const string = require('@hapi/joi/lib/types/string');

const expenseSchema = new mongoose.Schema({
  expenseNumber: {type: String, unique: true}, // e.g. EXP00001

  category: { 
    type: String, 
    enum: ['utilities', 'salaries', 'maintenance', 'outreach', 'other'],
    required: [true, 'Expense category is required'] 
  },
  amount: { 
    type: Number, 
    required: [true, 'Amount is required'],
    min: [0, 'Amount cannot be negative']
  },
  date: { type: Date, default: Date.now },
  description: { type: String },
  approvedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  recordedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  }
}, { timestamps: true });

  // Auto-generate expense number before saving
expenseSchema.pre('save', async function (next) {
  if (this.isNew) {
    const counter = await Counter.findOneAndUpdate(
      { name: 'Expense' },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    this.expenseNumber = `EXP${String(counter.seq).padStart(5, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Expense', expenseSchema);