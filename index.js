'use strict';

var
Promise  = require('./lib/promise'),
U        = require('./lib/u'),
objects  = require('./lib/objects'),
filepath = require('filepath'),
errors   = require('./lib/errors'),
REQ      = require('./lib/http'),

applicationLoader = require('./lib/application_loader');


exports.Promise  = Promise;
exports.U        = U;
exports.objects  = objects;
exports.filepath = filepath;
exports.errors   = errors;
exports.REQ      = REQ;


exports.load = function (args, callback) {
  args = args || Object.create(null);

  var promise = applicationLoader.load({
    appdir       : args.appdir || filepath.create().resolve(process.argv[1]).dirname(),
    name         : args.name,
    version      : args.version,
    usageString  : args.usageString,
    helpString   : args.helpString,
    options      : args.options,
    environment  : args.environment,
    initializers : args.initializers
  });

  if (typeof callback === 'function') {
    return promise.then(callback);
  }
  return promise;
};
