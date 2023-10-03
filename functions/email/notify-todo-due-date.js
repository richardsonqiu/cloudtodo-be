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


exports.handler = async (event) => {
    try {
        // Calculate the date for 1 day from now
        const now = new Date();
        const oneDayFromNow = new Date();
        oneDayFromNow.setDate(oneDayFromNow.getDate() + 1);

        const params = {
            TableName: "Todo",
            FilterExpression: "due_date <= :oneDayFromNow AND due_date >= :now AND is_done = notDone",
            ExpressionAttributeValues: {
                ":oneDayFromNow": oneDayFromNow.toISOString(),
                ":now": now.toISOString(),
                ":notDone": false
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
                const todos = todosByRecipient[recipientEmail]
                    .map((todo) => todo.title)
                    .join(", ");
                const message = `Your todos (${todos}) are due in one day.`;

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
