"use strict";

var
U        = require('./u'),
Promise  = require('./promise');


exports.create = function (wrapper) {
  var
  methods = wrapper();

  return function (api, args) {
    api  = api || Object.create(null);
    args = args || Object.create(null);

    return methods.map(function (fn) {
        return function (args) {
          return Promise.cast(fn.call(null, api, args)).then(U.constant(args));
        };
      })
      .reduce(function (promise, fn) {
        return promise.then(fn);
      }, Promise.resolve(args));
  };
};
