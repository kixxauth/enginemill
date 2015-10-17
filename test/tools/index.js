'use strict';

var
FP = require('filepath');

exports.fixturePath = FP.create(__dirname).resolve('../fixtures');

exports.hasOwnProp = function (obj, key) {
  return Object.prototype.hasOwnProperty.call(obj, key);
};

exports.fake_guid = function () {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
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
