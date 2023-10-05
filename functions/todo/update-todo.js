'use strict';

const AWS = require('aws-sdk');

const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports.handler = (event, context, callback) => {
  const timestamp = new Date().toISOString();
  const data = JSON.parse(event.body);
  const taskId = event.pathParameters.taskId;

  const params = {
    TableName: 'Todo',
    Key: {
      id: event.pathParameters.todoId,
      task_id: taskId
    },
    ExpressionAttributeValues: {
      ':title': data.title,
      ':is_done': data.is_done,
      ':due_date': data?.due_date || "",
      ':assign_username': data?.assign_username || "",
      ':assign_email': data?.assign_email || "",
      ':assign_name': data?.assign_name || "",
      ':description': data?.description || "",
      ':priority': data?.priority || "",
      ':tag1': data?.tag1 || "",
      ':tag2': data?.tag2 || "",
      ':tag3': data?.tag3 || "",
      ':updated_date': timestamp
    },
    UpdateExpression: 'SET title = :title, is_done = :is_done, due_date = :due_date, assign_username = :assign_username, assign_email = :assign_email, assign_name = :assign_name, description = :description, priority = :priority, tag1 = :tag1, tag2 = :tag2, tag3 = :tag3, updated_date = :updated_date',
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
        body: 'Couldn\'t fetch the todo item.',
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