'use strict';

var
U       = require('./u'),
objects = require('./objects');


exports.createApplication = objects.factory({

  // spec.name
  // spec.version
  // spec.appdir
  // spec.sysconfigsdir
  // spec.environment
  // spec.packageJSON
  // spec.configs
  initialize: function (spec) {
    Object.defineProperties({
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
        value: spec.appdir.toString()
      },
      sysconfigsdir: {
        enumerable: true,
        value: spec.sysconfigsdir.toString()
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
      }
    });
  }

});
