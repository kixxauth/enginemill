'use strict';

var
U       = require('./u'),
objects = require('./objects'),
logger  = require('./logger'),
debug   = require('debug');


exports.create = objects.factory({

  // spec.name
  // spec.version
  // spec.appdir
  // spec.packageJSON
  // spec.environment
  // spec.argv
  initialize: function (spec) {
    Object.defineProperties(this, {
      name: {
        enumerable: true,
        value: spec.name
      },
      version: {
        enumerable: true,
        value: spec.version
      },
      appdir: {
        enumerable: true,
        value: spec.appdir
      },
      packageJSON: {
        enumerable: true,
        value: spec.packageJSON ? U.deepFreeze(spec.packageJSON) : null
      },
      environment: {
        enumerable: true,
        value: spec.environment
      },
      configs: {
        enumerable: true,
        value: Object.create(null)
      },
      argv: {
        enumerable: true,
        value: U.deepFreeze(spec.argv)
      },
      logger: {
        enumerable: true,
        value: logger.createLogger({
          appname: spec.name
        })
      },
      debug: {
        enumerable: true,
        value: function (name) {
          return debug(spec.name + ':' + name);
        }
      },
      API: {
        enumerable: true,
        value: Object.create(null)
      }
    });
  }
});
