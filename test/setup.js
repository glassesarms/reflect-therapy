const Module = require('module');
const path = require('path');
const originalResolve = Module._resolveFilename;
Module._resolveFilename = function(request, parent, isMain, options) {
  if (request === 'next/server') {
    return path.join(__dirname, 'stubs', 'next-server.js');
  }
  if (request === 'twilio') {
    return path.join(__dirname, 'stubs', 'twilio.js');
  }
  return originalResolve.call(this, request, parent, isMain, options);
};

process.env.NODE_ENV = 'test';
process.env.TWILIO_ACCOUNT_SID = 'test';
process.env.TWILIO_AUTH_TOKEN = 'test';
process.env.TWILIO_API_KEY = 'test';
process.env.TWILIO_API_SECRET = 'test';
process.env.TZ = 'UTC';
