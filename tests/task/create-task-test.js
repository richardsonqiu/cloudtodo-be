// 'use-strict';

// const { handler } = require('./handler'); // Import your Lambda function
// const AWS = require('aws-sdk-mock'); // Use aws-sdk-mock to mock AWS DynamoDB
// const { v4: uuidv4 } = require('uuid'); // Import UUID generator

// describe('Lambda Function Tests', () => {
//   // Mock AWS DynamoDB
//   AWS.mock('DynamoDB.DocumentClient', 'put', (params, callback) => {
//     if (params.TableName === 'Task') {
//       callback(null, {});
//     } else {
//       callback(new Error('Invalid TableName'));
//     }
//   });

//   // Define a sample event for testing
//   const sampleEvent = {
//     body: JSON.stringify({
//       title: 'Sample Task',
//       todos: [{ text: 'Todo 1' }, { text: 'Todo 2' }],
//       project_id: 'project123',
//     }),
//   };

//   it('should create a new task', (done) => {
//     handler(sampleEvent, {}, (err, response) => {
//       expect(err).toBeNull();
//       expect(response.statusCode).toBe(200);

//       // Add more assertions here based on your expected response

//       done();
//     });
//   });

//   it('should handle DynamoDB errors', (done) => {
//     // Simulate a DynamoDB error by changing the TableName
//     sampleEvent.body = JSON.stringify({ title: 'Sample Task' });
//     handler(sampleEvent, {}, (err, response) => {
//       expect(err).toBeNull();
//       expect(response.statusCode).toBe(501); // Assuming you set 501 for DynamoDB errors

//       // Add more assertions here based on your expected response

//       done();
//     });
//   });

//   // Cleanup AWS DynamoDB mocking after all tests
//   afterAll(() => {
//     AWS.restore('DynamoDB.DocumentClient');
//   });
// });
