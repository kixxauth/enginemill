'use strict';

var
Promise = require('./promise'),
U       = require('./u'),
INI     = require('ini');


// Params:
// args.environment - The environment String.
// args.appdir - FilePath representing the base app directory.
// args.sysconfigsdir - FilePath representing the system cofigs directory.
//
// Returns a promise for the configs Object hash.
exports.loadConfigs = function (args) {
  var values = {
    appdir        : args.appdir,
    sysconfigsdir : args.sysconfigsdir,
    environment   : args.environment
  };

  loadAppConfigs(values)
    .then(function (res) {
      return U.extend(Object.create(null), res);
    });
};

// Params:
// args.environment   - The environment String.
// args.appdir        - FilePath representing the base app directory.
// args.sysconfigsdir - FilePath representing the system cofigs directory.
//
// Returns a Promise for the configs Object.
function loadAppConfigs(args) {
  var
  paths,
  environment = args.environment;

  paths = [
    args.appdir.append('configs.ini'),
    args.sysconfigsdir.append('configs.ini')
  ];

  return paths.reduce(function (promise, path) {
    return promise.then(U.partial(loadConfigs, path, environment));
  }, Promise.resolve(Object.create(null)));
}

// Given a file path, environment String and config object; read the text from
// the filepath and parse it with the .ini parser. If the parsed values have
// the form "data[environment].foo" use it, otherwise use "data.foo".
//
// Params:
// filepath    - A FilePath instance representing the path to the configs file.
// environment - The environment config String.
// configs     - A configs Object hash.
//
// Sets:
// configs - Mutates the configs Object with config settings.
//
// Returns a Promise for a new configs Object.
function loadConfigs(filepath, environment, configs) {
  return filepath.read().then(function (text) {
    var
    data;
    if (text) {
      data = INI.parse(text);
      Object.keys(data).reduce(function (configs, key) {
        var val = (data[key] || {})[environment];
        configs[key] = typeof val === 'undefined' ? data[key] : val;
        return configs;
      }, configs);
    }
    return configs;
  });
}