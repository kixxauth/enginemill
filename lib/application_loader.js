'use strict';

var
Promise     = require('./promise'),
U           = require('./u'),
errors      = require('./errors'),
application = require('./application'),

packageJSONLoader = require('./package_json_loader'),
clArgsLoader      = require('./cl_args_loader');

exports.DEFAULTS = {
  ENVIRONMENT      : 'development',
  INITIALIZER_PATH : 'initializers',
  APP_NAME         : 'not-named',
  APP_VERSION      : '0'
};


// args.appdir       - FP.create().resolve(process.argv[1]).dirname();
// args.name         - (optional default=packageJSON.name)
// args.version      - (optional default=packageJSON.version)
// args.usageString  - (optional)
// args.helpString   - (optional)
// args.options      - (optional)
// args.argv         - Will be used instead of options (optional)
// args.environment  - (optional)
// args.initializers - (optional default=[])
//
// Returns:
// A Promise for the Application instance.
exports.load = function (args) {
  return Promise.resolve(args)
    .then(loadPackageJSON)
    .then(loadCommandLineArgs)
    .then(setEnvironment)
    .then(createApplication)
    .then(loadInitializers)
    .then(function (args) {
      return args.app;
    });
};


// args.appdir
//
// Sets:
// args.packageJSON
function loadPackageJSON(args) {
  return packageJSONLoader.readPackageJSON({
    appdir: args.appdir
  })
  .then(function (res) {
    args.packageJSON = res || null;
    return args;
  });
}


// args.usageString
// args.helpString
// args.argv
// args.options
// process.argv
//
// Sets:
// args.argv
function loadCommandLineArgs(args) {
  if (!args.argv) {
    args.argv = clArgsLoader.loadArgv({
      usageString : args.usageString,
      helpString  : args.helpString,
      options     : args.options,
      argv        : process.argv
    });
  }
  return args;
}


// args.argv.environment
// process.env.ENVIRONMENT
// process.env.NODE_ENV
// args.environment
//
// Sets:
// args.environment
function setEnvironment(args) {
  args.environment = args.argv.environment ||
                     process.env.ENVIRONMENT ||
                     process.env.NODE_ENV ||
                     args.environment ||
                     exports.DEFAULTS.ENVIRONMENT;
  return args;
}


// args.name
// args.version
// args.packageJSON
// args.appdir
// args.environment
// args.argv
//
// Sets:
// args.app
function createApplication(args) {
  var packageJSON = args.packageJSON || Object.create(null);

  args.app = application.create({
    name        : args.name ||
                  packageJSON.name ||
                  exports.DEFAULTS.APP_NAME,
    version     : args.version ||
                  packageJSON.version ||
                  exports.DEFAULTS.APP_VERSION,
    appdir      : args.appdir,
    packageJSON : args.packageJSON,
    environment : args.environment,
    argv        : args.argv
  });

  return args;
}


// args.app
// args.initializers
function loadInitializers(args) {
  var
  initializers, app, dir;

  if (!args.initializers) {
    initializers = [];
  } else {
    initializers = Array.isArray(args.initializers) ?
                   args.initializers : [args.initializers];
  }

  app = args.app;
  dir = app.appdir.append(exports.DEFAULTS.INITIALIZER_PATH);

  return initializers

    // Transform all initializers to loader function modules.
    .map(function (module, index) {
      var path, message;

      if (typeof module === 'string') {
        path = dir.append(module).toString();
        try {
          module = require(path);
        } catch (moduleError) {
          if (moduleError.code === 'MODULE_NOT_FOUND') {
            throw new errors.ArgumentError(moduleError.message);
          }
          throw moduleError;
        }
      }

      if (typeof module !== 'function') {
        message = path ? ('path '+ path) : ('index '+ index);
        throw new errors.ArgumentError('Initializers must be functions: '+ message);
      }

      return module;
    })

    // Run the loader for each initializer in serial.
    .reduce(function (promise, module) {
      return promise.then(function (app) {
        return Promise.resolve(module(app)).then(U.constant(app));
      });
    }, Promise.resolve(args.app))

    .then(U.constant(args));
}
