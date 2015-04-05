var
Promise = require('../promise'),
Objects = require('../objects'),
U       = require('../u');


exports.Action = {

  initialize: function () {
    Object.defineProperties(this, {
      tasks: {
        value : []
      }
    });
  },

  run: function (api, args) {
    api  = api || Object.create(null);
    args = args || Object.create(null);

    var
    list,
    promise,
    self = this,
    returns = this.returns;

    list = this.tasks.map(function (task) {
      return function (args) {
        return Promise.cast(task.run(self, api, args)).then(U.constant(args));
      };
    });

    promise = list.reduce(function (promise, fn) {
        return promise.then(fn);
      }, Promise.cast(args))
      .then(function (args) {
        if (U.isFunction(returns)) {
          return returns(args);
        }
        if (U.isString(returns) || U.isNumber(returns)) {
          return args[returns];
        }
        return args;
      });

    return promise;
  },

  q: function (id, fn) {
    if (id && !fn) {
      fn = this[id];
    }
    if (!U.isFunction(fn)) {
      throw new Error("Action q()'d callable must be a function or method id.");
    }

    this.tasks.push(exports.newTask({
      id       : id,
      callable : fn
    }));
  }
};


exports.Task = {
  initialize: function (spec) {
    Object.defineProperties(this, {
      callable: {
        enumerable: true,
        value: spec.callable
      },
      id: {
        enumerable: true,
        value: spec.id
      }
    });
  },

  run: function (context, api, args) {
    return this.callable.call(context, api, args);
  }
};


exports.newTask = Objects.factory(exports.Task);
