'use strict';

var
FP          = require('filepath'),
Promise     = require('./promise'),
U           = require('./u'),
errors      = require('./errors'),
application = require('./application'),

packageJSONLoader  = require('./package_json_loader'),
clArgsLoader       = require('./cl_args_loader'),
configsFilesLoader = require('./configs_files_loader');

exports.DEFAULTS = {
  ENVIRONMENT: 'development'
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
  var
  packageJSON, argv, environment, configs, app;

  packageJSON = packageJSONLoader.readPackageJSON({
    appdir: args.appdir
  });

  argv = clArgsLoader.loadArgv({
    usageString : args.usageString,
    helpString  : args.helpString,
    options     : args.options,
    argv        : process.argv
  });

  environment = argv.environment ||
                process.env.ENVIRONMENT ||
                process.env.NODE_ENV ||
                args.environment ||
                exports.DEFAULTS.ENVIRONMENT;

  configs = configsFilesLoader.loadConfigs({
    environment   : environment,
    appdir        : args.appdir,
    sysconfigsdir : args.sysconfigsdir
  });

  app = application.create({
    name          : packageJSON.name || args.name,
    version       : packageJSON.version || args.version,
    appdir        : args.appdir,
    sysconfigsdir : args.sysconfigsdir,
    packageJSON   : packageJSON,
    environment   : environment,
    configs       : configs,
    argv          : argv
  });
};


function loadInitializers(app) {
  var
  promises,
  pluginsDir  = app.appdir.append('initializers'),
  pluginFiles = [];

  if (pluginsDir.isDirectory()) {
    pluginFiles = pluginsDir.list();
  }

  promises = U.compact(pluginFiles.map(U.partial(loadPlugin, app)));
  return Promise.all(promises);
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
