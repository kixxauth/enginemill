'use strict';

var
Promise     = require('./promise'),
U           = require('./u'),
errors      = require('./errors'),
application = require('./application'),

packageJSONLoader  = require('./package_json_loader'),
clArgsLoader       = require('./cl_args_loader'),
configsFilesLoader = require('./configs_files_loader');

exports.DEFAULTS = {
  ENVIRONMENT: 'development',
  INITIALIZER_PATH: 'initializers'
};


// args.usageString
// args.helpString
// args.options
// args.appdir = FP.create().resolve(process.argv[1]).dirname();
// args.sysconfigsdir
// args.name
// args.version
// args.environment
exports.load = function (args) {
  Promise.resolve(args)
    .then(loadPackageJSON)
    .then(loadCommandLineArgs)
    .then(setEnvironment)
    .then(loadFileConfigs)
    .then(createApplication)
    .then(loadInitializers)
    .then(function (args) {
      return args.app;
    });
};


// sets args.packageJSON
function loadPackageJSON(args) {
  args.packageJSON = packageJSONLoader.readPackageJSON({
    appdir: args.appdir
  });

  return args;
}


// sets args.argv
function loadCommandLineArgs(args) {
  args.argv = clArgsLoader.loadArgv({
    usageString : args.usageString,
    helpString  : args.helpString,
    options     : args.options,
    argv        : process.argv
  });

  return args;
}


// sets args.environment
function setEnvironment(args) {
  args.environment = args.argv.environment ||
                process.env.ENVIRONMENT ||
                process.env.NODE_ENV ||
                args.environment ||
                exports.DEFAULTS.ENVIRONMENT;
  return args;
}


// sets args.configs
function loadFileConfigs(args) {
  args.configs = configsFilesLoader.loadConfigs({
    environment   : args.environment,
    appdir        : args.appdir,
    sysconfigsdir : args.sysconfigsdir
  });

  return args;
}


// sets args.app
function createApplication(args) {
  args.app = application.create({
    name          : args.packageJSON.name || args.name,
    version       : args.packageJSON.version || args.version,
    appdir        : args.appdir,
    sysconfigsdir : args.sysconfigsdir,
    packageJSON   : args.packageJSON,
    environment   : args.environment,
    configs       : args.configs,
    argv          : args.argv
  });

  return args;
}


function loadInitializers(args) {
  var
  promises,
  pluginsDir  = args.app.appdir.append(exports.DEFAULTS.INITIALIZER_PATH),
  pluginFiles = [];

  if (pluginsDir.isDirectory()) {
    pluginFiles = pluginsDir.list();
  }

  promises = U.compact(pluginFiles.map(U.partial(loadInitializer, args.app)));
  return Promise.all(promises).then(U.constant(args));
}


function loadInitializer(app, path) {
  var plugin;

  if (path.isFile()) {
    path = path.toString();
    plugin = require(path);

    if (typeof plugin !== 'function') {
      throw new errors.ArgumentError('Initializer exports must be a function: '+ path);
    }

    return Promise.resolve(plugin(app));
  }

  return null;
}
