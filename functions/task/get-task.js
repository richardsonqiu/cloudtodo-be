'use-strict'
const uuid = require('uuid');
const AWS = require('aws-sdk');

const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports.handler = (event, context, callback) => {
    // const data = JSON.parse(event.body);

    const params = {
        TableName: 'Task',
        Key: {
            id: event.pathParameters.taskId
        }
    }

    dynamoDb.get(params, (error, result) => {
        if (error) {
            console.error(error);
            console.error(event);
            console.error(event.pathParameters);
            callback(null, {
                statusCode: error.statusCode || 501,
                headers: { 'Content-Type': 'text/plain' },
                body: 'Couldn\'t get the specific task.',
              });
              return;
        }
        console.log(result);
        const response = {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Headers" : "Authorization,Content-Type",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
            },
            body: JSON.stringify(result.Item)
        };
        callback(null, response);
    });
};