const Revenue = require('../models/Revenue');
const Expense = require('../models/Expense');
const User = require('../models/User');

const generateNumberSeries = async (model, prefix, field = '_id') => {
  try {
    // Find the latest document to get the highest number
    const latestDoc = await model.findOne().sort({ [field]: -1 });
    
    let nextNumber = 1;
    if (latestDoc && latestDoc[field]) {
      const lastId = latestDoc[field];
      const lastNumber = parseInt(lastId.replace(prefix, '')) || 0;
      nextNumber = lastNumber + 1;
    }
    
    // Format the number with leading zeros
    const formattedNumber = nextNumber.toString().padStart(5, '0');
    return `${prefix}${formattedNumber}`;
  } catch (error) {
    console.error(`Error generating number series for ${prefix}:`, error);
    // Fallback: use timestamp-based ID
    const timestamp = Date.now().toString().slice(-5);
    return `${prefix}${timestamp}`;
  }
};

module.exports = {
  generateRevenueId: async () => generateNumberSeries(Revenue, 'REV', 'revenueId'),
  generateExpenseId: async () => generateNumberSeries(Expense, 'EXP', 'expenseId'),
  generateUserId: async () => generateNumberSeries(User, 'USR', 'userId')
};