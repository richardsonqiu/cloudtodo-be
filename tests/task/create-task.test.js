'use-strict';

const { handler } = require('../../functions/task/create-task');
const AWS = require('aws-sdk-mock');


describe('Create Task Tests', () => {
  beforeAll(() => {
    // Mock the DynamoDB put method
    AWS.mock('DynamoDB.DocumentClient', 'put', (params, callback) => {
      // Simulate a successful DynamoDB put operation
      callback(null, {});
    });
  });

  afterAll(() => {
    // Restore the original DynamoDB put method
    AWS.restore('DynamoDB.DocumentClient');
  });

  it('should create a task', (done) => {
    const event = {
      body: JSON.stringify({ title: 'Sample Task' }),
      pathParameters: { projectId: '123' },
    };

    handler(event, {}, (error, response) => {
      expect(error).toBeNull();
      expect(response.statusCode).toBe(200);
      // You can add more assertions here to verify the response
      done();
    });
  });

  it('should handle DynamoDB errors', (done) => {
    // Mock an error response
    AWS.mock('DynamoDB.DocumentClient', 'put', (params, callback) => {
      callback(new Error('Mocked DynamoDB error'));
    });

    const event = {
      body: JSON.stringify({ title: 'Sample Task' }),
      pathParameters: { projectId: null },
    };

    handler(event, {}, (error, response) => {
      expect(error).not.toBeNull();
      expect(response.statusCode).toBe(501);
    });
    done();

  });
});