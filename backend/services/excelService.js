const ExcelJS = require("exceljs");
const Revenue = require("../models/Revenue");
const Expense = require("../models/Expense");
const TransactionType = require("../models/TransactionType");
const {
  generateRevenueId,
  generateExpenseId,
} = require("./numberSeriesService");
const logger = require("../utils/logger");

// Import revenues from Excel
exports.importRevenues = async (fileBuffer, userId) => {
  try {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(fileBuffer);

    const worksheet = workbook.getWorksheet(1);
    const revenues = [];
    const errors = [];

    // Get all revenue transaction types for validation
    const revenueTypes = await TransactionType.find({
      category: "revenue",
      isActive: true,
    });
    const typeNameMap = {};
    revenueTypes.forEach((type) => {
      typeNameMap[type.name.toLowerCase()] = type._id;
    });

    let rowNumber = 2; // Start from row 2 (assuming row 1 is header)
    worksheet.eachRow({ includeEmpty: false }, (row, rowIndex) => {
      if (rowIndex === 1) return; // Skip header row

      try {
        const date = row.getCell(1).value;
        const typeName = row.getCell(2).value;
        const amount = row.getCell(3).value;
        const description = row.getCell(4).value;
        const memberName = row.getCell(5).value;

        // Validate required fields
        if (!date || !typeName || !amount) {
          errors.push(
            `Row ${rowNumber}: Missing required fields (date, type, or amount)`
          );
          return;
        }

        // Validate transaction type
        const typeId = typeNameMap[typeName.toLowerCase()];
        if (!typeId) {
          errors.push(
            `Row ${rowNumber}: Invalid transaction type '${typeName}'`
          );
          return;
        }

        // Validate amount
        if (isNaN(amount) || amount <= 0) {
          errors.push(`Row ${rowNumber}: Invalid amount '${amount}'`);
          return;
        }

        revenues.push({
          date: new Date(date),
          type: typeId,
          amount: parseFloat(amount),
          description: description || "",
          member: null, // You might want to implement member lookup by name
          createdBy: userId,
        });
      } catch (error) {
        errors.push(`Row ${rowNumber}: ${error.message}`);
      }

      rowNumber++;
    });

    // Save revenues to database
    const savedRevenues = [];
    for (const revenueData of revenues) {
      try {
        const revenueId = await generateRevenueId();
        const revenue = new Revenue({
          revenueId,
          ...revenueData,
        });

        await revenue.save();
        savedRevenues.push(revenue);
      } catch (error) {
        errors.push(`Error saving revenue: ${error.message}`);
      }
    }

    logger.info(`Revenues imported by user ${userId}`, {
      action: "importRevenues",
      userId: userId,
      importedCount: savedRevenues.length,
      errorCount: errors.length,
    });

    return {
      success: errors.length === 0,
      importedCount: savedRevenues.length,
      errors,
    };
  } catch (error) {
    logger.error(`Import revenues error: ${error.message}`);
    throw error;
  }
};

// Import expenses from Excel
exports.importExpenses = async (fileBuffer, userId) => {
  try {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(fileBuffer);

    const worksheet = workbook.getWorksheet(1);
    const expenses = [];
    const errors = [];

    // Get all expense transaction types for validation
    const expenseTypes = await TransactionType.find({
      category: "expense",
      isActive: true,
    });
    const typeNameMap = {};
    expenseTypes.forEach((type) => {
      typeNameMap[type.name.toLowerCase()] = type._id;
    });

    let rowNumber = 2; // Start from row 2 (assuming row 1 is header)
    worksheet.eachRow({ includeEmpty: false }, (row, rowIndex) => {
      if (rowIndex === 1) return; // Skip header row

      try {
        const date = row.getCell(1).value;
        const typeName = row.getCell(2).value;
        const amount = row.getCell(3).value;
        const description = row.getCell(4).value;

        // Validate required fields
        if (!date || !typeName || !amount) {
          errors.push(
            `Row ${rowNumber}: Missing required fields (date, type, or amount)`
          );
          return;
        }

        // Validate transaction type
        const typeId = typeNameMap[typeName.toLowerCase()];
        if (!typeId) {
          errors.push(
            `Row ${rowNumber}: Invalid transaction type '${typeName}'`
          );
          return;
        }

        // Validate amount
        if (isNaN(amount) || amount <= 0) {
          errors.push(`Row ${rowNumber}: Invalid amount '${amount}'`);
          return;
        }

        expenses.push({
          date: new Date(date),
          type: typeId,
          amount: parseFloat(amount),
          description: description || "",
          createdBy: userId,
        });
      } catch (error) {
        errors.push(`Row ${rowNumber}: ${error.message}`);
      }

      rowNumber++;
    });

    // Save expenses to database
    const savedExpenses = [];
    for (const expenseData of expenses) {
      try {
        const expenseId = await generateExpenseId();
        const expense = new Expense({
          expenseId,
          ...expenseData,
        });

        await expense.save();
        savedExpenses.push(expense);
      } catch (error) {
        errors.push(`Error saving expense: ${error.message}`);
      }
    }

    logger.info(`Expenses imported by user ${userId}`, {
      action: "importExpenses",
      userId: userId,
      importedCount: savedExpenses.length,
      errorCount: errors.length,
    });

    return {
      success: errors.length === 0,
      importedCount: savedExpenses.length,
      errors,
    };
  } catch (error) {
    logger.error(`Import expenses error: ${error.message}`);
    throw error;
  }
};

