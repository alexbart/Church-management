// models/Revenue.js
const mongoose = require('mongoose');
const Counter = require('./Counter');

const revenueSchema = new mongoose.Schema({
  revenueNumber: { type: String, unique: true }, // e.g. REV00001
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

// Auto-generate revenue number before saving
revenueSchema.pre('save', async function (next) {
  if (this.isNew) {
    const counter = await Counter.findOneAndUpdate(
      { name: 'Revenue' },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    this.revenueNumber = `REV${String(counter.seq).padStart(5, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Revenue', revenueSchema);