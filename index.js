// Enginemill
// ==========
// Enginemill is a Node.js web development framework. The goal is to codify
// some opinions about how to structure a Node.js system and provide some
// tools to make the development of your systems easier and more fun.

// Enginemill runs with [strict mode](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode) on.
'use strict';

// The `exports` object is assigned to `enginemill` for readability.
var enginemill = exports;

var util = require('util');

// ### enginemill.Promise
// Enginemill uses [Bluebird Promises](http://bluebirdjs.com/docs/getting-started.html) to handle asynchronous programming
// from start to finish and enginemill it as `enginemill.Promise` for you.
enginemill.Promise = require('Bluebird');
var Promise     = enginemill.Promise;

// ### enginemill.U
// Enginemill also uses [Lodash](https://lodash.com/) as the default JavaScript utility library,
// and adds some extensions from [BRIXX](https://github.com/kixxauth/brixx) as well. Notice that it is exported
// as the `U` symbol instead of the `_` symbol.
enginemill.U = require('lodash');
var U     = enginemill.U;
var BRIXX = require('brixx');
// #### enginemill.U.ensure()
// Ensures the passed in object is, in fact, an Object. When `null` or
// `undefined` are passed in, ensure() returns a new Object created with
// `Object.create(null)`. Otherwise it returns the passed in Object.
//
// #### enginemill.U.deepFreeze()
// Calls `Object.freeze()` recursively on the passed in Object. deepFreeze()
// will skip the `arguemnts`, `caller`, `callee` and `prototype` properties
// of a Function. deepFreeze() will throw if passed null or undefined just
// like `Object.freeze()` would.
//
// #### enginemill.U.exists()
// Check to see if the passed in Object exists. Returns false for null,
// undefined, or NaN. Returns true for everything else.
//
// #### enginemill.U.stringify()
// A different way to stringify an Object, other than .toString().
// 1. Returns an empty string for null, undefined or NaN.
// 2. Returns the special '[object Function]' String for Functions.
// 3. Returns the result of .toString() for anything else if it exists.
// 4. Returns the result of Object.prototype.toString if .toString()
//    is not present.
//
// #### enginemill.U.factory()
// An object factory which uses the mixin pattern. Pass it some mixins and it
// will return an Object factory Function for you. Returns a Function which
// will create new Objects using a prototype composed of the mixins passed in.
// The returned Object factory will call initialize() on your object instance.
// If there is an initialize() function defined on any of the mixins,
// they will be called before your mixin.
//
// Example:
// ```JS
// var createWidget = enginemill.U.factory(enginemill.Mixins.Model, {
//   name: 'Widget',
//   idAttribute: '_id',
//
//   defaults: {
//     _id    : null,
//     width  : 5,
//     height : 2
//   },
//
//   initialize: function () {
//     this.cid = randomString();
//   },
//
//   area: function () {
//     return this.width * this.height;
//   }
// });
// ```
enginemill.U.mixin({
  ensure     : BRIXX.ensure,
  deepFreeze : BRIXX.deepFreeze,
  exists     : BRIXX.exists,
  stringify  : BRIXX.stringify,
  factory    : BRIXX.factory
});

// ### enginemill.filepath
// Enginemill uses the [FilePath](https://github.com/kixxauth/filepath) library as the default cross platform
// interface for working with the file system in both posix and win32.
enginemill.filepath = require('filepath');
var filepath = enginemill.filepath;

// ### enginemill.Errors
// The Standard Enginemill Error constructors are all exposed on `enginemill`
// enginemill via the `Errors` namespace. This makes robust exception handling
// much easier with [Bluebird's catch exception handling](http://bluebirdjs.com/docs/api/catch.html),
// allowing you properly segment your exception handling based on [operational and programmer errors](https://www.joyent.com/developers/node/design/errors).
enginemill.Errors = Object.create(null);

// #### enginemill.Errors.NotImplementedError
// Useful for parts of a program which are not implemented yet. Exported
// publically as `enginemill.Errors.NotImplementedError`
function NotImplementedError(message) {
  Error.call(this);
  Error.captureStackTrace(this, this.constructor);
  this.name = this.constructor.name;
  this.message = message;
}
util.inherits(NotImplementedError, Error);
enginemill.Errors.NotImplementedError = NotImplementedError;

// #### enginemill.Errors.NotFoundError
// Used when a resource cannot be located. Exported publically as
// `enginemill.Errors.NotFoundError`
function NotFoundError(message) {
  Error.call(this);
  Error.captureStackTrace(this, this.constructor);
  this.name = this.constructor.name;
  this.message = message;
}
util.inherits(NotFoundError, Error);
enginemill.Errors.NotFoundError;

