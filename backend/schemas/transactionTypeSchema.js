module.exports = {
  $id: "transactionType",
  type: "object",
  properties: {
    _id: { type: "string" },
    name: { type: "string" },
    category: { type: "string", enum: ["revenue", "expense"] },
    description: { type: "string" },
    isActive: { type: "boolean" },
    createdBy: {
      type: "object",
      properties: {
        _id: { type: "string" },
        userId: { type: "string" },
        firstName: { type: "string" },
        lastName: { type: "string" }
      }
    },
    createdAt: { type: "string", format: "date-time" },
    updatedAt: { type: "string", format: "date-time" }
  }
};
