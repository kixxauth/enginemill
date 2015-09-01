'use strict';

var
U       = require('./u'),
objects = require('./objects'),
errors  = require('./errors');


exports.createApplication = objects.factory({

  // spec.name
  // spec.version
  // spec.appdir
  // spec.sysconfigsdir
  // spec.environment
  // spec.packageJSON
  // spec.configs
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
      },
      initializers: {
        enumerable: true,
        value: []
      },
      API: {
        enumerable: true,
        value: Object.create(null)
      }
    });

    this.startPromise = null;
  },

  addInitializer: function (fn) {
    if (typeof fn !== 'function') {
      throw new errors.ArgumentError('addInitializer() requires a function argument.');
    }
    this.initializers.push(fn);
  },

  start: function() {
    if (!this.startPromise) {
      this.startPromise = this.initializers.reduce(function (promise, fn) {
        return promise.then(function (self) {
          return Promise.resolve(fn(self)).then(U.constant(self));
        });
      }, Promise.resolve(this));
    }
    return this.startPromise;
  }

});
