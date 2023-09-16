'use-strict'
const uuid = require('uuid');
const AWS = require('aws-sdk');

const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports.handler = (event, context, callback) => {
    const data = JSON.parse(event.body);

    const params = {
        TableName: 'Task',
        ExpressionAttributeValues: {
            ":keyword": {S: data.keyword},
            ":is_done": {BOOL: data.is_done},
            ":start_date": {S: data.start_date},
            ":end_date": {S: data.end_date}
        },
        FilterExpression: "contains (title, :keyword)",
        KeyConditionExpression: "is_done = :is_done and start_date >= :start_date and end_date <= :end_date",
    }

    dynamoDb.query(params, (error, result) => {
        if (error) {
            console.error(error);
            callback(null, {
                statusCode: error.statusCode || 501,
                headers: { 'Content-Type': 'text/plain' },
                body: 'Couldn\'t get any tasks.',
              });
              return;
        }
        
        const response = {
            statusCode: 200,
            body: JSON.stringify(result.Items)
        };
        callback(null, response);
    });
};