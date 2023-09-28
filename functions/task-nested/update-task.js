'use strict';

const AWS = require('aws-sdk');

const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports.handler = (event, context, callback) => {
  const timestamp = new Date().toISOString();
  const data = JSON.parse(event.body);

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