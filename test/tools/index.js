'use strict';

var
filepath = require('filepath');

exports.fixturePath = filepath.create(__dirname).resolve('../fixtures');

exports.hasOwnProp = function (obj, key) {
  return Object.prototype.hasOwnProperty.call(obj, key);
};

exports.runOnce = (function () {
  var results = Object.create(null);
  return function (key, fn) {
    if (!results[key]) {
      results[key] = {
        val: fn.apply(null, arguments)
      };
    }
    return results[key].val;
  };
}());
