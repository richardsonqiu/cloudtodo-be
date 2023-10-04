'use-strict'
const uuid = require('uuid');
const AWS = require('aws-sdk');
AWS.config.update({ region: 'ap-southeast-1' }); 

const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports.handler = (event, context, callback) => {
    const create_date = new Date().toISOString();
    const data = JSON.parse(event.body);
    const project_id = event.pathParameters.projectId;

    if (project_id == null || data == null) {
        // console.error("project_id or data received is null");
        callback("project_id or data received is null", {
            statusCode: 501,
            headers: { 'Content-Type': 'text/plain' },
            body: 'project_id or data received is null.',
        });
        return;
    }

    const params = {
        TableName: "Task",
        Item: {
            id: uuid.v4(),
            project_id: project_id,
            title: data.title,
            create_date: create_date,
            is_done: false,
        }
    }

    dynamoDb.put(params, (error) => {
        if (error) {
            console.error(error);
            callback(error, {
                statusCode: error.statusCode || 501,
                headers: { 'Content-Type': 'text/plain' },
                body: 'Couldn\'t create the task.',
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