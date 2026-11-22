const serverless = require('serverless-http');
let app;
try {
  app = require('../../ConvocationWebApp/server/app');
} catch (e) {
  try {
    app = require('../ConvocationWebApp/server/app');
  } catch (e2) {
    app = require('../../server/app');
  }
}

module.exports.handler = serverless(app);

