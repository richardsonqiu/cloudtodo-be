'use-strict'
const uuid = require('uuid');
const AWS = require('aws-sdk');

const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports.handler = (event, context, callback) => {
    const keyword = event.pathParameters.keyword;

    const params = {
        TableName: 'Task',
        ExpressionAttributeValues: {
            ":keyword": {S: keyword}
        },
        ExpressionAttributeNames: {
            ":title": "title"
        },
        FilterExpression: "contains (title, :keyword)"
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
        
        const tasks = result.Items;
        tasks.forEach((task) => {
            if (task.todos && Array.isArray(task.todos)) {
                task.todos = task.todos.filter((todo) => todo.title.includes(keyword))
            }
        })

        const response = {
            statusCode: 200,
            body: JSON.stringify(tasks)
        };
        callback(null, response);
    });
};