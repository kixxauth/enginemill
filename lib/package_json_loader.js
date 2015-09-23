'use strict';

var
jsonReader = require('./json_reader');

// Params:
// args.appdir - FilePath representing the base app directory.
//
// Returns a Promise for parsed package.json if it exists. If it does not
// exist then returns a Promise for null.
exports.readPackageJSON = function (args) {
  var path = args.appdir.append('package.json');
  return jsonReader.readJSON(path);
};
