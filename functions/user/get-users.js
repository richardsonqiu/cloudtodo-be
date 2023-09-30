'use-strict'
const AWS = require('aws-sdk');

exports.handler = async (event, context, callback) => {
const region = 'ap-southeast-1';
const userPoolId = 'ap-southeast-1_Sh3Bb2vOg';

AWS.config.update({ region: region });

const cognito = new AWS.CognitoIdentityServiceProvider();

const params = {
    UserPoolId: userPoolId,
};

try {
    const data = await cognito.listUsers(params).promise();
    const users = data.Users;

    const usersWithAttributes = users.map((user) => {
    const userAttributes = {};

    user.Attributes.forEach((attribute) => {
        userAttributes[attribute.Name] = attribute.Value;
    });

    return {
        username: user.Username,
        userAttributes: userAttributes,
    };
    });

    const response = {
    statusCode: 200,
    headers: {
        "Access-Control-Allow-Headers": "Authorization,Content-Type",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "OPTIONS,POST,GET,PUT,DELETE"
    },
    body: JSON.stringify(usersWithAttributes)
    };

    callback(null, response);
} catch (err) {
    const errorResponse = {
    statusCode: 500,
    headers: {
        "Access-Control-Allow-Headers": "Authorization,Content-Type",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "OPTIONS,POST,GET,PUT,DELETE"
    },
    body: JSON.stringify({ message: "Error occurred: " + err.message })
    };
    callback(null, errorResponse);
}
};
