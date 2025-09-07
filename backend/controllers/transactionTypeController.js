const { log } = require("winston");
const TransactionType = require("../models/TransactionType");
const logger = require("../utils/logger");
const validators = require("../utils/validators");
const mongoose = require("mongoose");

// Get all transaction types
// Get all transaction types
// Get all transaction types
exports.getAllTransactionTypes = async (request, reply) => {
  try {
    const { page = 1, limit = 10, category, isActive } = request.query;

    const filter = {};
    if (category) filter.category = category;
    if (isActive !== undefined) filter.isActive = isActive === "true";

    const transactionTypes = await TransactionType.find(filter)
      .populate("createdBy", "firstName lastName userId")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ name: 1 });

    const total = await TransactionType.countDocuments(filter);

    logger.info(`Transaction types retrieved by user ${request.user.id}`, {
      action: "getAllTransactionTypes",
      userId: request.user.id,
    });

    // ADD RETURN to prevent "Reply was already sent" warning
    return reply.send({
      success: true,
      message: "Transaction types retrieved successfully",
      data: transactionTypes,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error(`Get transaction types error: ${error.message}`);
    return reply.code(500).send({ success: false, message: error.message });
  }
};

// Get single transaction type
// Get single transaction type
// Get single transaction type
exports.getTransactionType = async (request, reply) => {
  try {
    let { id } = request.params;
    id = id.trim();

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return reply.code(400).send({
        success: false,
        message: "Invalid transaction type ID format",
        receivedId: id,
        idLength: id.length,
        expectedFormat: "24-character hexadecimal string",
      });
    }

    const transactionType = await TransactionType.findById(id)
      .populate("createdBy", "firstName lastName userId")
      .lean();

    if (!transactionType) {
      return reply.code(404).send({
        success: false,
        message: "Transaction type not found", // ← ONLY ONE MESSAGE PROPERTY
        id: id,
      });
    }

    // Store the original data on the request object for emergency restoration
    request.originalResponseData = transactionType;

    // RETURN the reply.send() call to prevent "Reply was already sent" warnings
    return reply.send({
      success: true,
      message: "Transaction type retrieved successfully",
      data: transactionType
    });

  } catch (error) {
    logger.error(`Get transaction type error: ${error.message}`);
    return reply.code(500).send({ 
      success: false, 
      message: error.message 
    });
  }
};
// Create transaction type
exports.createTransactionType = async (request, reply) => {
  try {
    const { name, category, description } = request.body;

    // Check if transaction type already exists
    const existingType = await TransactionType.findOne({
      name: new RegExp(`^${name}$`, "i"),
      category,
    });

    if (existingType) {
      return reply.code(400).send({
        success: false,
        message: "Transaction type with this name and category already exists",
      });
    }

    const transactionType = new TransactionType({
      name,
      category,
      description,
      createdBy: request.user.id,
    });

    await transactionType.save();

    // Populate the created transaction type for response
    const populatedType = await TransactionType.findById(
      transactionType._id
    ).populate("createdBy", "firstName lastName userId");

    logger.info(
      `Transaction type created: ${name} by user ${request.user.id}`,
      {
        action: "createTransactionType",
        userId: request.user.id,
        transactionTypeId: transactionType._id,
      }
    );

    reply.code(201).send({
      success: true,
      message: "Transaction type created successfully",
      data: populatedType,
    });
  } catch (error) {
    logger.error(`Create transaction type error: ${error.message}`);
    reply.code(500).send({ success: false, message: error.message });
  }
};

// Update transaction type
exports.updateTransactionType = async (request, reply) => {
  try {
    const { name, category, description, isActive } = request.body;

    const transactionType = await TransactionType.findById(request.params.id);
    if (!transactionType) {
      return reply
        .code(404)
        .send({ success: false, message: "Transaction type not found" });
    }

    // Check if another transaction type with the same name and category exists
    if (name && category) {
      const existingType = await TransactionType.findOne({
        name: new RegExp(`^${name}$`, "i"),
        category,
        _id: { $ne: request.params.id },
      });

      if (existingType) {
        return reply.code(400).send({
          success: false,
          message:
            "Another transaction type with this name and category already exists",
        });
      }
    }

    if (name) transactionType.name = name;
    if (category) transactionType.category = category;
    if (description !== undefined) transactionType.description = description;
    if (isActive !== undefined) transactionType.isActive = isActive;

    await transactionType.save();

    // Populate the updated transaction type for response
    const populatedType = await TransactionType.findById(
      transactionType._id
    ).populate("createdBy", "firstName lastName userId");

    logger.info(
      `Transaction type ${request.params.id} updated by user ${request.user.id}`,
      {
        action: "updateTransactionType",
        userId: request.user.id,
        transactionTypeId: request.params.id,
      }
    );

    reply.send({
      success: true,
      message: "Transaction type updated successfully",
      data: populatedType,
    });
  } catch (error) {
    logger.error(`Update transaction type error: ${error.message}`);
    reply.code(500).send({ success: false, message: error.message });
  }
};

// Delete transaction type
exports.deleteTransactionType = async (request, reply) => {
  try {
    const transactionType = await TransactionType.findById(request.params.id);

    if (!transactionType) {
      return reply
        .code(404)
        .send({ success: false, message: "Transaction type not found" });
    }

    // Check if transaction type is being used
    const Revenue = require("../models/Revenue");
    const Expense = require("../models/Expense");

    const revenueCount = await Revenue.countDocuments({
      type: request.params.id,
    });
    const expenseCount = await Expense.countDocuments({
      type: request.params.id,
    });

    if (revenueCount > 0 || expenseCount > 0) {
      return reply.code(400).send({
        success: false,
        message:
          "Cannot delete transaction type that is being used by revenues or expenses",
      });
    }

    await TransactionType.findByIdAndDelete(request.params.id);

    logger.info(
      `Transaction type ${request.params.id} deleted by user ${request.user.id}`,
      {
        action: "deleteTransactionType",
        userId: request.user.id,
        transactionTypeId: request.params.id,
      }
    );

    reply.send({
      success: true,
      message: "Transaction type deleted successfully",
    });
  } catch (error) {
    logger.error(`Delete transaction type error: ${error.message}`);
    reply.code(500).send({ success: false, message: error.message });
  }
};
