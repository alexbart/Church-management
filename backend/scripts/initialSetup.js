const mongoose = require("mongoose");
const User = require("../models/User");
const TransactionType = require("../models/TransactionType");
const { generateUserId } = require("../services/numberSeriesService");
require("dotenv").config();

async function initialSetup() {
  try {
    // Connect to MongoDB
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/church_db"
    );
    console.log("Connected to MongoDB");

    // Check if admin user already exists
    const adminExists = await User.findOne({ email: "admin@church.org" });
    if (adminExists) {
      console.log("Admin user already exists");
      process.exit(0);
    }

    // Create admin user
    const userId = await generateUserId();
    const adminUser = new User({
      userId,
      firstName: "System",
      lastName: "Administrator",
      email: "admin@church.org",
      password: "admin123", // Change this in production!
      role: "admin",
    });

    await adminUser.save();
    console.log("Admin user created successfully");
    console.log("Email: admin@church.org");
    console.log("Password: admin123");
    console.log("Please change the password after first login!");

    // Create default transaction types
    const defaultRevenueTypes = [
      {
        name: "Tithe",
        category: "revenue",
        description: "Regular tithe contributions",
      },
      {
        name: "Offering",
        category: "revenue",
        description: "General offerings",
      },
      {
        name: "Donation",
        category: "revenue",
        description: "Special donations",
      },
      {
        name: "Building Fund",
        category: "revenue",
        description: "Building fund contributions",
      },
      {
        name: "Mission Fund",
        category: "revenue",
        description: "Mission fund contributions",
      },
    ];

    const defaultExpenseTypes = [
      {
        name: "Salaries",
        category: "expense",
        description: "Staff salaries and benefits",
      },
      {
        name: "Utilities",
        category: "expense",
        description: "Electricity, water, internet, etc.",
      },
      {
        name: "Maintenance",
        category: "expense",
        description: "Building and equipment maintenance",
      },
      {
        name: "Supplies",
        category: "expense",
        description: "Office and worship supplies",
      },
      {
        name: "Outreach",
        category: "expense",
        description: "Mission and outreach programs",
      },
      {
        name: "Events",
        category: "expense",
        description: "Church events and activities",
      },
    ];

    for (const typeData of defaultRevenueTypes) {
      const type = new TransactionType({
        ...typeData,
        createdBy: adminUser._id,
      });
      await type.save();
    }

    for (const typeData of defaultExpenseTypes) {
      const type = new TransactionType({
        ...typeData,
        createdBy: adminUser._id,
      });
      await type.save();
    }

    console.log("Default transaction types created successfully");

    process.exit(0);
  } catch (error) {
    console.error("Initial setup error:", error);
    process.exit(1);
  }
}

initialSetup();
