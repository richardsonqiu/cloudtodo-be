'use strict';

const AWS = require('aws-sdk');

const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports.handler = (event, context, callback) => {
  const timestamp = new Date().toISOString();
  const data = JSON.parse(event.body);

  const params = {
    TableName: 'Project',
    Key: {
      project_id: event.pathParameters.projectId,
    },
    ExpressionAttributeValues: {
      ':title': data.title,
      ':create_date': data.create_date,
      ':members': data.members,
      ':updated_date': timestamp,
    },
    UpdateExpression: 'SET title = :title, create_date = :create_date, members = :members, updated_date = :updated_date',
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
        body: 'Couldn\'t fetch the project.',
      });
      return;
    }

    // create a response
    const response = {
      statusCode: 200,
      body: JSON.stringify(result.Attributes),
    };
    callback(null, response);
  });
};