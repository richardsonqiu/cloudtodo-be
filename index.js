'use strict';

const cloudToDoServerlessExpress = require('aws-serverless-express')
const app = require('./app')
const server = cloudToDoServerlessExpress.createServer(app)

exports.handler = (event, context) => cloudToDoServerlessExpress.proxy(server, event, context);