// Export revenues to Excel
// Export revenues to Excel
exports.exportRevenues = async (filters) => {
  try {
    let { startDate, endDate } = filters;

    // Build proper date filter
    const dateFilter = {};

    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      dateFilter.$gte = start;
    }

    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      dateFilter.$lte = end;
    }

    const revenueFilter =
      Object.keys(dateFilter).length > 0 ? { date: dateFilter } : {};

    const revenues = await Revenue.find(revenueFilter)
      .populate("type", "name")
      .populate("member", "firstName lastName")
      .populate("createdBy", "firstName lastName")
      .sort({ date: 1 });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Revenues");

    // Add headers
    worksheet.columns = [
      { header: "Revenue ID", key: "revenueId", width: 15 },
      { header: "Date", key: "date", width: 15 },
      { header: "Type", key: "type", width: 20 },
      { header: "Amount", key: "amount", width: 15 },
      { header: "Description", key: "description", width: 30 },
      { header: "Member", key: "member", width: 25 },
      { header: "Created By", key: "createdBy", width: 25 },
      { header: "Created At", key: "createdAt", width: 20 },
    ];

    // Add data
    revenues.forEach((revenue) => {
      worksheet.addRow({
        revenueId: revenue.revenueId,
        date: revenue.date,
        type: revenue.type.name,
        amount: revenue.amount,
        description: revenue.description || "",
        member: revenue.member
          ? `${revenue.member.firstName} ${revenue.member.lastName}`
          : "",
        createdBy: `${revenue.createdBy.firstName} ${revenue.createdBy.lastName}`,
        createdAt: revenue.createdAt,
      });
    });

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
  } catch (error) {
    logger.error(`Export revenues error: ${error.message}`);
    throw error;
  }
};

// Export expenses to Excel
exports.exportExpenses = async (filters) => {
  try {
    let { startDate, endDate } = filters;

    // Build proper date filter
    const dateFilter = {};

    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      dateFilter.$gte = start;
    }

    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      dateFilter.$lte = end;
    }

    const expenseFilter =
      Object.keys(dateFilter).length > 0 ? { date: dateFilter } : {};

    const expenses = await Expense.find(expenseFilter)
      .populate("type", "name")
      .populate("createdBy", "firstName lastName")
      .sort({ date: 1 });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Expenses");

    // Add headers
    worksheet.columns = [
      { header: "Expense ID", key: "expenseId", width: 15 },
      { header: "Date", key: "date", width: 15 },
      { header: "Type", key: "type", width: 20 },
      { header: "Amount", key: "amount", width: 15 },
      { header: "Description", key: "description", width: 30 },
      { header: "Created By", key: "createdBy", width: 25 },
      { header: "Created At", key: "createdAt", width: 20 },
    ];

    // Add data
    expenses.forEach((expense) => {
      worksheet.addRow({
        expenseId: expense.expenseId,
        date: expense.date,
        type: expense.type.name,
        amount: expense.amount,
        description: expense.description || "",
        createdBy: `${expense.createdBy.firstName} ${expense.createdBy.lastName}`,
        createdAt: expense.createdAt,
      });
    });

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
  } catch (error) {
    logger.error(`Export expenses error: ${error.message}`);
    throw error;
  }
};
// Export expenses to Excel
exports.exportExpenses = async (filters) => {
  try {
    const { startDate, endDate } = filters;

    // Build date filter
    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);

    const expenseFilter = dateFilter ? { date: dateFilter } : {};

    const expenses = await Expense.find(expenseFilter)
      .populate("type", "name")
      .populate("createdBy", "firstName lastName")
      .sort({ date: 1 });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Expenses");

    // Add headers
    worksheet.columns = [
      { header: "Expense ID", key: "expenseId", width: 15 },
      { header: "Date", key: "date", width: 15 },
      { header: "Type", key: "type", width: 20 },
      { header: "Amount", key: "amount", width: 15 },
      { header: "Description", key: "description", width: 30 },
      { header: "Created By", key: "createdBy", width: 25 },
      { header: "Created At", key: "createdAt", width: 20 },
    ];

    // Add data
    expenses.forEach((expense) => {
      worksheet.addRow({
        expenseId: expense.expenseId,
        date: expense.date,
        type: expense.type.name,
        amount: expense.amount,
        description: expense.description || "",
        createdBy: `${expense.createdBy.firstName} ${expense.createdBy.lastName}`,
        createdAt: expense.createdAt,
      });
    });

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
  } catch (error) {
    logger.error(`Export expenses error: ${error.message}`);
    throw error;
  }
};
