'use-strict'
const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  const projectId = event.pathParameters.projectId;
  
  const params = {
    TableName: 'Project',
    Key: {
        id: projectId
    }
  };

  try {
    console.log(`projectId: ${projectId}`);
    
    await dynamoDb.delete(params).promise();
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Headers": "Authorization,Content-Type",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "OPTIONS,POST,GET,PUT,DELETE"
      },
      body: JSON.stringify({ message: 'Project deleted successfully' }),
    };
  } catch (error) {
    console.error('Error deleting project', error);
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
