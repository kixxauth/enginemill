var
FilePath = require('filepath'),
U        = require('./lib/u'),
Promise  = require('./lib/promise'),
Objects  = require('./lib/objects'),
Plugin   = require('./lib/plugin'),
Action   = require('./lib/mixins/action').Action;


exports.newLoader = Objects.factory([Action], {
  initialize: function () {
  }
});


// API.sysconfigsdir(configs) - Function that takes a configs Object.
// API.usrconfigsdir(configs) - Function that takes a configs Object.
// args.configs               - A configs Object (it will be replaced, not mutated).
//
// Returns a Promise for the args Object.
exports.loadCoreConfigs = function (API, args) {
  var
  paths = [ FilePath.create(__dirname).append('configs.ini') ];
  return loadConfigsPath(paths, args.configs).then(function (configs) {
    var
    paths = [
      API.sysconfigsdir(configs).append('enginemill.ini'),
      API.usrconfigsdir(configs).append('enginemill.ini')
    ];
    return loadConfigsPath(paths, configs).then(function (configs) {
      args.configs = configs;
      return args;
    });
  });
};


// API.appdir(configs) - Function that takes a configs Object.
// args.configs        - The configs Object (will be mutated with .app).
//
// Returns a Promise for the args Object.
exports.readAppSettings = function(API, args) {
  var
  jsonPath = API.appdir(args.configs).append('package.json');

  function parseJSON(text) {
    var app;
    try {
      app = JSON.parse(text +'');
    } catch (err) {
      err = new Error("JSON SyntaxError: "+ err.message +" in "+ jsonPath);
      return Promise.reject(err);
    }
    return app;
  }

  function setValues(meta) {
    meta = U.extend(Object.create(null) , meta || Object.create(null));
    meta.name = meta.name || 'enginemill_default';
    args.configs.app = meta;
    return args;
  }

  return jsonPath.read()
    .then(parseJSON)
    .then(setValues);
};


// API.appdir(configs)        - Function that takes a configs Object.
// API.sysconfigsdir(configs) - Function that takes a configs Object.
// API.usrconfigsdir(configs) - Function that takes a configs Object.
// args.configs               - A configs Object (it will be replaced, not mutated).
// args.configs.plugins       - An Array of plugin String names.
// args.configs.app.name      - Name String of the application.
//
// Returns a Promise for the args Object.
exports.loadInstalledConfigs = function (API, args) {
  if (!(args.configs.plugins && args.config.plugins.length)) {
    return Promise.resolve(args);
  }

  var
  promises = args.configs.plugins.map(function (plugin) {
    var
    paths = [
      args.appdir(args.configs).append('node_modules', plugin, 'configs.ini'),
      args.sysconfdir.append(args.configs.app.name, plugin +'.ini'),
      args.usrconfdir.append(args.configs.app.name, plugin +'.ini')
    ];

    return loadConfigsPath(paths, args.configs);
  });

  return Promise.all(promises).then(function (newConfigs) {
    args.configs = newConfigs.reduce(function (configs, c) {
      U.extend(configs, c);
      return configs;
    }, Object.create(null));
    return args;
  });
};


// API.appdir(configs)        - Function that takes a configs Object.
// API.sysconfigsdir(configs) - Function that takes a configs Object.
// API.usrconfigsdir(configs) - Function that takes a configs Object.
// args.configs               - A configs Object (it will be replaced, not mutated).
// args.configs.app.name      - Name String of the application.
//
// Returns a Promise for the args Object.
exports.loadAppConfigs = function (API, args) {
  var
  appname = args.configs.app.name,
  paths = [
    API.appdir(args.configs).append('configs.ini'),
    API.sysconfigsdir(args.configs).append(appname +'.ini'),
    API.usrconfigsdir(args.configs).append(appname +'.ini'),
  ];

  return exports.loadConfigsPath(paths, args.configs).then(function (configs) {
    args.configs = configs;
    return args;
  });
};


