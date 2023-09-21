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
            ":keyword": keyword,
            ":project_id": projectId
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

        const response = {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Headers" : "Authorization,Content-Type",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
            },
            body: JSON.stringify(result.Items)
        };
        callback(null, response);
    });
};