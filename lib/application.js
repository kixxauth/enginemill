'use strict';

var
U       = require('./u'),
objects = require('./objects');


exports.create = objects.factory({

  // spec.name
  // spec.version
  // spec.appdir
  // spec.sysconfigsdir
  // spec.environment
  // spec.packageJSON
  // spec.configs
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
      sysconfigsdir: {
        enumerable: true,
        value: spec.sysconfigsdir
      },
      packageJSON: {
        enumerable: true,
        value: U.deepFreeze(spec.packageJSON)
      },
      environment: {
        enumerable: true,
        value: spec.environment
      },
      configs: {
        enumerable: true,
        value: U.deepFreeze(spec.configs)
      },
      argv: {
        enumerable: true,
        value: U.deepFreeze(spec.argv)
      },
      API: {
        enumerable: true,
        value: Object.create(null)
      }
    });
  }
});
