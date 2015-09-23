'use strict';

var
Promise = require('./promise'),
U       = require('./u'),
ERRORS  = require('./errors');

// Params:
// path - FilePath representing the path to the file to load.
//
// Returns:
// - A Promise for parsed JSON file if it exists.
// - If it does not exist then returns a Promise for null.
// - If there is a JSON syntax error detected a JSONReadError is
//   returned via rejection.
// - If the given path is not a file an ERRORS.ArgumentError is
//   passed via rejection.
exports.readJSON = function (path) {

  function parseJSON(text) {
    var err, data;
    try {
      data = JSON.parse(text +'');
    } catch (e) {
      err = new ERRORS.JSONReadError('JSON SyntaxError: '+ e.message +' in '+ path);
      return Promise.reject(err);
    }
    return data;
  }

  function setValues(data) {
    return U.extend(Object.create(null), data || Object.create(null));
  }

  function catchFileReadError(err) {
    var newError = new ERRORS.JSONReadError('Unexpected JSON read Error');
    newError.code = err.code;
    return Promise.reject(newError);
  }

  if (path.exists() && path.isFile()) {
    // Wrap this into a Bluebird Promise.
    return Promise.resolve(path.read())
      .then(parseJSON, catchFileReadError)
      .then(setValues);
  } else if (!path.exists()) {
    return Promise.resolve(null);
  }
  return Promise.reject(
    new ERRORS.ArgumentError('The expected file path is not a file'));
};
