'use-strict'
const AWS = require('aws-sdk');

const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports.handler = async (event, context, callback) => {
    const keyword = event.queryStringParameters.keyword;
    const projectId = event.pathParameters.projectId;

    try {
        // Step 1: Query the Task table to retrieve tasks for a specific projectId
        const taskQueryParams = {
            TableName: 'Task',
            IndexName: "project_id-create_date-index",
            KeyConditionExpression: "project_id = :projectId",
            ExpressionAttributeValues: {
                ':projectId': projectId,
            },
        };

        const taskQueryResult = await dynamoDb.query(taskQueryParams).promise();
        const taskItems = taskQueryResult.Items;
        console.log(`taskitems: ${taskItems}`);
        // Step 2: Iterate over the Task items and retrieve associated todos
        const tasksWithTodosList = [];
    
        for (const taskItem of taskItems) {
          // Query the Todo table to retrieve associated todos for this task
            const todoParams = {
                TableName: 'Todo',
                IndexName: "task_id-create_date-index",
                KeyConditionExpression: "task_id = :taskId",
                ExpressionAttributeValues: {
                    ":taskId": taskItem.id,
                    ":keyword": keyword,
                    ":project_id": projectId,
                },
                FilterExpression: "contains(title, :keyword) AND project_id = :project_id"
            };

            const todoResult = await dynamoDb.query(todoParams).promise();
            const todoItems = todoResult.Items;
            
            console.log(`todoItems: ${todoItems}`);
            
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
                due_date: todo.due_date || "",
                assign_username: todo.assign_user || "",
                assign_email: todo.assign_email || "",
                assign_name: todo.assign_name || "",
                is_done: todo.is_done,
                description: todo.description || "",
                priority: todo.priority || "",
                tag1: todo.tag1 || "",
                tag2: todo.tag2 || "",
                tag3: todo.tag3 || ""
            })),
            };

            tasksWithTodosList.push(taskWithTodos);
        }

        // Prepare the response with headers
        const response = {
            statusCode: 200,
            headers: {
            "Access-Control-Allow-Headers": "Authorization,Content-Type",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "OPTIONS,POST,GET,PUT,DELETE",
            },
            body: JSON.stringify(tasksWithTodosList),
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
            body: JSON.stringify({ error: `Internal Server Error: ${error}` }),
        };

        callback(null, response);
    }
};



