'use strict';

const AWS = require('aws-sdk');

const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports.handler = (event, context, callback) => {
  const timestamp = new Date().toISOString();
  const data = JSON.parse(event.body);

  // Task validation
  if (typeof data.project_id !== 'string') {
    console.error('Validation Task project_id Failed');
    callback(null, {
      statusCode: 400,
      headers: { 'Content-Type': 'text/plain' },
      body: 'Couldn\'t update the task item. There is an error in the task\'s project id .',
    });
    return;
  }

  if (typeof data.title !== 'string') {
    console.error('Validation Task\'s title Failed');
    callback(null, {
      statusCode: 400,
      headers: { 'Content-Type': 'text/plain' },
      body: 'Couldn\'t update the task item. There is an error in the task\'s title .',
    });
    return;
  }

  if (typeof data.create_date !== 'datetime') {
    console.error('Validation Task\'s create_date Failed');
    callback(null, {
      statusCode: 400,
      headers: { 'Content-Type': 'text/plain' },
      body: 'Couldn\'t update the task item. There is an error in the task\'s create_date .',
    });
    return;
  }

  if (typeof data.is_done !== 'boolean') {
    console.error('Validation Task\'s is_done Failed');
    callback(null, {
      statusCode: 400,
      headers: { 'Content-Type': 'text/plain' },
      body: 'Couldn\'t update the task item. There is an error in the task\'s is_done .',
    });
    return;
  }

  if (typeof data.todos !== 'object') {
    console.error('Validation Task\'s todos Failed');
    callback(null, {
      statusCode: 400,
      headers: { 'Content-Type': 'text/plain' },
      body: 'Couldn\'t update the task item. There is an error in the task\'s todos .',
    });
    return;
  }

  // TODO: update task's is_done to true if all todos' is_done are true


  const params = {
    TableName: 'Task',
    Key: {
      id: event.pathParameters.taskId,
      project_id: event.pathParameters.projectId,
    },
    ExpressionAttributeValues: {
      ':project_id': data.project_id,
      ':title': data.title,
      ':create_date': data.create_date,
      ':is_done': data.is_done,
      ':todos': data.todos,
      ':updated_date': timestamp,
    },
    UpdateExpression: 'SET project_id = :project_id, title = :title, create_date = :create_date, is_done = :is_done, todos = :todos, updated_date = :updated_date',
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
      body: JSON.stringify(result.Attributes),
    };
    callback(null, response);
  });
};