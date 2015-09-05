'use strict';

var
FP = require('filepath');

exports.fixturePath = FP.create(__dirname).resolve('../fixtures');

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
