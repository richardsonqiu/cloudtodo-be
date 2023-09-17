'use strict';

const AWS = require('aws-sdk');

const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports.handler = (event, context, callback) => {
  const timestamp = new Date().toISOString();
  const data = JSON.parse(event.body);

  // Project validation
  if (typeof data.name !== 'string') {
    console.error('Validation Project name Failed');
    callback(null, {
      statusCode: 400,
      headers: { 'Content-Type': 'text/plain' },
      body: 'Couldn\'t update the project. There is an error in the project\'s name .',
    });
    return;
  }

  if (typeof data.create_date !== 'datetime') {
    console.error('Validation Project create_date Failed');
    callback(null, {
      statusCode: 400,
      headers: { 'Content-Type': 'text/plain' },
      body: 'Couldn\'t update the project. There is an error in the project\'s create_date .',
    });
    return;
  }

  if (typeof data.members !== 'object') {
    console.error('Validation Project members Failed');
    callback(null, {
      statusCode: 400,
      headers: { 'Content-Type': 'text/plain' },
      body: 'Couldn\'t update the project. There is an error in the project\'s members .',
    });
    return;
  }


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