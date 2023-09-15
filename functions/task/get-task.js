'use-strict'
const uuid = require('uuid');
const AWS = require('aws-sdk');

const dynamoDb = new AWS.DynamoDB({apiVersion: '2012-08-10'});

module.exports.handler = (event, context, callback) => {
    // const data = JSON.parse(event.body);

    const params = {
        TableName: 'Task',
        ExpressionAttributeValues: {
            ':id': {S: event.pathParameters.id}
        },
        KeyConditionExpression: 'id = :id',
    }

    dynamoDb.get(params, (error, result) => {
        if (error) {
            console.error(error);
            console.error(event);
            console.error(event.pathParameters);
            callback(null, {
                statusCode: error.statusCode || 501,
                headers: { 'Content-Type': 'text/plain' },
                body: 'Couldn\'t get any tasks.',
              });
              return;
        }
        
        const response = {
            statusCode: 200,
            body: JSON.stringify(result.Item)
        };
        callback(null, response);
    });
};