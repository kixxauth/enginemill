'use strict';

var
Promise = require('./promise'),
U       = require('./u'),
ERRORS  = require('./errors');

// Params:
// args.appdir - FilePath representing the base app directory.
//
// Returns a Promise for parsed package.json if it exists. If it does not
// exist then returns a Promise for null.
exports.readPackageJSON = function (args) {
  var jsonPath = args.appdir.append('package.json');

  function parseJSON(text) {
    var err, data;
    try {
      data = JSON.parse(text +'');
    } catch (e) {
      err = new ERRORS.JSONReadError('JSON SyntaxError: '+ e.message +' in '+ jsonPath);
      return Promise.reject(err);
    }
    return data;
  }

  function setValues(data) {
    return U.extend(Object.create(null), data || Object.create(null));
  }

  function catchFileReadError(err) {
    var newError;
    if (err.code === 'PATH_IS_DIRECTORY') {
      newError = new ERRORS.JSONReadError('The expected file path is a directory');
    } else {
      newError = new ERRORS.JSONReadError('Unexpected JSON read Error');
      newError.code = err.code;
    }
    return Promise.reject(newError);
  }

  if (jsonPath.exists()) {
    // Wrap this into a Bluebird Promise.
    return Promise.resolve(jsonPath.read())
      .then(parseJSON, catchFileReadError)
      .then(setValues);
  }

  return Promise.resolve(null);
};
