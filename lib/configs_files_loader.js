'use strict';

var
Promise  = require('./promise'),
U        = require('./u'),
readJSON = require('./json_reader').readJSON;


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
    args.appdir.append('configs.json'),
    args.sysconfigsdir.append('configs.json')
  ];

  return paths.reduce(function (promise, path) {
    return promise.then(U.partial(loadConfigs, path, environment));
  }, Promise.resolve(Object.create(null)));
};

function loadConfigs(filepath, environment, configs) {
  return readJSON(filepath).then(function (data) {
    Object.keys(data).reduce(function (configs, key) {
      var val = (data[key] || {})[environment];
      configs[key] = typeof val === 'undefined' ? data[key] : val;
      return configs;
    }, configs);
  });
}