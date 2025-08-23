// models/Expense.js
const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
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

module.exports = mongoose.model('Expense', expenseSchema);