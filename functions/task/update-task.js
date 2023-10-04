'use strict';

const AWS = require('aws-sdk');
AWS.config.update({ region: 'ap-southeast-1' }); 

const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports.handler = (event, context, callback) => {
  const timestamp = new Date().toISOString();
  const data = JSON.parse(event.body);

  const params = {
    TableName: 'Task',
    Key: {
      id: event.pathParameters.taskId
    },
    ExpressionAttributeValues: {
      ':title': data.title,
      ':is_done': data.is_done,
      ':updated_date': timestamp
    },
    UpdateExpression: 'SET title = :title, is_done = :is_done, updated_date = :updated_date',
    ReturnValues: 'ALL_NEW',
  };

  // update the todo in the database
  dynamoDb.update(params, (error, result) => {
    // handle potential errors
    if (error) {
      console.error(error);
      callback(null, {
        statusCode: error.statusCode || 501,
        headers: { 'Content-Type': 'text/plain' },
        body: 'Couldn\'t fetch the task item.',
      });
      return;
    }

    // create a response
    const response = {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Headers" : "Authorization,Content-Type",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "OPTIONS,POST,GET,PUT,DELETE"
      },
      body: JSON.stringify(result.Attributes),
    };
    callback(null, response);
  });
};