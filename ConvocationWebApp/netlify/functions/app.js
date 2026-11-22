const serverless = require('serverless-http');
let app;
try {
  app = require('../../server/app');
} catch (e) {
  try {
    app = require('../server/app');
  } catch (e2) {
    app = require('../../ConvocationWebApp/server/app');
  }
}

module.exports.handler = serverless(app);

