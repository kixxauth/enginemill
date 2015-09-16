'use strict';

var
Promise    = require('./promise'),
U          = require('./u'),
jsonReader = require('./json_reader'),

hasOwn = Object.prototype.hasOwnProperty;


// Params:
// args.environment - The environment String.
// args.appdir - FilePath representing the base app directory.
// args.sysconfigsdir - FilePath representing the system cofigs directory.
//
// Returns a promise for the configs Object hash.
exports.loadConfigs = function (args) {
  var
  paths,
  environment = args.environment;

  paths = [
    args.appdir.append(environment +'.json'),
    args.sysconfigsdir.append(environment +'.json')
  ];

  return paths.reduce(function (promise, path) {
    return promise.then(U.partial(loadConfigs, path, environment));
  }, Promise.resolve(Object.create(null)));
};

function loadConfigs(filepath, environment, configs) {
  return jsonReader.readJSON(filepath).then(function (data) {
    if (data) {
      U.extend(configs, data);
    }
    return Promise.resolve(configs);
  });
}
