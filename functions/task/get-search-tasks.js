'use-strict'
const uuid = require('uuid');
const AWS = require('aws-sdk');

const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports.handler = (event, context, callback) => {
    const keyword = event.queryStringParameters.keyword;
    const projectId = event.pathParameters.projectId;

    console.log("keyword: " + keyword);
    console.log("project id: " + projectId);

    const params = {
        TableName: 'Task',
        ExpressionAttributeValues: {
            ":keyword": {S: keyword},
            ":project_id": {S: projectId}
        },
        FilterExpression: "contains(title, :keyword) AND project_id = :project_id"
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
        console.log("Before todo filtering: " + tasks);
        tasks.forEach((task) => {
            if (task.todos && Array.isArray(task.todos)) {
                console.log("current todos: " + task.todos);
                task.todos = task.todos.filter((todo) => todo.title.includes(keyword))
                console.log("updated todos: ", task.todos);
            }
        })

        console.log("After todo filtering: " + tasks);
        const response = {
            statusCode: 200,
            body: JSON.stringify(tasks)
        };
        callback(null, response);
    });
};