'use-strict'
const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports.handler = async (event, context, callback) => {
    const taskId = event.pathParameters.taskId;

    try {
        // Step 1: Query the Task table to retrieve a specific task by taskId
        const taskQueryParams = {
            TableName: 'Task',
            KeyConditionExpression: 'id = :taskId',
            ExpressionAttributeValues: {
                ':taskId': taskId,
            },
        };

        const taskQueryResult = await dynamoDb.query(taskQueryParams).promise();
        const taskItem = taskQueryResult.Items[0];

        if (!taskItem) {
            // Handle the case where the task with the provided ID does not exist
            const response = {
                statusCode: 404,
                headers: {
                    "Access-Control-Allow-Headers": "Authorization,Content-Type",
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "OPTIONS,POST,GET,PUT,DELETE",
                },
                body: JSON.stringify({ error: "Task not found" }),
            };
            callback(null, response);
            return;
        }

        // Step 2: Query the Todo table to retrieve associated todos for the task
        const todoParams = {
            TableName: 'Todo',
            FilterExpression: 'task_id = :taskId',
            ExpressionAttributeValues: {
                ':taskId': taskId,
            },
        };

        const todoResult = await dynamoDb.query(todoParams).promise();
        const todoItems = todoResult.Items;

        // Combine the data and add it to the result
        const taskWithTodos = {
            id: taskItem.id,
            project_id: taskItem.project_id,
            title: taskItem.title,
            create_date: taskItem.create_date,
            is_done: taskItem.is_done,
            todos: todoItems.map((todo) => ({
                id: todo.id,
                title: todo.title,
                create_date: todo.create_date,
                due_date: todo.due_date || null,
                assign_username: todo.assign_user || null,
                assign_email: todo.assign_email || null,
                assign_name: todo.assign_name || null,
                is_done: todo.is_done,
                description: todo.description || null,
                priority: todo.priority || null,
                tag1: todo.tag1 || null,
                tag2: todo.tag2 || null,
                tag3: todo.tag3 || null
            })),
        };

        // Prepare the response with headers
        const response = {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Headers": "Authorization,Content-Type",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "OPTIONS,POST,GET,PUT,DELETE",
            },
            body: JSON.stringify(taskWithTodos),
        };

        callback(null, response);
    } catch (error) {
        // Handle any errors here and return an appropriate response
        const response = {
            statusCode: 500,
            headers: {
                "Access-Control-Allow-Headers": "Authorization,Content-Type",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "OPTIONS,POST,GET,PUT,DELETE",
            },
            body: JSON.stringify({ error: "Internal Server Error" }),
        };

        callback(null, response);
    }
}
