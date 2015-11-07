// Enginemill
// ==========
// Enginemill is a Node.js web development framework. The goal is to codify
// some opinions about how to structure a Node.js system and provide
// tools to make the development of your systems easier and more fun.
//
// * [Bluebird](https://github.com/petkaantonov/bluebird) for Promises.
// * [Lodash](https://lodash.com/) (Underscore) too.
// * [Filepath](https://github.com/kixxauth/filepath) to work with the filesystem.
// * Parses command line options with [Yargs](https://github.com/bcoe/yargs).
// * Serially loads plugins you define and kicks off your app only when they have all loaded.
// * Comprehensive logging based on [Bunyan](https://github.com/trentm/node-bunyan).
// * Includes a handy Promisified [request](https://github.com/request/request) wrapper for making HTTP requests.
// * Supports [CoffeeScript](http://coffeescript.org/) out of the box, which is nice for config and plugin initialization files.
//
// This documentation is generated from [annotated source code](https://github.com/kixxauth/enginemill) which you
// can find on GitHub. Ideas, issues, and feedback is welcome on the
// [issue tracker](https://github.com/kixxauth/enginemill/issues).

// Enginemill runs with [strict mode](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode) on.
'use strict';

// The `exports` Object is assigned to `enginemill` for readability.
var enginemill = exports;

//
// Dependencies
// ------------

// ### enginemill.Promise
// Enginemill uses [Bluebird Promises](http://bluebirdjs.com/docs/getting-started.html) to handle asynchronous programming
// from start to finish and exposes it as `enginemill.Promise` for you.
enginemill.Promise = require('Bluebird');
var Promise        = enginemill.Promise;

// ### enginemill.U
// Enginemill also uses [Lodash](https://lodash.com/) as the default JavaScript utility library,
// and adds some extensions from [BRIXX](https://github.com/kixxauth/brixx) as well. Notice that lodash is exported
// as the `U` symbol instead of the `_` symbol. This is because the underscore
// "\_" is used by many programmers to indicate a "private" symbol. Enginemill
// holds the opinion that very rarely should anything be "private" in
// JavaScript, but nevertheless, it's usage is prevalent. Also, the "\_" is used
// in the Node.js REPL to contain the value of the last executed statement.
// Finally, the "U" symbol is appropriate for Lodash, since it is
// commonly used in set theory.
enginemill.U = require('lodash');
var U     = enginemill.U;
var BRIXX = require('brixx');

// ### Lodash Extensions
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
// A different way to stringify an Object, other than .toString():
// 1. Returns an empty string for null, undefined or NaN.
// 2. Returns the special '[object Function]' String for Functions.
// 3. Returns the result of .toString() if it exists.
// 4. Returns the result of Object.prototype.toString.
//
// #### enginemill.U.factory()
// An object factory which uses the mixin pattern. Returns a Function which
// will create new Objects using a prototype composed of the mixins passed in.
// See the __Factories and Mixins__ section for more information.
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
var filepath        = enginemill.filepath;

// ### Private Dependencies
// Enginemill depends on the handy [debug](https://github.com/visionmedia/debug) utility for Application#debug(),
// [Yargs](https://github.com/bcoe/yargs) for parsing command line arguments in `enginemill.load()`,
// [node-uuid](https://github.com/broofa/node-uuid) in the JSONFileDatabase,
// and [request](https://github.com/request/request) in the `enginemill.Request` utility.
var
util     = require('util'),
debug    = require('debug'),
nodeUUID = require('node-uuid'),
REQ      = require('request'),
Yargs    = require('yargs');

// Error Handling
// --------------
// Enginemill makes robust exception handling
// easy with [Bluebird's catch](http://bluebirdjs.com/docs/api/catch.html),
// allowing you to properly segment your exception handling based on
// [operational and programmer errors](https://www.joyent.com/developers/node/design/errors).

// ### enginemill.Errors
// The Standard Enginemill Error constructors are all exposed on `enginemill`
// via the `Errors` namespace, allowing you to easily use them to handle
// specific Error classes with [Bluebird's catch](http://bluebirdjs.com/docs/api/catch.html).
enginemill.Errors = Object.create(null);
var Errors        = enginemill.Errors;

