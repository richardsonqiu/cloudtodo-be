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
        const oneDayFromNow = new Date();
        oneDayFromNow.setDate(oneDayFromNow.getDate() + 1);

        const params = {
            TableName: "Todo",
            FilterExpression: "due_date <= :oneDayFromNow",
            ExpressionAttributeValues: {
                ":oneDayFromNow": oneDayFromNow.toISOString(),
            },
        };

        const result = await dynamoDb.scan(params).promise();
        
        if (result.Items) {
            // Group todos by assigned person's email
            const todosByRecipient = {};

            for (const todo of result.Items) {
                console.log(`todo: ${todo}`);
                const recipientEmail = todo.assign_email;

                // Initialize 
                if (!todosByRecipient[recipientEmail]) {
                    todosByRecipient[recipientEmail] = [];
                }

                todosByRecipient[recipientEmail].push(todo);
            }

            // Send combined email for each person with their todos
            for (const recipientEmail in todosByRecipient) {
                const senderEmail = "richaws22@gmail.com";
                const subject = "Your todo dues in ONE day - CloudTodo";
                const todos = todosByRecipient[recipientEmail]
                    .map((todo) => todo.title)
                    .join(", ");
                const message = `Your todos (${todos}) are due in one day.`;

                // Send the email here
                await sendEmail(senderEmail, recipientEmail, subject, message);
            }
        }

        return {
            statusCode: 200,
            body: "Emails sent successfully.",
        };
    } catch (error) {
        console.error("Error:", error);
        return {
            statusCode: 500,
            body: "Error sending emails.",
        };
    }
};
