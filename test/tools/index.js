'use strict';

var
filepath = require('filepath'),
nodeUUID = require('node-uuid');

exports.fixturePath = filepath.create(__dirname).resolve('../fixtures');

exports.hasOwnProp = function (obj, key) {
  return Object.prototype.hasOwnProperty.call(obj, key);
};

exports.uuid = function () {
  return nodeUUID.v1();
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
