'use-strict'
const AWS = require('aws-sdk');
AWS.config.update({ region: 'ap-southeast-1' }); 

const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports.handler = (event, context, callback) => {
    const params = {
        TableName: 'Task',
        Key: {
            id: event.pathParameters.taskId
        }
    }

    if (event.pathParameters.taskId == null) {
        // console.error(`id in pathParameters is null`);
        callback('id in pathParameters is null', {
            statusCode: 501,
            headers: { 'Content-Type': 'text/plain' },
            body: 'Couldn\'t get the specific task.',
        });
        return;
    }

    dynamoDb.get(params, (error, result) => {
        if (error) {
            console.error(error);
            console.error(event);
            console.error(event.pathParameters);
            callback(error, {
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
                "Access-Control-Allow-Methods": "OPTIONS,POST,GET,PUT,DELETE"
            },
            body: JSON.stringify(result.Item)
        };
        callback(null, response);
    });
};