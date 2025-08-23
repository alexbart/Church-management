// models/Revenue.js
const mongoose = require('mongoose');

const revenueSchema = new mongoose.Schema({
  type: { 
    type: String, 
    enum: ['tithe', 'offering', 'donation', 'other'],
    required: [true, 'Revenue type is required'] 
  },
  amount: { 
    type: Number, 
    required: [true, 'Amount is required'],
    min: [0, 'Amount cannot be negative']
  },
  date: { type: Date, default: Date.now },
  description: { type: String },
  recordedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  }
}, { timestamps: true });

module.exports = mongoose.model('Revenue', revenueSchema);