// #### enginemill.Errors.OperationalError
// A superclass for all other Operational Errors and used by itself
// as a general operational exception indicator.
function OperationalError(message) {
  Error.call(this);
  Error.captureStackTrace(this, this.constructor);
  this.name = this.constructor.name;
  this.message = message;
}
util.inherits(OperationalError, Error);
enginemill.Errors.OperationalError = OperationalError;

// #### enginemill.Errors.NotImplementedError
// Useful for parts of a program which are not implemented yet. Exported
// publically as `enginemill.Errors.NotImplementedError`
function NotImplementedError(message) {
  Error.call(this);
  Error.captureStackTrace(this, this.constructor);
  this.name = this.constructor.name;
  this.message = message;
}
util.inherits(NotImplementedError, OperationalError);
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
util.inherits(NotFoundError, OperationalError);
enginemill.Errors.NotFoundError = NotFoundError;

// #### enginemill.Errors.JSONParseError
// Handle the special case of parsing JSON. Exported publically as
// `enginemill.Errors.JSONParseError`
function JSONParseError(message) {
  Error.call(this);
  Error.captureStackTrace(this, this.constructor);
  this.name = this.constructor.name;
  this.message = message;
}
util.inherits(JSONParseError, OperationalError);
enginemill.Errors.JSONParseError = JSONParseError;

// ### enginemill.oddcast
// Enginemill incudes the [oddcast](https://github.com/oddnetworks/oddcast)
// library for passing messages between system components. This makes it easy
// to keep your system components decoupled for true Store/Index/Query/
// Presenter architecture.
enginemill.oddcast = require('oddcast');
var oddcast = enginemill.oddcast;

// Application Loading
// -------------------
// Enginemill uses your applications package.json combined wth command line
// to create a preconfigured Application Object. Once the Application Object
// has been constructed, it is passed into each of your registered
// initializers. After each handler has initialized, the your application is
// ready to begin execution.

