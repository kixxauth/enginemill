'use strict';

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
    environment   : args.environment,
    configs       : {
      appdir        : args.appdir,
      sysconfigsdir : args.sysconfigsdir,
      environment   : args.environment
    }
  };

  Promise.resolve(values)
    .then(readPackageJSON)
    .then(loadAppConfigs)
    .then(function (args) {
      var
      configs = U.extend(Object.create(null), args.configs);
      configs.name = args.packageJSON.name;
      configs.version = args.packageJSON.version;
      configs.packageJSON = args.packageJSON;
      return configs;
    });
};

// Params:
// args.appdir - FilePath representing the base app directory.
//
// Sets:
// args.packageJSON - Application package.json data Object.
//
// Returns a Promise for the args Object.
function readPackageJSON(args) {
  var jsonPath = args.appdir.append('package.json');

  function parseJSON(text) {
    var err, data;
    try {
      data = JSON.parse(text +'');
    } catch (e) {
      err = new Error('JSON SyntaxError: '+ e.message +' in '+ jsonPath);
      return Promise.reject(err);
    }
    return data;
  }

  function setValues(data) {
    data = U.extend(Object.create(null) , data || Object.create(null));
    args.packageJSON = data;
    args.name = data.name;
    return args;
  }

  if (jsonPath.exists()) {
    return jsonPath.read()
      .then(parseJSON)
      .then(setValues);
  }

  return Promise.resolve(Object.create(null)).then(setValues);
}

// Params:
// args.appname       - Application name String.
// args.environment   - The environment String.
// args.appdir        - FilePath representing the base app directory.
// args.sysconfigsdir - FilePath representing the system cofigs directory.
//
// Sets:
// args.configs - Configs Object hash.
//
// Returns a Promise for the args Object.
function loadAppConfigs(args) {
  var appname = args.appname;
  var paths = [
    args.appdir.append('configs.ini'),
    args.sysconfigsdir.append('configs.ini')
  ];

  return loadConfigsPath(paths, args.environment).then(function (configs) {
    args.configs = configs;
    return args;
  });
}

//
// Helpers
//

// Given a list of file paths, pass each one through loadConfigs() and
// accumulate the results onto a new Object hash.
//
// Params:
// filepaths   - An Array of FilePaths to read for configs.
// environment - The environment config String.
//
// Returns a Promise for a new configs Object.
function loadConfigsPaths(filepaths, environment) {
  return filepaths.reduce(function (promise, path) {
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
        cofigs[key] = typeof val === 'undefined' ? data[key] : val;
        return configs;
      }, configs);
    }
    return configs;
  });
}