'use-strict'
const uuid = require('uuid');
const AWS = require('aws-sdk');

const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports.handler = (event, context, callback) => {
    const create_date = new Date().toISOString();
    const data = JSON.parse(event.body);

    // Task and Todo 
    const todos = data.todos;
    console.log(todos);
    if (todos && Array.isArray(todos)) {
        todos.forEach((todo) => {
            console.log("todo " + todo);
            if (!todo.id)
                todo.id = uuid.v4();

            if (!todo.create_date)
                todo.create_date = create_date;
        })
    }

    const params = {
        TableName: "Task",
        Item: {
            id: uuid.v4(),
            title: data?.title || null,
            create_date: create_date,
            is_done: false,
            todos: todos || null,
            project_id: data?.project_id || null
        }
    }

    dynamoDb.put(params, (error) => {
        if (error) {
            console.error(error);
            callback(null, {
                statusCode: error.statusCode || 501,
                headers: { 'Content-Type': 'text/plain' },
                body: 'Couldn\'t create the task.',
              });
              return;
        }
        
        const response = {
            statusCode: 200,
            body: JSON.stringify(params.Item)
        };
        callback(null, response);
    });
};