// #### enginemill.Errors.JSONParseError
// Handle the special case of parsing JSON. Exported publically as
// `enginemill.Errors.JSONReadError`
function JSONParseError(message) {
  Error.call(this);
  Error.captureStackTrace(this, this.constructor);
  this.name = this.constructor.name;
  this.message = message;
}
util.inherits(JSONReadError, Error);
enginemill.Errors.JSONReadError;

// ### CoffeeScript
// Enginemill registers the [CoffeeScript](http://coffeescript.org/) compiler before loading or
// initializing your program. This way you can use CoffeeScript to write your
// configuration and initialization files. In fact, you could use CoffeeScript
// to write your whole program, but Enginemill holds the opinion that programs
// are better written in JavaScript, while it can still be convenient to use
// CoffeeScript to write your configuration files.
coffee.register();

// ### enginemill.load
// `enginemill.load()` is the main entry point for your program. This is where
// your initializers are loaded and your program execution begins. The
// expectation of Enginemill is that your application looks something like this:
// ```text
// myapp
// |- bin
// |  `- start_server.js
// |- lib
// |  `- utils.js
// |- initializers
// |  |- configs.coffee
// |  |- middleware.coffee
// |  |- routes.coffee
// |  `- databases.coffee
// |- presenters
// |  |- users.js
// |  `- posts.js
// |- middleware
// |  |- auth_token.js
// |  `- api_response.js
// |- views
// |  |- author_profile.js
// |  `- article.js
// |- store
// |  |- models.js
// |  `- index.js
// |- server.js
// `- package.json
// ```
// #### Arguments
// __enginemill.load(args) arguments (args) Object:__
//
// name                  | description
// --------------------- | ---
// __appdir__       | *FilePath instance* Defaults to the directory of the currently executing script.
// __name__         | *String* Defaults to the package.json "name" attribute.
// __version__      | *String* Defaults to the package.json "version" attribute.
// __usageString__  | *String* Used as the usage string on the command line if present.
// __helpString__   | *String* Used as the help string on the command line if present.
// __options__      | *Object* Command line parsing configurations.
// __argv__         | *Object* Will be used instead of command line argv if present.
// __environment__  | *String* Will be used instead of command line environment if present.
// __initializers__ | *Array* of initializers (String names).
//
// __Returns__ a Promise for the Application instance.
//
// #### Example
// In `bin\start_server.js`:
// ```JS
// var enginemill = require('enginemill');
// var server = require('../server');
//
// enginemill.load({
//     appdir: enginemill.filepath.create(__dirname, '..'),
//
//     // Plugins (expected in ../initializers/).
//     initializers: [
//         'configs',
//         'middleware',
//         'routes',
//         'databases'
//     ]
// })
// .then(server.start)
// .catch(function (err) {
//     console.error('There was an error starting the server:');
//     console.error(err.stack || err.message || err);
//     process.exit(1);
// });
// ```
enginemill.load = function (args, callback) {
  args = args || Object.create(null);

  var promise;

  // #### appdir
  // The load sequence begins by determining what the application root
  // directory is going to be. If `args.appdir` is a FilePath instance
  // `enginemill.load()` will use it as is. If it is a String then
  // `enginemill.load()` will create a FilePath instance from it. Othewise
  // a FilePath instance referencing the directory of the executing script
  // is used as a best guess by default.
  var appdir;
  if (args.appdir && args.appdir instanceof filepath.FilePath) {
    appdir = args.appdir;
  } else if (typeof args.appdir === 'string') {
    appdir = filepath.create(args.appdir);
  } else {
    appdir = filepath.create().resolve(process.argv[1]).dirname();
  }

  promise = Promise.resolve({
      appdir       : appdir,
      name         : args.name,
      version      : args.version,
      usageString  : args.usageString,
      helpString   : args.helpString,
      options      : args.options,
      argv         : args.argv,
      environment  : args.environment,
      initializers : args.initializers
    })
    // #### package.json
    // After determining the root application directory the package.json is
    // read and will be available as `app.packageJSON`. The `app.name` and
    // `app.version` are also determined by the package.json, but can be
    // overridden with `args.name` and `args.version`.
    .then(function loadPackageJSON(args) {
      return packageJSONLoader.readPackageJSON({
        appdir: args.appdir
      })
      .then(function (res) {
        args.packageJSON = res || null;
        return args;
      });
    })
    // #### Command Line Options Parsing
    // Next, the command line arguments are parsed based on the `args.options`
    // Object passed in. The parsed command line arguments will be available on
    // the Application instance as `app.argv`. If `args.argv` is present, this
    // step will be skipped and it will be assigned to `app.argv` instead.
    .then(function loadCommandLineArgs(args) {
      if (!args.argv) {
        args.argv = clArgsLoader.loadArgv({
          usageString : args.usageString,
          helpString  : args.helpString,
          options     : args.options,
          argv        : process.argv
        });
      }
      return args;
    })
    // #### Environment Setting
    // The environment setting String will be available on the Application
    // instance as `app.environment`. If "--environment" is present from the
    // command line, it will take precedence. If the "ENVIRONMENT" environment
    // variable is set, it will be used next. After that, the "NODE_ENV"
    // environment variable is used, followed by the passed in
    // `args.environment` and the default `enginemill.DEFAULTS.ENVIRONMENT`.
    .then(function setEnvironment(args) {
      args.environment = args.argv.environment ||
                         process.env.ENVIRONMENT ||
                         process.env.NODE_ENV ||
                         args.environment ||
                         enginemill.DEFAULTS.ENVIRONMENT;
      return args;
    })
    .then(function createApplication(args) {
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
    })
    .then(function loadInitializers(args) {
      return exports.loadInitializers(args);
    })
    .then(function returnApplication(args) {
      return args.app;
    });
};

