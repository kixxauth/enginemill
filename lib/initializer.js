"use strict";

var
Promise = require('./promise');


module.exports = function (API) {
  var
  self         = Object.create(null),
  initializers = [],
  promise      = Promise.resolve(API);

  self.init = function (initializer) {
    initializers.push(initializer);
    promise = promise.then(function () {
      var
      promise = initializer(API);
      promise = initializer.stop().then(initializer.start);
      return Promise.cast(promise);
    });
    return self;
  };

  self.stop = function () {
    return Promise.all(initializers.map(function (initializer) {
      if (initializer && initializer.stop) {
        return initializer.stop();
      } else {
        return Promise.resolve(initializer);
      }
    }));
  };

  self.promise = function () { return promise; };

  return self;
};
