// Postman Collection Generator for Church Management System - Final Version
const collection = {
  info: {
    name: 'Church Management System API - Final',
    description: 'Complete API collection for Church Management System - Running on port 4000',
    schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
  },
  variable: [
    {
      key: 'base_url',
      value: 'http://localhost:4000',
      type: 'string'
    },
    {
      key: 'auth_token',
      value: '',
      type: 'string'
    }
  ],
  item: [
    {
      name: '📋 Health Check',
      item: [
        {
          name: 'Health Check',
          request: {
            method: 'GET',
            url: {
              raw: '{{base_url}}/health',
              host: ['{{base_url}}'],
              path: ['health']
            }
          }
        }
      ]
    },
    {
      name: '🔐 Authentication',
      item: [
        {
          name: 'Login User',
          event: [
            {
              listen: 'test',
              script: {
                exec: [
                  'pm.test("Status code is 200", function () {',
                  '    pm.response.to.have.status(200);',
                  '});',
                  'pm.test("Response has auth token", function () {',
                  '    var jsonData = pm.response.json();',
                  '    pm.expect(jsonData.success).to.eql(true);',
                  '    pm.expect(jsonData.token).to.be.a("string");',
                  '    pm.collectionVariables.set("auth_token", jsonData.token);',
                  '});'
                ]
              }
            }
          ],
          request: {
            method: 'POST',
            header: [
              {
                key: 'Content-Type',
                value: 'application/json'
              }
            ],
            body: {
              mode: 'raw',
              raw: JSON.stringify({
                email: 'admin@church.org',
                password: 'admin123'
              }, null, 2)
            },
            url: {
              raw: '{{base_url}}/api/v1/auth/login',
              host: ['{{base_url}}'],
              path: ['api', 'v1', 'auth', 'login']
            }
          }
        }
      ]
    },
    {
      name: '👥 Users',
      item: [
        {
          name: 'Get All Users',
          request: {
            method: 'GET',
            header: [
              {
                key: 'Authorization',
                value: 'Bearer {{auth_token}}'
              }
            ],
            url: {
              raw: '{{base_url}}/api/v1/users',
              host: ['{{base_url}}'],
              path: ['api', 'v1', 'users']
            }
          }
        },
        {
          name: 'Create New User',
          request: {
            method: 'POST',
            header: [
              {
                key: 'Authorization',
                value: 'Bearer {{auth_token}}'
              },
              {
                key: 'Content-Type',
                value: 'application/json'
              }
            ],
            body: {
              mode: 'raw',
              raw: JSON.stringify({
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@example.com',
                password: 'password123',
                role: 'member'
              }, null, 2)
            },
            url: {
              raw: '{{base_url}}/api/v1/users',
              host: ['{{base_url}}'],
              path: ['api', 'v1', 'users']
            }
          }
        }
      ]
    },
    {
      name: '💰 Revenues',
      item: [
        {
          name: 'Get All Revenues',
          request: {
            method: 'GET',
            header: [
              {
                key: 'Authorization',
                value: 'Bearer {{auth_token}}'
              }
            ],
            url: {
              raw: '{{base_url}}/api/v1/revenues',
              host: ['{{base_url}}'],
              path: ['api', 'v1', 'revenues']
            }
          }
        }
      ]
    },
    {
      name: '💸 Expenses',
      item: [
        {
          name: 'Get All Expenses',
          request: {
            method: 'GET',
            header: [
              {
                key: 'Authorization',
                value: 'Bearer {{auth_token}}'
              }
            ],
            url: {
              raw: '{{base_url}}/api/v1/expenses',
              host: ['{{base_url}}'],
              path: ['api', 'v1', 'expenses']
            }
          }
        }
      ]
    },
    {
      name: '🏷️ Transaction Types',
      item: [
        {
          name: 'Get All Transaction Types',
          request: {
            method: 'GET',
            header: [
              {
                key: 'Authorization',
                value: 'Bearer {{auth_token}}'
              }
            ],
            url: {
              raw: '{{base_url}}/api/v1/transaction-types',
              host: ['{{base_url}}'],
              path: ['api', 'v1', 'transaction-types']
            }
          }
        }
      ]
    },
    {
      name: '📊 Reports',
      item: [
        {
          name: 'Generate Financial Report (JSON)',
          request: {
            method: 'GET',
            header: [
              {
                key: 'Authorization',
                value: 'Bearer {{auth_token}}'
              }
            ],
            url: {
              raw: '{{base_url}}/api/v1/reports/financial?format=json',
              host: ['{{base_url}}'],
              path: ['api', 'v1', 'reports', 'financial'],
              query: [
                {
                  key: 'format',
                  value: 'json'
                }
              ]
            }
          }
        }
      ]
    }
  ]
};

// Save to file
const fs = require('fs');
fs.writeFileSync('church_management_system_final.postman_collection.json', JSON.stringify(collection, null, 2));
console.log('✅ Postman collection generated: church_management_system_final.postman_collection.json');
console.log('📋 Import this file into Postman to test the API');
console.log('🌐 Server is running on: http://localhost:4000');
console.log('📚 API Documentation: http://localhost:4000/docs');