'use strict';

var
Promise = require('./lib/promise'),
U       = require('./lib/u'),
objects = require('./lib/objects'),
path    = require('filepath'),
coffee  = require('coffee-script'),
errors  = require('./lib/errors'),
REQ     = require('./lib/http'),

applicationLoader = require('./lib/application_loader');


exports.Promise = Promise;
exports.U       = U;
exports.objects = objects;
exports.path    = path;
exports.errors  = errors;
exports.REQ     = REQ;


// Register .coffee files with the Node.js module loader.
coffee.register();


exports.load = function (args, callback) {
  args = args || Object.create(null);
  var appdir = null;
  if (args.appdir && args.appdir instanceof path.FilePath) {
    appdir = args.appdir;
  } else if (typeof args.appdir === 'string') {
    appdir = path.create(args.appdir);
  }

  var promise = applicationLoader.load({
    appdir       : appdir || path.create().resolve(process.argv[1]).dirname(),
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
