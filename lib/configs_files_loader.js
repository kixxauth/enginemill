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
    args.appdir.append('configs.json'),
    args.sysconfigsdir.append('configs.json')
  ];

  return paths.reduce(function (promise, path) {
    return promise.then(U.partial(loadConfigs, path, environment));
  }, Promise.resolve(Object.create(null)));
};

function loadConfigs(filepath, environment, configs) {
  return jsonReader.readJSON(filepath).then(function (data) {
    if (data) {
      return composeConfigs(environment, configs, data);
    }
    return Promise.resolve(configs);
  });
}

function composeConfigs(environment, configs, data) {
  return Object.keys(data).reduce(function (configs, key) {
    var val, envData;
    if (key === environment && U.isObject(data[environment])) {
      envData = data[environment];
      return Object.keys(envData).reduce(function (configs, key) {
        if (hasOwn.call(envData, key)) {
          configs[key] = envData[key];
        }
        return configs;
      }, configs);
    } else if (key === environment) {
      return configs;
    }
    envData = U.isObject(data[environment]) ? data[environment] : {};
    val = hasOwn.call(envData, key) ? envData[key] : data[key];
    configs[key] = val;
    return configs;
  }, configs);
}