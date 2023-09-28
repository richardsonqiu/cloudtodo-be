'use-strict'
const uuid = require('uuid');
const AWS = require('aws-sdk');

const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports.handler = (event, context, callback) => {
    const create_date = new Date().toISOString();
    const data = JSON.parse(event.body);
    const project_id = event.pathParameters.projectId;
    const task_id = event.pathParameters.taskId;

    const params = {
        TableName: "Todo",
        Item: {
            id: uuid.v4(),
            project_id: project_id,
            task_id: task_id,
            title: data?.title,
            create_date: create_date,
            is_done: false,
            due_date: data?.due_date || new Date(new Date().getTime() + 7 * 24 * 3600 * 1000),
            assign_username: data?.assign_username || null,
            assign_email: data?.assign_email || null,
            assign_name: data?.assign_name || null,
            description: data?.description || null,
            priority: data?.priority || null,
            tag1: data?.tag1 || null,
            tag2: data?.tag2 || null,
            tag3: data?.tag3 || null
        }
    }

    dynamoDb.put(params, (error) => {
        if (error) {
            console.error(error);
            callback(null, {
                statusCode: error.statusCode || 501,
                headers: { 'Content-Type': 'text/plain' },
                body: 'Couldn\'t create the todo.',
              });
              return;
        }
        
        const response = {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Headers" : "Authorization,Content-Type",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "OPTIONS,POST,GET,PUT,DELETE"
            },
            body: JSON.stringify(params.Item)
        };
        callback(null, response);
    });
};