// ### Defaults
// Some default options used by Enginemill which you can extend by modifying
// the `enginemill.DEFAULTS` Object. See __enginemill.load__ above for more
// information about how these are used.
enginemill.DEFAULTS = {
  ENVIRONMENT      : 'development',
  INITIALIZER_PATH : 'initializers',
  APP_NAME         : 'not-named',
  APP_VERSION      : '0'
};

// ### Initializer Loading
// The initialization loader requires and loads all initializers passed in as
// Strings. Initialization functions may also be passed in and will be used
// directly. Initailization modules must export a Function with
// `module.exports = function () { ... }`.
//
// After the initializer functions are loaded they are exectuted serially in
// order. Each initializer function is passed a single argument; the
// Application instance. Extending the `app.configs` or `app.API` Objects
// is a great use of an initializer. It is expected that initializers will
// complete aysnchronously, and if so, they should return a Promise.
//
// ### enginemill.loadInitializers
// Typically you can just allow `enginemill.load` to call
// `enginemill.loadInitializers`, but in case you need to extend it, or call
// it separately, it is available as `enginemill.loadInitializers`.
//
// name             | description
// ---------------- | ---
// __app__          | *Application instance* The initialized Application Object.
// __initializers__ | *Array* List of Strings or Functions.
//
// __Returns__ A Promise for the Application instance after all initializers
// have been executed in order.
//
// #### Example
// Good example of an initializer which sets configuration settings:
// ```CoffeeScript
// module.exports = (app) ->
//     # app.environment is set with the --environment option, or the
//     # NODE_ENV environment variable.
//     app.configs.port = if app.environment is 'production' then 8080 else 3000
//
//     # Set the public path to '../public'
//     app.configs.public_path = app.appdir.append 'public'
// ```
enginemill.loadInitializers = function (args) {
  var
  initializers, app, dir;

  if (!args.initializers) {
    initializers = [];
  } else {
    initializers = Array.isArray(args.initializers) ?
                   args.initializers : [args.initializers];
  }

  app = args.app;
  dir = app.appdir.append(enginemill.DEFAULTS.INITIALIZER_PATH);

  return initializers

    .map(function (module, index) {
      var path, message;

      if (typeof module === 'string') {
        path = dir.append(module).toString();
        try {
          module = require(path);
        } catch (moduleError) {
          if (moduleError.code === 'MODULE_NOT_FOUND') {
            throw new Error('Initializer module not found: '+ path);
          }
          throw moduleError;
        }
      }

      if (typeof module !== 'function') {
        message = path ? ('path '+ path) : ('index '+ index);
        throw new Error('Initializers must be functions: '+ message);
      }

      return module;
    })

    .reduce(function (promise, module) {
      return promise.then(function (app) {
        return Promise.resolve(module(app)).then(U.constant(app));
      });
    }, Promise.resolve(args.app));
}

enginemill.db = objects.factory(mixins.DBConnector, {
  initialize: function (spec) {
    this.factories = spec.factories;
  },

  factory: function (data) {
    var factory = this.factories[data.name];
    if (!factory) {
      throw new Error('Missing factory for "' + data.name + '"');
    }
    return factory(data);
  }
});
