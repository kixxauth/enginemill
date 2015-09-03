'use strict';

var
Promise = require('./promise'),
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
  // spec.argv
  initialize: function (spec) {
    var
    _startPromise = null;

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
      argv: {
        enumerable: true,
        value: U.deepFreeze(spec.argv)
      },
      initializers: {
        enumerable: true,
        value: []
      },
      API: {
        enumerable: true,
        value: Object.create(null)
      },
      // Protected
      setStartPromise: {
        value: function (promise) {
          _startPromise = promise;
        }
      },
      startPromise: {
        get: function () {
          return _startPromise;
        }
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
      this.setStartPromise(this.initializers.reduce(function (promise, fn) {
        return promise.then(function (self) {
          return Promise.resolve(fn(self)).then(U.constant(self));
        });
      }, Promise.resolve(this)));
    }
    return this.startPromise;
  }

});
