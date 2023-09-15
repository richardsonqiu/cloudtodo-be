'use-strict'
const uuid = require('uuid');
const AWS = require('aws-sdk');

const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports.handler = (event, context, callback) => {
    const data = JSON.parse(event.body);

    const params = {
        TableName: 'Task',
        ExpressionAttributeValues: {
            ':kw': {S: data.keyword},
            ':i_d': {BOOL: data.is_done},
            ':s_d': {S: data.start_date},
            ':e_d': {S: data.end_date}
        },
        KeyConditionExpression: 'keyword = :kw and is_done = :i_d and start_date >= :s_d and end_date <= :e_d',
    }

    dynamoDb.get(params, (error, result) => {
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