// ### CoffeeScript
// Enginemill registers the [CoffeeScript](http://coffeescript.org/) compiler before loading or
// initializing your program. This way you can use CoffeeScript to write your
// configuration and initialization files. In fact, you could use CoffeeScript
// to write your whole program, but Enginemill holds the opinion that programs
// are better written in JavaScript, while it can still be convenient to use
// CoffeeScript to write your configuration files.
require('coffee-script').register();

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
// |- store
// |  |- models.js
// |  `- index.js
// |- query
// |  |- author_profile.js
// |  `- article.js
// |- index
// |  |- author_profile.js
// |  `- article.js
// |- presenters
// |  |- users.js
// |  `- posts.js
// |- middleware
// |  |- auth_token.js
// |  `- api_response.js
// |- server.js
// `- package.json
// ```
// #### Arguments
// name                  | description
// --------------------- | ---
// __appdir__       | *FilePath* Defaults to the directory of the currently executing script.
// __name__         | *String* Defaults to the package.json "name" attribute.
// __version__      | *String* Defaults to the package.json "version" attribute.
// __usageString__  | *String* Used as the usage message on the command line if present.
// __helpString__   | *String* Used as the help message on the command line if present.
// __options__      | *Object* Command line parsing configurations.
// __argv__         | *Object* Will be used instead of command line argv if present.
// __environment__  | *String* Will be used instead of command line environment if present.
// __initializers__ | *Array* of initializers (*Strings* or *Functions*).
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
enginemill.load = function (args) {
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

  // #### Asynchronous Application Loading
  // Once the `appdir` has been determined, the process is asynchronously
  // loaded by executing in order through a chained series of Promise handlers.
  // The first Promise in the chain is simply contructing an arguments Object
  // hash to pass through the rest of the chain.
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
  // #### Read package.json
  // After determining the root application directory and constructing the
  // arguments hash the package.json is
  // read and will be available as `app.packageJSON`. The `app.name` and
  // `app.version` are also determined by the package.json, but can be
  // overridden with `args.name` and `args.version`.
    .then(function loadPackageJSON(args) {
      var path = args.appdir.append('package.json');
      return enginemill.readJSON({path: path}).then(function (res) {
        args.packageJSON = res || null;
        return args;
      });
    })
  // #### Command Line Options Parsing
  // Next, the command line arguments are parsed based on the `args.options`
  // Object passed in. The parsed command line arguments will be available on
  // the Application instance as `app.argv`. If `args.argv` was passed into
  // `enginemill.load()`, this
  // step will be skipped and it will be assigned to `app.argv` instead.
  // Command line options parsing is directed by the `args.options` Object
  // passed into `enginemill.load()`, as well as the `args.usageString` and
  // `args.helpString`.
  //
  // The `args.options` hash passed into `enginemill.load()` should contain a hash
  // of arguments with an object for each value containing:
  // - alias - String
  // - describe - Description String
  // - demand - Boolean
  // - type - String ("boolean"|"string")
  // - default - Any value
  //
  // __Example:__
  //
  // ```JS
  // enginemill.load({
  //   options: {
  //     environment: {
  //       describe: "The environment setting.",
  //       type: "string",
  //       default: "development"
  //     },
  //     verbose: {
  //       alias: "v",
  //       describe: "Set logging on.",
  //       type: "boolean"
  //     }
  //   }
  //   initializers: [
  //     'configs',
  //     'middleware'
  //   ]
  // })
  // ```
    .then(function loadCommandLineArgs(args) {
      var options = Yargs
        .reset()
        .usage(args.usageString)
        .help('help', args.helpString);

      if (args.options && typeof args.options === 'object') {
        Object.keys(args.options).forEach(function (key) {
          var
          conf = args.options[key];
          options = options.option(key, conf);
        });
      }

      args.argv = options.parse(process.argv);
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
  // #### Create the Application Instance
  // With the package.json, command line arguments, and environment setting
  // in hand, the load process will create an Application instance. The
  // Application instance will be passed into all the initialization functions
  // and should be referenced in your application simply as `app`. The
  // Application instance will include usefull attributes like `app.name` and
  // `app.environment` as well as the `app.argv` Object containing the parsed
  // command line arguments. In your initializers, you'll probably want to
  // extend the `app.configs` and `app.API` Objects to provide useful
  // references for the rest of your program.
    .then(function createApplication(args) {
      var packageJSON = args.packageJSON || Object.create(null);

      args.app = Application.create({
        name        : args.name ||
                      packageJSON.name ||
                      enginemill.DEFAULTS.APP_NAME,
        version     : args.version ||
                      packageJSON.version ||
                      enginemill.DEFAULTS.APP_VERSION,
        appdir      : args.appdir,
        packageJSON : args.packageJSON,
        environment : args.environment,
        argv        : args.argv
      });

      return args;
    })
  // #### Load Initializers
  // After the Application instance has been created the initializers are
  // loaded and executed in serial. The initializers to are defined by
  // the `args.initializers` Array passed into `enginemill.load()`. See
  // the __Initializer Loading__ section for more information.
    .then(function loadInitializers(args) {
      return enginemill.loadInitializers(args);
    })

  // #### Return a Promise
  // Finally `enginemill.load()` returns a Promise for the Application instance.
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

// ### enginemill.Application
// The Application object is constructed during the `enginemill.load()`
// routine and is passed into your initilizers. After all your initializers
// have executed the Application instance is returned in the Promise returned
// from `enginemill.load()`. See the __Initializer Loading__ section for more
// information. From there, best practice is to pass it into the
// other components of your program.
//
// ##### enginemill.Application instance properties
// __#name__ *String* The name of your application. The name is taken from the
// `args.name` value passed into `enginemill.load()` or automatically taken
// from your package.json.
//
// __#version__ *String* The version of your application. The version is taken
// from the `args.version` value passed into `enginemill.load()` or
// automatically taken from your package.json.
//
// __#appdir__ *FilePath* The FilePath instance representing the root directory
// of your application. See the __appdir__ section for more information.
//
// __#packageJSON__ *Object* Your application package.json parsed into an
// Object.
//
// __#environment__ *String* The environment setting. See the __Environment
// Setting__ section for more information.
//
// __#configs__ *Object* A blank Object where you should set your configuration
// settings in initializers.
//
// __#argv__ *Object* An Object containing your parsed command line options.
// See __Command Line Option Parsing__ for more information.
//
// __#logger__ *Object* The application logger instance. See the __Logging__
// section for more information.
//
// __#API__ *Object* A blank object for you to attach your plugins to in
// initiallizers.
//
// ##### enginemill.Application instance methods
// __#debug(name)__ A proxy to the node-debug tool. Pass in a String name and
// it will return a new debugger bound to it by `debug(name + ':' + name)`.
function Application() {}
enginemill.Application = Application;

U.extend(Application.prototype, {

  initialize: function (spec) {
    Object.defineProperties(this, {
      name: {
        enumerable: true,
        value: spec.name
      },
      version: {
        enumerable: true,
        value: spec.version
      },
      appdir: {
        enumerable: true,
        value: spec.appdir
      },
      packageJSON: {
        enumerable: true,
        value: spec.packageJSON ? U.deepFreeze(spec.packageJSON) : null
      },
      environment: {
        enumerable: true,
        value: spec.environment
      },
      configs: {
        enumerable: true,
        value: Object.create(null)
      },
      argv: {
        enumerable: true,
        value: U.deepFreeze(U.ensure(spec.argv))
      },
      logger: {
        enumerable: true,
        value: Logger.create({
          appname: spec.name
        })
      },
      API: {
        enumerable: true,
        value: Object.create(null)
      },
      debug: {
        enumerable: true,
        value: function (name) {
          return debug(name + ':' + name);
        }
      }
    });
  }
});

Application.create = U.factory(Application.prototype);

// ### Initializer Loading
// The initialization loader requires and loads all initializers passed in as
// Strings. Initailization modules must export a Function with
// `module.exports = function () { ... }`.
// Initialization Functions may also be passed in and will be used
// directly.
//
// After the initializer functions are loaded they are exectuted serially in
// order. Each initializer function is passed a single argument; the
// Application instance. Extending the `app.configs` or `app.API` Objects
// is a great use of an initializer. It is expected that initializers will
// complete aysnchronously, and if so, they should return a Promise.
//
// __Example__
//
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
//
// ### enginemill.loadInitializers
// Typically you can just allow `enginemill.load` to call
// `enginemill.loadInitializers`, but in case you need to extend it, or call
// it separately, it is available as `enginemill.loadInitializers`.
//
// #### Arguments
// name             | description
// ---------------- | ---
// __app__          | *Application instance* The initialized Application Object.
// __initializers__ | *Array* List of Strings or Functions.
//
// __Returns__ A Promise for the Application instance after all initializers
// have been executed in order.
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
};

// Factories and Mixins
// --------------------
// Enginemill includes an Object factory mixed into lodash as
// `enginemill.U.factory()`. This factory creator accepts any number of mixins,
// plus your own prototype definitions to compose factory functions for
// Objects.
//
// ### Creating Factories
// `enginemill.U.factory()` returns a Function which
// will create new Objects using a prototype composed of the mixins passed in.
// The returned Object factory Function will automatically call initialize()
// on your object instance. If there is an initialize() function defined on any
// of the mixins, they will also be called, in order, before your mixin.
//
// __Example:__
//
// ```JS
// var newWidget = enginemill.U.factory(enginemill.Mixins.Model, {
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
// ### Mixins
// #### enginemill.Mixins.Model
// An Object mixin for creating Immutable models. Define a set of default
// values in your definition and the keys will be used to enforce assignment
// rules on the instance. Includes a mechnanism for naming the type for your
// model, as well as assigning an ID.
//
// __Example:__
//
// ```JS
// var newWidget = enginemill.U.factory(enginemill.Mixins.Model, {
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
//
// var widget = newWidget({width: 4, height: 4});
// widget.area(); // 16
// ```
// Setting the defaults Object hash determines not only what the default
// values will be for the keys, but also which keys are allowed on an instance
// of this model. Using #set() to set a key which was not defined in the
// defaults hash will throw an error.
//
// ##### enginemill.Mixin.Model instance properties
// __#name__ A frozen enumerable property. Used in #toString() and #diff().
//
// __#idAttribute__ A non-enumerable prototype property used to determine the
// ID.
//
// ##### enginemill.Mixin.Model instance methods
// __#has(key)__ Check to see if the model instance has the given key,
// regardless of if it is defined or not.
//
// __#hasId()__ Check to see if the ID property defined by #idAttribute is
// present.
//
// __#set(values)__ Pass in an Object hash of key/value pairs to set.
// Attempting to set a key which was not defined in the defaults will throw an
// Error. Returns a new instance of the model.
//
// __#diff(otherInstance)__ Pass in another model instance to determine if they
// are different. Returns `null` if they are the same, or an Array of
// differences if they are not. Each item in the diff Array is another Array
// containing [key, selfValue, otherValue].
//
// __#toJSON()__ Returns a new Object containing all the key/value pairs
// defined on this model instance. This makes
// `JSON.stringify(myModelInstance)` work as you would expect.
//
// __#toString()__ Returns a special String representation of this model
// instance.
enginemill.Mixins = {
  Model: BRIXX.Model
};

// Logging
// -------
// Enginemill includes an application level logging system out of the box. It
// is designed to be easy to extend, or even to not use at all. It does this
// by emitting logging events on an Oddcast broadaster, which you can listen
// to with any other logging tools you'd like to use.
//
// The logging calls are taken by the Bunyan logging tool, and then the
// resulting log records created by Bunyan are emitted through the
// broadcaster. By default the logging system is initialized with a listener
// which simply writes the Bunyan log records as JSON to stdout.
//
// You can set your own listeners, or turn off logging altogether, by calling
// #configure() on the logger.
//
// You create new loggers by calling #create() on the logger instance.
//
// __Example:__
//
// ```JS
// // Pass in the Application instance to a Store submodule.
// exports.create = function (app) {
//   var logger = app.logger.create({store: 'users'});
//
//   logger.trace('a trace message');
//   // {"name":"myapp","hostname":"myhost","pid":34572,"store":"users","level":10,"msg":"a trace message","time":"2013-01-04T07:47:25.814Z","v":0}
//
//   logger.debug({modelName: 'Widget'}, 'a widget');
//   // {"name":"myapp","hostname":"myhost","pid":34572,"store":"users","level":20,"modelName":"Wdiget",msg":"a widget","time":"2013-01-04T07:47:25.815Z","v":0}
//
//   logger.info('hi %s', 'John');
//   // {"name":"myapp","hostname":"myhost","pid":34572,"store":"users","level":30,"msg":"hi John","time":"2013-01-04T07:47:25.814Z","v":0}
//
//   logger.warn('A warning');
//   // {"name":"myapp","hostname":"myhost","pid":34572,"store":"users","level":40,"msg":"A warning","time":"2013-01-04T07:47:25.814Z","v":0}
//
//   logger.error(err);
//   // Special case to log an `Error` instance to the record.
//   // This adds an "err" field with exception details
//   // (including the stack) and sets "msg" to the exception
//   // message.
//
//   logger.fatal(err, 'a message about this error');
//   // Almost the same as above, but will specify the msg portion of the
//   // log record.
// }
// ```
// ### enginemill.Logger
// An instance of `enginemill.Logger` will be placed on the Application
// instance as `app.logger`.
//
// ##### enginemill.Logger instance methods
// __#configure(args)__ Reconfigure the default logging setup.
//
// `args.level` Should be a string to set the global log level. One of
// "TRACE", "DEBUG", "INFO", "WARN", "ERROR", "FATAL".
//
// If `args.useDefaultObserver` is `false` the default observer will be
// removed and the logger will no longer write to stdout. If
// `args.useDefaultObserver` is `true` the logger will reset the default
// observer and write to stdout.
//
// __#create(attributes)__ Creates a new logger which will always log the
// given attributes.
//
// #### Adding Log Record Observers
// Adding your own observers is simple; just pass a pattern and handler
// function into `app.logger.channel.observe()` like so:
// ```CoffeeScript
// # In logging.coffee initializer:
// module.exports = (app) ->
//   # Observe only error log records
//   errors = require('../lib/logging_error_handler').create(app)
//   app.logger.channel.observe {role: 'logging', level: 'error'}, errors
// ```
function Logger() {}
enginemill.Logger = Logger;

U.extend(Logger.prototype, {

  initialize: function (args) {
    this.channel = oddcast.eventChannel();
    this.channel.use({role: 'logging'}, oddcast.inprocessTransport());

    this.logger = Logger.bunyan.createLogger({
      name: args.appname
    });

    this.logger.streams = [];
    this.logger.addStream({
      type: 'raw',
      stream: new Logger.EmitterRawStream({
        channel: this.channel
      }),
      closeOnExit: false
    });

    this.defaultObserver = function (rec) {
      process.stdout.write(JSON.stringify(rec));
    };

    this.channel.observe({role: 'logging'}, this.defaultObserver);
  },

  configure: function (configs) {
    configs = U.ensure(configs);

    if (U.isBoolean(configs.useDefaultObserver)) {
      if (configs.useDefaultObserver) {
        this.channel.remove({role: 'logging'}, this.defaultObserver);
        this.channel.observe({role: 'logging'}, this.defaultObserver);
      } else {
        this.channel.remove({role: 'logging'}, this.defaultObserver);
      }
    }

    if (configs.level) {
      this.logger.level(configs.level);
    }
  },

  create: function (attributes) {
    return this.logger.child(attributes);
  }
});

Logger.create = U.factory(Logger.prototype);

// #### enginemill.Logger log levels:
// Logger.FATAL = 'fatal'
// Logger.ERROR = 'error'
// Logger.WARN  = 'warn'
// Logger.INFO  = 'info'
// Logger.DEBUG = 'debug'
// Logger.TRACE = 'trace'
Logger.FATAL = 'fatal';
Logger.ERROR = 'error';
Logger.WARN  = 'warn';
Logger.INFO  = 'info';
Logger.DEBUG = 'debug';
Logger.TRACE = 'trace';

Logger.PATTERNS = {
  FATAL : {role: 'logging', level: Logger.FATAL},
  ERROR : {role: 'logging', level: Logger.ERROR},
  WARN  : {role: 'logging', level: Logger.WARN},
  INFO  : {role: 'logging', level: Logger.INFO},
  DEBUG : {role: 'logging', level: Logger.DEBUG},
  TRACE : {role: 'logging', level: Logger.TRACE}
};

Logger.bunyan = require('bunyan');

function EmitterRawStream(spec) {
  this.channel = spec.channel;
}
EmitterRawStream.prototype.write = function (rec) {
  var level = Logger.bunyan.nameFromLevel[rec.level].toUpperCase();
  this.channel.broadcast(Logger.PATTERNS[level], rec);
};

Logger.EmitterRawStream = EmitterRawStream;

function DatabaseConnector() {}
enginemill.DatabaseConnector = DatabaseConnector;

U.extend(DatabaseConnector.prototype, {
  initialize: function (spec) {
    this.engine    = spec.engine;
    this.factories = spec.factories;
  },

  get: function (id, options) {
    options = options || Object.create(null);
    var self = this;
    return this.engine.get(id, options).then(function (data) {
      return self.factory(data);
    });
  },

  post: function (entity, options) {
    options = options || Object.create(null);
    var
    self   = this,
    record = this.serialize(entity);
    return this.engine.post(record, options).then(function (data) {
      return self.factory(data);
    });
  },

  put: function (entity, options) {
    options = options || Object.create(null);
    var
    self   = this,
    record = this.serialize(entity);
    return this.engine.put(record, options).then(function (data) {
      return self.factory(data);
    });
  },

  remove: function (id, options) {
    options = options || Object.create(null);
    return this.engine.remove(id, options);
  },

  factory: function (data) {
    var factory = this.factories[data.name];
    if (!factory) {
      throw new Error('Missing factory for "' + data.name + '"');
    }
    return factory(data);
  },

  serialize: function (entity) {
    var record  = Object.create(null);
    record.id   = entity.id;
    record.data = entity;

    if (typeof entity.toJSON === 'function') {
      record.data = entity.toJSON();
    } else if (typeof entity.valueOf === 'function') {
      record.data = entity.valueOf();
    }

    if (entity.idAttribute) {
      record.id = entity[entity.idAttribute];
    }

    return record;
  }
});

DatabaseConnector.create = U.factory(DatabaseConnector.prototype);

function JSONFileDatabase() {}
enginemill.JSONFileDatabase = JSONFileDatabase;

U.extend(JSONFileDatabase.prototype, {

  initialize: function (args) {
    if (!args.dir) {
      throw new Error('args.dir is required for JSONFileDatabase');
    }

    this.nodeId = args.nodeId;
    this.dir = filepath.create(args.dir);
  },

  get: function (id) {
    if (!id) {
      throw new Error('SimpleFileDB#get() requires an ID argument');
    }
    var file = this.dir.append(id + '.json');
    return Promise.resolve(file.read().then(function (text) {
      var err;
      if (text) {
        return JSON.parse(text);
      }
      err = new Errors.NotFoundError('Could not find record with id "' + id + '"');
      return Promise.reject(err);
    }));
  },

  post: function (record) {
    if (record.id) {
      throw new Error('SimpleFileDB#post() does not accept a record ID');
    }
    var
    file,
    id = this.uuid();
    record.data.id = id;
    file = this.dir.append(id + '.json');
    return Promise.resolve(file.write(JSON.stringify(record.data)).then(function () {
      return JSON.parse(JSON.stringify(record.data));
    }));
  },

  put: function (record) {
    if (!record.id) {
      throw new Error('SimpleFileDB#put() requires a record with an ID');
    }
    var
    err,
    file = this.dir.append(record.id + '.json'),
    text = JSON.stringify(record.data);

    if (file.isFile()) {
      return Promise.resolve(file.write(text).then(function () {
        return JSON.parse(text);
      }));
    }
    err = new Errors.NotFoundError('Could not find record with id "' + record.id + '"');
    return Promise.reject(err);
  },

  remove: function (id) {
    if (!id) {
      throw new Error('SimpleFileDB#remove() requires an ID argument');
    }

    var
    err,
    file = this.dir.append(id + '.json');

    if (file.isFile()) {
      file.remove();
      return Promise.resolve(id);
    }

    err = new Errors.NotFoundError('Could not find record with id "' + id + '"');
    return Promise.reject(err);
  },

  uuid: function () {
    if (typeof this.nodeId === 'string' || typeof this.nodeId === 'number') {
      return nodeUUID.v1({node: this.nodeId});
    }
    return nodeUUID.v1();
  }
});

JSONFileDatabase.create = U.factory(JSONFileDatabase.prototype);

// Utilities
// ---------

enginemill.Request = {

  request: function (uri, opts, makeRequest) {
    makeRequest = makeRequest || REQ;
    var
    req, promise, resolve, reject, params;

    promise = new Promise(function (res, rej) {
      resolve = res;
      reject = rej;
    });

    params = REQ.initParams(uri, opts, function (err, res, body) {
      if (err) {
        return reject(err);
      }

      Object.defineProperties(res, {
        body: {
          enumerable : true,
          value      : body
        }
      });
      return resolve(res);
    });

    params.followRedirect = params.followRedirect || false;
    params.encoding = typeof params.encoding === 'string' ? params.encoding : null;
    req = makeRequest(params, params.callback);
    req.promise = promise;
    return req;
  },

  get: function (uri, opts) {
    return this.request(uri, opts, REQ.get.bind(REQ));
  },

  post: function (uri, opts) {
    return this.request(uri, opts, REQ.post.bind(REQ));
  },

  put: function (uri, opts) {
    return this.request(uri, opts, REQ.put.bind(REQ));
  },

  del: function (uri, opts) {
    return this.request(uri, opts, REQ.del.bind(REQ));
  },

  patch: function (uri, opts) {
    return this.request(uri, opts, REQ.patch.bind(REQ));
  },
};

// ### enginemill.readJSON
// A utility function used by Enginemill to read JSON files, but available
// on the public API as well.
//
// #### Arguments
// name                  | description
// --------------------- | ---
// __path__ | *FilePath instance* The path to the JSON file to load.
//
// __Returns__:
// - A Promise for parsed JSON file if it exists.
// - If it does not exist then returns a Promise for null.
// - If there is a JSON syntax error detected a JSONReadError is
//   returned via rejection.
// - If the given path is not a file an Error is
//   passed via rejection.
enginemill.readJSON = function (args) {
  var path = args.path;

  function parseJSON(text) {
    var err, data;
    try {
      data = JSON.parse(text +'');
    } catch (e) {
      err = new Errors.JSONReadError('JSON SyntaxError: '+ e.message +' in '+ path);
      return Promise.reject(err);
    }
    return data;
  }

  function setValues(data) {
    return U.extend(Object.create(null), data || Object.create(null));
  }

  function catchFileReadError(err) {
    var newError = new Errors.OperationalError('Unexpected JSON read Error: '+ err.message);
    newError.code = err.code;
    return Promise.reject(newError);
  }

  if (path.exists() && path.isFile()) {
    return Promise.resolve(path.read())
      .then(parseJSON, catchFileReadError)
      .then(setValues);
  } else if (!path.exists()) {
    return Promise.resolve(null);
  }
  return Promise.reject(
    new Error('The FilePath is not a file: '+ path));
};

// Store/Query/Presenter Architecture
// ----------------------------------
// Enginemill holds a string opinion that Command/Query
// Responsibility Segregation ([CQRS](http://martinfowler.com/bliki/CQRS.html))
// is essential to allow developers to reason about otherwise complex systems.
// Strict adherence to CQRS should lead to a Store/Query/Presenter
// architecture as suggested by Enginemill.
//
// ### Message Based Communication
// Having a built in message based communication system makes Store/Query/
// Presenter possible. See `enginemill.oddcast` for more info.
//
// Examples:
//
// #### Broadcast Channel
// A Broadcast Channel broadcasts events throughout the system to anyone who
// might be listening.
// ```JS
// var oddcast = require('oddcast');
// var transport = require('my-transport');
// var events = oddcast.eventChannel();
// events.use({role: 'store'}, transport({
//     url: 'http://mypubsub.io/channel/1'
//   }));
//
// events.observe({role: 'store', op: 'write', type: 'video'}, function (args) {
//   writeIndexRecord(args.entity.key, args.entity);
// });
// ```
// And in some other code, somewhere else ...
// ```JS
// var oddcast = require('oddcast');
// var transport = require('my-transport');
// var events = oddcast.eventChannel();
// events.use({role:'store'}, transport({
//     url: 'http://mypubsub.io/channel/1'
//   }));
//
// // When a record is saved to the datastore, we broadcast it.
// events.broadcast({
//     role: 'store',
//     type: entity.type,
//     op: 'write',
//     entity: entity
//   });
// ```
//
// #### Command Channel
// A Command Channel is used for directed messages, with the expectation that
// the receiving component will take a specified action. The underlying
// transport under a command channel will usually be a message queue.
// ```JS
// var oddcast = require('oddcast');
// var transport = require('my-transport');
// var commands = oddcast.commandChannel();
// commands.use({role: 'ingest'}, transport({
//     url: 'http://myqueue.io/queue/1'
//   }));
//
// commands.receive({role: 'ingest', type: 'video'}, function (args) {
//   var entity = transformItem(args.item);
//   var promise = saveEntity(entity).then(function () {
//     // We return true so the queue knows this message has been processed.
//     return true;
//   })
//   .catch(function (err) {
//     log.error(err);
//     // We return false so the queue will keep this message and try
//     // sending it again.
//     return false;
//   });
//
//   return promise;
// });
// ```
// And in some other code, somewhere else ...
// ```JS
// var oddcast = require('oddcast');
// var transport = require('my-transport');
// var commands = oddcast.commandChannel();
// commands.use({role: 'ingest'}, transport({
//     url: 'http://myqueue.io/queue/1'
//   }));
//
// // Fetch data from a remote API and queue it up for the store
// // by sending off a "job" for each one.
// items.forEach(function (item) {
//   commands.send({role: 'ingest', type: item.type, item: item});
// });
// ```
//
// #### Request Channel
// A Request Channel is used when you know who has the data you need, and
// would like to request it from them.
// ```JS
// var oddcast = require('oddcast');
// var transport = require('my-transport');
// var rchannel = oddcast.requestChannel();
// rchannel.use({role: 'views'}, transport({
//     host: '0.0.0.0',
//     port: 8080
//   }));
//
// rchannel.respond({view: 'homePage'}, function () {
//   return {
//     featuredVideo: getFeaturedVideo(),
//     recentlyAdded: getRecentlyAdded(),
//     season: getShowSeason()
//   };
// });
// ```
// // And in some other code, somewhere else ...
// ```JS
// var oddcast = require('oddcast');
// var transport = require('my-transport');
// var rchannel = oddcast.requestChannel();
// rchannel.use({role: 'views'}, transport({
//     url: 'http://mymicroservice.io:8080/endpoint/1'
//   }));
//
// // Respond to an HTTP request by querying your view.
// Router.get('/', function (req, res) {
//   rchannel
//     .request({role: views, view: 'homePage'})
//     .then(function (viewData) {
//       res.render('homePage.html', viewData);
//     });
// });
// ```

