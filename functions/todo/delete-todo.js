'use-strict'
const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  const todoId = event.pathParameters.todoId;
  const taskId = event.pathParameters.taskId;
  
  const params = {
    TableName: 'Todo',
    Key: {
        id: todoId,
        task_id: taskId
    },
  };

  try {
    console.log(`todoId: ${todoId}`);
    await dynamoDb.delete(params).promise();
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Headers": "Authorization,Content-Type",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "OPTIONS,POST,GET,PUT,DELETE"
      },
      body: JSON.stringify({ message: 'Todo deleted successfully' }),
    };
  } catch (error) {
    console.error('Error deleting todo', error);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Headers": "Authorization,Content-Type",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "OPTIONS,POST,GET,PUT,DELETE"
      },
      body: JSON.stringify({ message: 'Internal server error' }),
    };
  }
};