// API          - The API object (it will be mutated)
// args.configs - The frozen configs Object
// args.configs.core_plugins - An Array of plugin name Strings.
//
// Returns a Promise for the API Object.
exports.loadCorePlugins = function (API, args) {
  if (!(args.configs.core_plugins && args.configs.core_plugins.length)) {
    return Promise.resolve(API);
  }
  var
  dir = FilePath.create(__dirname).append('plugins');
  return loadPlugins(API, args.configs, args.configs.core_plugins, dir);
};


// API                 - The API object (it will be mutated)
// API.appdir(configs) - Function that takes a configs Object.
// args.configs        - The frozen configs Object
// args.configs.installed_plugins - An Array of plugin name Strings.
//
// Returns a Promise for the API Object.
exports.loadInstalledPlugins = function (API, args) {
  if (!(args.configs.installed_plugins && args.configs.installed_plugins.length)) {
    return Promise.resolve(API);
  }
  var
  dir = API.appdir(args.configs).append('node_modules');
  return exports.loadPlugins(API, args.configs, args.configs.installed_plugins, dir);
};


// API                  - The API object (it will be mutated)
// API.appdir(configs)  - Function that takes a configs Object.
// args.configs         - The frozen configs Object
// args.configs.plugins - An Array of plugin name Strings.
//
// Returns a Promise for the API Object.
exports.loadAppPlugins = function (API, args) {
  if (!(args.configs.plugins && args.configs.plugins.length)) {
    return Promise.resolve(API);
  }
  var
  dir = API.appdir(args.configs).append('plugins');
  return exports.loadPlugins(API, args.configs, args.configs.plugins, dir);
};


// filepaths   - An Array of FilePaths to read for configs.
// baseConfigs - The current configs Object (will be copied, not mutated).
//
// Returns a Promise for a new configs Object.
function loadConfigsPath(filepaths, baseConfigs) {
  return filepaths.reduce(function (promise, path) {
    return promise.then(U.partial(loadConfigs, path));
  }, Promise.resolve(baseConfigs));
}


// filepath    - A FilePath representing the path to the configs file.
// baseConfigs - The current configs Object (will be copied, not mutated).
//
// Returns a Promise for a new configs Object.
function loadConfigs(filepath, baseConfigs) {
  return filepath.read().then(function (text) {
    var
    configs = U.extend(Object.create(null), baseConfigs);
    if (text) {
      U.extend(configs, INI.parse(text));
    }
    return configs;
  });
}


// API     - The API object (it will be mutated)
// configs - The frozen configs Object
// list    - An Array of plugin String names
// dirpath - A FilePath referencing the base plugins directory
//
// Returns a Promise for the API Object.
function loadPlugins(API, configs, list, dirpath) {
  var
  paths, plugins;
  paths = readPluginDirectory(list, dirpath);
  plugins = paths.map(loadPlugin);
  return initializePlugins(API, configs, plugins);
}


// list    - An Array of plugin String names
// dirpath - A FilePath referencing the base plugins directory
//
// Returns an Array of expanded FilePaths.
function readPluginDirectory(list, dirpath) {
  return list.map(function (plugin) {
    return dirpath.append(plugin, 'index');
  });
}


// path - A FilePath object representing the full path to the plugin.
//
// Returns a Plugin.
function loadPlugin(path) {
  var
  spec, plugin;
  try {
    spec = require(path);
  } catch (err) {
    debugger;
    throw err;
  }
  try {
    plugin = Plugin.newPlugin(spec);
  } catch (err) {
    debugger;
    throw err;
  }
  return plugin;
}


// API     - The API object (it will be appended).
// configs - The frozen configs Object
// plugins - An Array of plugin exports.
//
// Returns a Promise for the API Object.
function initializePlugins(API, configs, plugins) {
  return plugins.reduce(function (promise, plugin) {
    return promise.then(plugin.initialize(API, configs));
  }, Promise.cast(API));
}
