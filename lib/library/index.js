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
exports.Path = PATH.FilePath;
exports.http = HTTP;

// Globals
exports.Crystal = CRYSTAL.Crystal;
exports.Promise = IOU.Promise;

exports.returnValue = function (val) {
  return function () {
    return val;
  };
}

exports.merge = function (obj) {
  if (!LIB.isObject(obj)) {
    obj = Object.create(null);
  }

  LIB.toArray(arguments).slice(1).forEach(function (source) {
    if (LIB.isObject(source)) {
      obj = Object.keys(source).reduce(function (rv, key) {
        var val = source[key]
        if (!LIB.isObject(val)) {
          rv[key] = val;
        } else {
          rv[key] = exports.merge(rv[key], val);
        }
        return rv;
      }, obj);
    }
  });

  return obj;
}

exports.stringify = function (obj, opts) {
  opts = opts || Object.create(null);

  if (UTIL.isError(obj)) {
    return obj.stack;
  } else if (typeof obj === 'string') {
    return obj;
  } else if (obj && typeof obj.facade === 'function') {
    obj = obj.facade(opts);
  }

  return UTIL.inspect(obj, {
    showHidden: opts.showHidden ? true : false
  , depth: opts.depth === null ? null : (opts.depth || 3)
  , colors: opts.colors === false ? false : true
  , customInspect: opts.customInspect === false ? false : true
  });
};


exports.print = function () {
  var str = Array.prototype
    .slice.call(arguments)
    .map(exports.stringify)
    .join(' ');

  UTIL.puts(str);
  return;
};


exports.fail = function (message, code) {
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


exports.parseIni = function (str) {
  if (str && typeof str === 'string') {
    return INI.parse(str);
  }
  return null;
};
