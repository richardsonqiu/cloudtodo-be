const AWS = require("aws-sdk");

const dynamoDb = new AWS.DynamoDB.DocumentClient();
const ses = new AWS.SES({ region: "ap-southeast-1" });




async function sendEmail(senderEmail, recipientEmail, subject, message) {
    const params = {
        Source: senderEmail,
        Destination: {
            ToAddresses: [recipientEmail],
        },
        Message: {
            Subject: {
                Data: subject,
            },
            Body: {
                Text: {
                    Data: message,
                },
            },
        },
    };
    console.log("Trying to send email ... ");
    console.log(senderEmail, recipientEmail, subject, message);
    try {
        const response = await ses.sendEmail(params).promise();
        console.log("Email sent:", response);
    } catch (error) {
        console.error("Error sending email:", error);
    }
}

function isValidEmail(email) {
    const pattern = /^\S+@\S+\.\S+$/;
    return pattern.test(email);
  }

exports.handler = async (event) => {
    try {
        // Calculate the date for 1 day from now
        // const now = new Date();
        const oneDayFromNow = new Date();
        oneDayFromNow.setDate(oneDayFromNow.getDate() + 1);

        const emptyString = "";
        const notDone = false;

        const params = {
            TableName: "Todo",
            FilterExpression: "due_date <= :oneDayFromNow AND due_date <> :emptyString AND is_done = :notDone",
            ExpressionAttributeValues: {
                ":oneDayFromNow": oneDayFromNow.toISOString(),
                ":emptyString": emptyString,
                ":notDone": notDone
            },
        };

        const result = await dynamoDb.scan(params).promise();
        
        if (result.Items) {
            // Group todos by assigned person's email
            console.log(`result.Items: ${JSON.stringify(result.Items)}`);
            const todosByRecipient = {};

            for (const todo of result.Items) {
                console.log(`todo: ${JSON.stringify(todo)}`);
                const recipientEmail = todo.assign_email;
                console.log(`recipientEmail: ${recipientEmail}`);

                // Initialize 
                if (!todosByRecipient[recipientEmail]) {
                    todosByRecipient[recipientEmail] = [];
                }

                todosByRecipient[recipientEmail].push(todo);
            }

            console.log(`todosByRecipient: ${JSON.stringify(todosByRecipient)}`);

            // Send combined email for each person with their todos
            for (const recipientEmail in todosByRecipient) {
                const senderEmail = "richaws22@gmail.com";
                const subject = "Your todo dues in ONE day - CloudTodo";
                if (recipientEmail == null || !isValidEmail(recipientEmail)) {
                    console.log(`recipientEmail not valid: ${JSON.stringify(recipientEmail)}`);
                    continue;
                } 

                const todos = todosByRecipient[recipientEmail]
                    .map((todo) => todo.title)
                    .join(", ");

                
                    
                // const message = `Your todos (${todos}) are due in one day.`;


                // const htmlMessage = `
                //     <html>
                //     <head>
                //         <style>
                //             table {
                //                 border-collapse: collapse;
                //                 width: 100%;
                //             }

                //             th, td {
                //                 border: 1px solid #dddddd;
                //                 text-align: left;
                //                 padding: 8px;
                //             }

                //             th {
                //                 background-color: #f2f2f2;
                //             }
                //         </style>
                //     </head>
                //     <body>
                //         <h1>Here is a list of your upcoming todos and past todos: </h1>
                //         <table>
                //             <thead>
                //                 <tr>
                //                     <th>Todo Name</th>
                //                     <th>Due Date</th>
                //                 </tr>
                //             </thead>
                //             <tbody>
                //                 ${todosByRecipient[recipientEmail].map(todo => `
                //                     <tr>
                //                         <td>${todo.title}</td>
                //                         <td>${todo.due_date}</td>
                //                     </tr>
                //                 `).join('\n')}
                //             </tbody>
                //         </table>
                //         <h2>You can access your todos from here: <a href="https://02n8au99ji.execute-api.ap-southeast-1.amazonaws.com/Prod">CloudTodo</a></h2>
                //     </body>
                //     </html>
                // `;

                const message = `${todosByRecipient[recipientEmail].map(todo => `
                                ${todo.title}`).join('\r\n')}`

                console.log(`message: ${message}`);

                // Send the email here
                const isSent = await sendEmail(senderEmail, recipientEmail, subject, message);
                if (isSent) {
                    return {
                        statusCode: 200,
                        body: "Emails sent successfully.",
                    };
                }
                
            }
        } 
        return {
            statusCode: 200,
            body: "No todos due within ONE day",
        };
    } catch (error) {
        console.error("Error:", error);
        return {
            statusCode: 500,
            body: "Error sending emails.",
        };
    }
};