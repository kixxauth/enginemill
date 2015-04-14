"use strict";

var
Promise = require('./promise');


module.exports = function (API) {
  var
  self = Object.create(null),
  promise = Promise.resolve(API);

  self.init = function (initializer) {
    promise = promise.then(function () {
      return initializer(API);
    });
    return self;
  };

  return self;
};
