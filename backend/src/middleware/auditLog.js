// middleware/auditLog.js
const AuditLog = require('../models/AuditLog');

const auditLog = async (req, reply, payload) => {
  // Skip for GET requests or if no user is authenticated
  if (req.method === 'GET' || !req.user) return;
  
  try {
    let action = 'UPDATE';
    let resource = 'Unknown';
    
    // Determine action based on HTTP method
    switch (req.method) {
      case 'POST':
        action = 'CREATE';
        break;
      case 'PUT':
      case 'PATCH':
        action = 'UPDATE';
        break;
      case 'DELETE':
        action = 'DELETE';
        break;
    }
    
    // Determine resource from URL
    if (req.url.includes('/users')) resource = 'User';
    else if (req.url.includes('/revenues')) resource = 'Revenue';
    else if (req.url.includes('/expenses')) resource = 'Expense';
    else if (req.url.includes('/auth')) resource = 'Auth';
    
    const logData = {
      action,
      resource,
      resourceId: req.params.id || null,
      changes: req.body,
      performedBy: req.user._id
    };
    
    await AuditLog.create(logData);
  } catch (error) {
    console.error('Audit log error:', error);
  }
};

module.exports = auditLog;