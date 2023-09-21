'use-strict'
const uuid = require('uuid');
const AWS = require('aws-sdk');

const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports.handler = (event, context, callback) => {
    const params = {
        TableName: 'Project',
        Key: {
            id: event.pathParameters.projectId
        }
    }

    dynamoDb.get(params, (error, result) => {
        if (error) {
            console.error(error);
            console.log(event);
            callback(null, {
                statusCode: error.statusCode || 501,
                headers: { 'Content-Type': 'text/plain' },
                body: 'Couldn\'t get the specific project.',
              });
              return;
        }
        console.log(result);
        const response = {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Headers" : "Authorization,Content-Type",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "OPTIONS,POST,GET,PUT,DELETE"
            },
            body: JSON.stringify(result.Item)
        };
        callback(null, response);
    });
};