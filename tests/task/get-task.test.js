const AWS = require('aws-sdk-mock');
const { handler } = require('../../functions/task/get-task'); // Replace with the correct path to your Lambda function file

describe('Get Task Tests', () => {
  beforeAll(() => {
    // Mock the DynamoDB get method
    AWS.mock('DynamoDB.DocumentClient', 'get', (params, callback) => {
      // Simulate a successful DynamoDB get operation
      callback(null, { Item: { /* Your DynamoDB item data here */ } });
    });
  });

  afterAll(() => {
    // Restore the original DynamoDB get method
    AWS.restore('DynamoDB.DocumentClient');
  });

  it('should get a task', (done) => {
    const event = {
      pathParameters: { taskId: '123' }, 
    };

    handler(event, {}, (error, response) => {
      expect(error).toBeNull();
      expect(response.statusCode).toBe(200);
      done();
    });
  });

  it('should handle DynamoDB errors', (done) => {
    // Mock an error response
    AWS.mock('DynamoDB.DocumentClient', 'get', (params, callback) => {
      callback(new Error('Mocked DynamoDB error'));
    });

    const event = {
      pathParameters: { taskId: null },
    };

    handler(event, {}, (error, response) => {
      expect(error).not.toBeNull();
      expect(response.statusCode).toBe(501);
    });
    done();

  });
});
