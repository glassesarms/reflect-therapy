const Module = require('module');
const path = require('path');
const originalResolve = Module._resolveFilename;
Module._resolveFilename = function(request, parent, isMain, options) {
  if (request === 'next/server') {
    return path.join(__dirname, 'stubs', 'next-server.js');
  }
  if (request === '@aws-sdk/client-chime-sdk-meetings') {
    return path.join(__dirname, 'stubs', 'chime.js');
  }
  return originalResolve.call(this, request, parent, isMain, options);
};

process.env.NODE_ENV = 'test';
process.env.EMAIL_FROM = 'test@example.com';
process.env.TZ = 'UTC';
