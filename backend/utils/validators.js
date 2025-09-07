const mongoose = require("mongoose");

exports.validateObjectId = (id, label = "ID") => {
  const trimmed = (id || "").trim();
  if (!mongoose.Types.ObjectId.isValid(trimmed)) {
    const error = new Error(`Invalid ${label}`);
    error.statusCode = 400;
    throw error;
  }
  return trimmed;
};
