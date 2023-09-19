'use-strict'
const uuid = require('uuid');
const AWS = require('aws-sdk');

const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports.handler = (event, context, callback) => {
    const data = JSON.parse(event.body);

    const params = {
        TableName: 'Task',
        ExpressionAttributeValues: {
            ":keyword": {S: data.keyword}
        },
        ExpressionAttributeNames: {
            ":todo_title": "todos[0].title",
            ":title": "title"
        },
        FilterExpression: "contains (todo_title, :keyword) or (title, :keyword)"
    }

    dynamoDb.scan(params, (error, result) => {
        if (error) {
            console.error(error);
            callback(null, {
                statusCode: error.statusCode || 501,
                headers: { 'Content-Type': 'text/plain' },
                body: 'Couldn\'t get any tasks.',
              });
              return;
        }
        
        const items = data.Items;
        if (items && items.length > 0)
            items.forEach((item) => console.log(item));
        else 
            console.log("No matching task or todo found.");   
             
        const response = {
            statusCode: 200,
            body: JSON.stringify(result.Items)
        };
        callback(null, response);
    });
};