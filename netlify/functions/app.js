const serverless = require('serverless-http');
const app = require('../../ConvocationWebApp/server/app');

module.exports.handler = serverless(app);
