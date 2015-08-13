"use strict";

var
U        = require('./u'),
Promise  = require('./promise');


exports.create = function (wrapper) {
  var
  methods = wrapper();

  return function (args) {
    args = args || Object.create(null);

    return methods.map(function (fn) {
        return function (args) {
          return Promise.cast(fn.call(null, args)).then(U.constant(args));
        };
      })
      .reduce(function (promise, fn) {
        return promise.then(fn);
      }, Promise.resolve(args));
  };
};
