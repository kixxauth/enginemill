var
Promise = require('../promise'),
U       = require('../u');


exports.Action = {

  initialize: function () {
    Object.defineProperties(this, {
      tasks: {
        value : []
      }
    });
  },

  run: function (args) {
    var
    promise;
    args = args || Object.create(null);
    promise = this.tasks.reduce(function (promise, fn) {
      return promise.then(fn);
    }, Promise.cast(args));
    return promise.catch(this.onerror);
  },

  q: function (handler) {
    var
    context = this;

    if (!U.isFunction(handler)) {
      throw new Error("Action q()'d method must be a function.");
    }

    this.tasks.push(function (args) {
      return Promise.cast(handler.call(context, args)).then(U.constant(args));
    });
  },

  onerror: function (err) {
    return Promise.reject(err);
  }
};
