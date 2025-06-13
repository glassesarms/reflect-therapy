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
