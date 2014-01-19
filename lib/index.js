var UTIL = require('util')

  , UNDERSCORE = require('underscore')
  , IOU = require('iou')
  , CRYSTAL = require('crystal_constants')
  , PATH = require('filepath')
  , INI = require('ini')

  , HTTP = require('./http')

// Extend with Underscore.
for (var name in UNDERSCORE) {
  exports[name] = UNDERSCORE[name];
}
delete exports._;
delete exports.VERSION;

// util module
exports.isArray = UTIL.isArray;
exports.isDate = UTIL.isDate;
exports.isError = UTIL.isError;
exports.isRegExp = UTIL.isRegExp;

// Utility modules.
exports.PATH = PATH;
exports.HTTP = HTTP;

// Globals
exports.Crystal = CRYSTAL.Crystal;
exports.Promise = IOU.Promise;

exports.returnValue = function (val) {
  return function () {
    return val;
  };
}

exports.stringify = function stringify(obj) {
  if (UTIL.isError(obj)) {
    return obj.stack;
  } else if (typeof obj === 'string') {
    return obj;
  } else {
      // UTIL.inspect(value, ignoreHidden, recursionDepth, colors);
      // http://nodejs.org/api/util.html#util_util_inspect_object_showhidden_depth_colors
      return UTIL.inspect(obj, true, 3, true);
  }
  return obj;
};


exports.print = function print() {
  var str = Array.prototype
    .slice.call(arguments)
    .map(exports.stringify)
    .join(' ');

  process.stdout.write(str +'\n');
  return;
};


exports.fail = function fail(message, code) {
  if (message.stack) {
    message = message.stack;
  } else if (message.message) {
    message = message.message;
  } else if (typeof message !== 'string') {
    message = message +'';
  }

  console.error(message);
  process.exit(code || 1);
};
