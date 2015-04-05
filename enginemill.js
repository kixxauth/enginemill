/*
Main Module: Introduction
-------------------------
The goal of Enginemill is to establish some opinionated conventions in Node.js
application development. It does this by providing an application host
framework to wrap your guest application. Enginemill provides a single
executable script that starts Node.js, loads configuration settings, loads
plugins and then loads your application with some core dependencies
already injected.

### Where is Everything?
The first, and most important convention that Enginemill establishes is a
structured and standardized way of organization an application. See the
Structure section below for more info.

### Object factories
The second convention is that of Object factories which provide a way for the
application developer to compose mixins into Object constructors for Object
Oriented Programming. This throws away the classical approach to OOP which has
historically been forced on JavaScript application development. See the
./lib/objects module for more info.

### Promises for Asynchronous Operations
The second convention is an expectation that all asynchronous operations will
be implemented and performed with Promises. See the ./lib/promise module for
more info.

Additionally Enginemill provides tools for performing longer operations using
Promise chains. One of these is the Action mixin. See the ./lib/mixins/action
mixin for more info.

### Globals
The third convention is that sprinkling in a few useful globals is OK and
very useful. Enginemill adds globals to the GLOBAL object sparingly. See the
Globals section below for more info.

### Standardized Configuration
The fourth convention is a standardized way of loading configuration settings.
Enginemill loads configurations with an awareness of the current environment
the guest applicaiton is running in and allows settings to override in a smart
way to provide application developers fine grained control over the
configuration settings that control the application.

### Plugins
The fifth convention is a strict initialization sequence which initializes
plugins when they are configured in a standardized way and listed in the
expected places.
*/

/*
Structure
---------
Host application directory structure:

  |-- package.json
  |-- app.js
  |-- web/
  |  |-- routes.js
  |  |-- controllers/
  |  `-- public/
  |-- lib/
  |  |-- mixins
  |  |-- dataservice
  |  |-- models
  |  `-- actions
  |-- plugins/
  |  `-- <plugin_name...>
  `-- node_modules/
     `-- <plugin_name...>

*/
var
FilePath = require('filepath').FilePath,
Yargs    = require('yargs'),
U        = require('./lib/u'),
Promise  = require('./lib/promise'),
Objects  = require('./lib/objects'),
Plugin   = require('./lib/plugin'),
Action   = require('./lib/mixins/action').Action,
newAPI   = require('./lib/api').newAPI;


/*
The objective of this module is to provide a main entry point to the Enginemill
framework, and provide a way to take certain features a-la-carte or override
them by exposing as much of the functionality publicly on the exports Object.
The standard way to start an application is to call exports.main, which creates
an instance of exports.Runner and runs it with new API and args Objects.
*/
exports.main = function () {
  var
  API, args;

  API = newAPI({
    sysconfigsdir : FilePath.root().append('etc', 'enginemill'),
    usrconfigsdir : FilePath.home().append('.enginemill'),
    appdir        : FilePath.create()
  });
  args = Object.create(null);
  args.configs = Object.create(null);
  return exports.newRunner().run(API, args);
};


exports.module = function (wrapper) {
  wrapper.call(null, exports.API);
};


exports.Runner = {

  COMMANDS: ['help', 'run'],

  initialize: function () {
    this.Args = Yargs;
    this.q('parseCommandline');
    this.q('checkCommand');
    this.q('setScriptPath');
    this.q('checkHelp');
    this.q('setEnvironment');
    this.q('loadEnvironment');
    this.q('loadPlugins');
    this.q('setAPI');
    this.q('runCommand');
  },

  // Parses the commandline arguments and options using the Yargs utility:
  // https://www.npmjs.com/package/yargs
  //
  // Parameters:
  // API  - not used
  // args - A new argv Object will be added as .argv.
  //
  // Expects the Yargs utility to be present as this.Args.
  //
  // Returns the args Object.
  parseCommandline: function (API, args) {
    var
    usage = 'Usage:\n',
    argv;

    usage += "  em help\n";
    usage += "  em help <script_path>";
    usage += "  em run [<script_path>] [--env <environment>] [options]";

    argv = this.Args
      .usage(usage)
      .command('help', 'Get enginemill help or help for an application script.')
      .command('run', 'Run an application script.')
      .option('env', {
        alias    : 'e',
        default  : 'production',
        describe : 'The application runtime environment.',
        type     : 'string'
      })
      .argv;

    args.argv = argv;
    return args;
  },

  // Checks for the positional command argument in parsed argv and takes
  // appropriate action if it is invalid.
  //
  // Params:
  // API  - not used
  // args - A new command String will be added as args.command.
  //
  // Expects this.showHelpAndExit() to be present.
  //
  // Returns the args Object.
  checkCommand: function (API, args) {
    var
    command = args.argv._[0],
    message;
    if (!command) {
      message = "An enginemill command is required.";
    } else if (this.COMMANDS.indexOf(command) < 0) {
      message = "'"+ command +"' is not a valid enginemill command.";
    }
    if (message) {
      message += "\nValid commands are: "+ this.COMMANDS.join(', ');
      this.showHelpAndExit(message);
    }
    args.command = command;
    return args;
  },

  // Checks the command line application script path and sets a default if it
  // is not available.
  //
  // Params:
  // API.appdir - Lookup function that takes a configs Object.
  // args.argv  - The parsed commandline argv.
  //
  // Sets:
  // args.scriptPath - The FilePath object representing the script path.
  //
  // Returns the args Object.
  setScriptPath: function (API, args) {
    var
    path = args.argv._[1];
    args.scriptPath = path ? FilePath.create(path) : API.appdir('app');
    return args;
  },

  // Checks the positional command argument for the help command and takes
  // appropriate action.
  //
  // Params:
  // API          - not users
  // args.command - The command String.
  //
  // Returns the args Object.
  checkHelp: function (API, args) {
    var
    scriptPath = args.argv._[1];
    if (args.command === 'help' && !scriptPath) {
      this.showHelpAndExit();
    } else if (args.command === 'help' && scriptPath) {
      this.showProgramHelpAndExit(API, args.scriptPath);
    }
    return args;
  },

  // Params:
  // args.configs.argv.env
  //
  // Sets:
  // args.environment - The environment String.
  //
  // Returns the args Object.
  setEnvironment: function (API, args) {
    args.environment = args.argv.env || 'production';
    return args;
  },

  // Creates a new LoadEvironment action and runs it.
  //
  // Params:
  // API.appdir        - Lookup function that takes a configs Object.
  // API.sysconfigsdir - Lookup Function that takes a configs Object.
  // API.usrconfigsdir - Lookup Function that takes a configs Object.
  // args              - The args Object.
  //
  // Sets:
  // API.configs     - The configs Object (will be frozen).
  // API.configs.app - The application configs Object (from package.json).
  // GLOBAL.print    - The print utility Function.
  // GLOBAL.U        - The utilities Library.
  //
  // Returns a Promise for the return value of LoadEnvironment#run().
  loadEnvironment: function (API, args) {
    return exports.newEnvironmentLoader().run(API, args);
  },


  // Creates a new LoadPlugins action and runs it.
  //
  // Params:
  // API                           - API Object passed into plugin
  //                                 initializers.
  // API.configs.core_plugins      - A list of core plugin name Strings to load
  // API.configs.installed_plugins - A list of installed plugin name String
  //                                 to Load.
  // API.configs.plugins           - A list of guest application plugin name
  //                                 Strings to load.
  loadPlugins: function (API, args) {
    return exports.newPluginLoader().run(API, args);
  },

  // Params:
  // API  - The API Object as it has been compiled so far.
  // args - The args Object.
  //
  // Sets:
  // args.API    - The new (frozen) API object.
  // exports.API - To args.API.
  //
  // Returns the args Object.
  setAPI: function (API, args) {
    exports.API = args.API = API.freeze();
    return args;
  },

  // Params:
  // API      - The unfrozen API Object.
  // args.API - The new frozen API Object.
  //
  // Returns the args Object.
  runCommand: function (API, args) {
    return exports.newAppRunner().run(args.API, args);
  },

  // Utility method used to show the commandline help text and exit the
  // process.
  // Params:
  // message - The message String to use (optional).
  showHelpAndExit: function (message) {
    if (message) {
      console.error(message);
    }
    console.error(this.Args.help());
    process.exit(1);
  },

  // Utility method used to show the commandline help text for the program
  // script and exit the process.
  //
  // Params:
  // API      - The API Object.
  // filepath - The FilePath instance representing the application script.
  showProgramHelpAndExit: function (API, filepath) {
    var
    scriptModule = exports.RunApp.loadAppModule(null, {
      filepath: filepath
    }).scriptModule;
    exports.RunApp.parseCommandline
      .call(this, API, { scriptModule : scriptModule });
    this.showHelpAndExit();
  }
};

exports.newRunner = Objects.factory([Action], exports.Runner);


/*
Configuration Structure
-----------------------
### Enginemill configs directory structure:

  |-- configs.ini
  `-- plugins/
     `-- <plugin_name...>
       `-- configs.ini

### Guest application configs directory structure:

  |-- package.json
  |-- configs.ini
  |-- plugins/
  |  `-- <plugin_name...>
  |    `-- configs.ini
  `-- node_modules
     `-- <plugin_name...>
       `-- configs.ini

### System configs directory structure:

  /etc/
    `-- enginemill/
      |-- <application_name>.ini
      `-- <application_name>.ini

### User configs directory structure:

  ~/
    `--.enginemill/
      |-- <application_name>.ini
      `-- <application_name>.ini

*/
exports.LoadEnvironment = {

  initialize: function () {
    this.q('registerCoffeeScript');

    this.q('loadCoreConfigs');
    this.q('readAppSettings');
    this.q('loadAppConfigs');
    this.q('combinePlugins');
    this.q('loadPluginConfigs');

    // Set the environment
    this.q('setConfigs');
    this.q('setGlobals');
  },

  // Returns true.
  registerCoffeeScript: function () {
    require('coffee-script').register();
    return true;
  },

  // Params:
  // API  - Not used.
  // args - Will set the args.core_configs.
  //
  // Sets:
  // args.coreConfigs - Config Object.
  //
  // Returns a Promise for the args Object.
  loadCoreConfigs: function (API, args) {
    var
    paths = [ FilePath.create(__dirname).append('configs.ini') ];
    return loadConfigsPath(args.configs.environment, paths).then(function (configs) {
      args.coreConfigs = configs;
      return args;
    });
  },

  // Reads the package.json to add application meta info.
  //
  // Params:
  // API.appdir   - Function that takes a configs Object.
  // args.configs - The configs Object (will be mutated with .app).
  //
  // Sets:
  // args.configs.app - Application package.json data.
  //
  // Returns a Promise for the args Object.
  readAppSettings: function(API, args) {
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
  },

  // Params:
  // API.appdir            - Function that takes a configs Object.
  // API.sysconfigsdir     - Function that takes a configs Object.
  // API.usrconfigsdir     - Function that takes a configs Object.
  // args.configs.app.name - Name String of the application.
  //
  // Sets:
  // args.appConfigs - Configs Object.
  //
  // Returns a Promise for the args Object.
  loadAppConfigs: function (API, args) {
    var
    appname = args.configs.app.name,
    paths = [
      API.appdir(args.configs).append('configs.ini'),
      API.sysconfigsdir(args.configs).append(appname +'.ini'),
      API.usrconfigsdir(args.configs).append(appname +'.ini')
    ];

    return loadConfigsPath(args.configs.environment, paths).then(function (configs) {
      args.appConfigs = configs;
      return args;
    });
  },

  // Params:
  // API              - Not used.
  // args.coreConfigs - The core configs Object.
  // args.appConfigs  - The app configs Object.
  //
  // Sets:
  // args.configs.core_plugins      - Array list of plugin name Strings.
  // args.configs.installed_plugins - Array list of plugin name Strings.
  // args.configs.plugins           - Array list of plugin name Strings.
  //
  // Returns the args Object.
  combinePlugins: function (API, args) {
    var
    lists = ['core_plugins', 'installed_plugins', 'plugins'];

    args.configs.core_plugins = [];
    args.configs.installed_plugins = [];
    args.configs.plugins = [];

    lists.forEach(function (list) {
      args.configs[list] = args.configs[list].concat(args.coreConfigs[list]);
      args.configs[list] = args.configs[list].concat(args.appConfigs[list]);
    });

    return args;
  },

  // Params:
  // API.appdir                     - Function that takes a configs Object.
  // API.sysconfigsdir              - Function that takes a configs Object.
  // API.usrconfigsdir              - Function that takes a configs Object.
  // args.configs.core_plugins      - An Array of plugin String names.
  // args.configs.installed_plugins - An Array of plugin String names.
  // args.configs.plugins           - An Array of plugin String names.
  // args.configs.app.name          - Name String of the application.
  //
  // Sets:
  // args.pluginConfigs - A configs Object from plugin configs.
  //
  // Returns a Promise for the args Object.
  loadPluginConfigs: function (API, args) {
    var
    core_plugins = args.configs.core_plugins,
    installed_plugins = args.configs.installed_plugins,
    plugins = args.configs.plugins,
    confname = 'configs.ini',
    baseDir,
    paths = [];

    if (core_plugins && core_plugins.length) {
      baseDir = FilePath.create(__dirname).append('plugins');
      paths = paths.concat(core_plugins.map(function (plugin) {
        return baseDir.append(plugin, confname);
      }));
    }

    if (installed_plugins && installed_plugins.length) {
      baseDir = API.appdir(args.configs).append('node_modules');
      paths = paths.concat(installed_plugins.map(function (plugin) {
        return baseDir.append(plugin, confname);
      }));
    }

    if (plugins && plugins.length) {
      baseDir = API.appdir(args.configs).append('plugins');
      paths = paths.concat(plugins.map(function (plugin) {
        return baseDir.append(plugin, confname);
      }));
    }

    return loadConfigsPath(args.configs.environments, paths).then(function (configs) {
      args.pluginConfigs = configs;
      return args;
    });
  },

  // Deep freeze the configs Object and assign it to API.configs.
  //
  // Params:
  // API                - API Object will have .configs added.
  // args.coreConfigs   - The enginemill configs Object.
  // args.pluginConfigs - The plugins configs Object.
  // args.appConfigs    - The application configs Object.
  //
  // Sets:
  // API.configs - Frozen configs Object.
  //
  // Returns the API object.
  setConfigs: function (API, args) {
    var
    configs = U.extend(
      args.configs,
      args.coreConfigs,
      args.pluginConfigs,
      args.appConfigs);
    API.configs = U.deepFreeze(configs);
    return API;
  },

  // Sets a few useful globals. Yikes!
  //
  // Params:
  // API.print - The API print Function.
  // API.U     - The API U utility library.
  //
  // Sets:
  // GLOBAL.print - To API.print.
  // GLOBAL.U     - To API.U.
  //
  // Returns the GLOBAL Object.
  setGlobals: function (API, args) {
    return Object.defineProperties(GLOBAL, {
      print : {
        enumerable : true,
        value      : args.API.print,
      },
      U : {
        enumerable : true,
        value      : args.API.U
      }
    });
  }
};

exports.newEnvironmentLoader = Objects.factory([Action], exports.LoadEnvironment);


exports.LoadPlugins = {

  initialize: function () {
    this.q('loadCorePlugins');
    this.q('loadInstalledPlugins');
    this.q('loadAppPlugins');
  },

  // Params:
  // API                      - The API object (it will be mutated)
  // API.configs              - The frozen configs Object
  // API.configs.core_plugins - An Array of plugin name Strings.
  //
  // Returns a Promise for the API Object.
  loadCorePlugins: function (API, args) {
    if (!(args.configs.core_plugins && args.configs.core_plugins.length)) {
      return Promise.resolve(API);
    }
    var
    dir = FilePath.create(__dirname).append('plugins');
    return loadPlugins(API, args.configs, args.configs.core_plugins, dir);
  },

  // Params:
  // API                           - The API object (it will be mutated)
  // API.appdir                    - Lookup Function.
  // API.configs                   - The frozen configs Object
  // API.configs.installed_plugins - An Array of plugin name Strings.
  //
  // Returns a Promise for the API Object.
  loadInstalledPlugins: function (API, args) {
    if (!(args.configs.installed_plugins && args.configs.installed_plugins.length)) {
      return Promise.resolve(API);
    }
    var
    dir = API.appdir(args.configs).append('node_modules');
    return loadPlugins(API, args.configs, args.configs.installed_plugins, dir);
  },

  // Params:
  // API                  - The API object (it will be mutated)
  // API.appdir           - Lookup Function.
  // args.configs         - The frozen configs Object
  // args.configs.plugins - An Array of plugin name Strings.
  //
  // Returns a Promise for the API Object.
  loadAppPlugins: function (API, args) {
    if (!(args.configs.plugins && args.configs.plugins.length)) {
      return Promise.resolve(API);
    }
    var
    dir = API.appdir(args.configs).append('plugins');
    return loadPlugins(API, args.configs, args.configs.plugins, dir);
  }
};

exports.newPluginLoader = Objects.factory([Action], exports.LoadPlugins);


exports.RunApp = {

  initialize: function (API, args) {
    this.Args = Yargs;
    this.q('loadAppModule');
    this.q('parseCommandline');
    this.q('runApp');
  },

  // Loads the Common.js module representing the program.
  //
  // Params:
  // API           - Not used.
  // args.filepath - A FilePath instance pointing to the module file.
  //
  // Sets:
  // args.scriptModule - The exported Object from the application script.
  //
  // Returns the args Object.
  loadAppModule: function (API, args) {
    args.scriptModule = require(args.filepath.toString());
    return args;
  },

  // Parse commandline arguments for the program script using the Yargs utility
  // https://www.npmjs.com/package/yargs
  //
  // Params:
  // API.argv()                - The setter Function for API argv.
  // args.scriptModule.usage   - The usage String defined by the script module.
  // args.scriptModule.options - The options definition Object defined by the
  //                             script module.
  //
  // Expects the Yargs utility to be present as this.Args.
  //
  // Returns the parsed argv Object.
  parseCommandline: function (API, args) {
    var
    opts,
    argv,
    usage = args.scriptModule.usage,
    options = args.scriptModule.options;

    opts = this.Args
      .reset()
      .usage('Usage: em run <script_path> '+ (usage || ''));

    if (options && U.isObject(options)) {
      Object.keys(options).forEach(function (key) {
        var
        conf = options[key];

        if (conf.alias) {
          opts = opts.alias(key, conf.alias);
        }
        if (conf.describe) {
          opts = opts.describe(key, conf.describe);
        }
        if (conf.boolean) {
          opts = opts.boolean(key);
        }
        if (conf.required) {
          opts = opts.demand(key);
        }
      });
    }

    argv = opts.argv;
    API.argv(argv);
    return argv;
  },

  runApp: function (API, args) {
    exports.module(args.scriptModule.main);
    return args;
  }
};

exports.newAppRunner = Objects.factory([Action], exports.RunApp);


// Utilities:
// ----------


// Params:
// environment - The environment config String.
// filepaths   - An Array of FilePaths to read for configs.
//
// Returns a Promise for a new configs Object.
function loadConfigsPath(environment, filepaths) {
  return filepaths.reduce(function (promise, path) {
    return promise.then(U.partial(loadConfigs, environment, path));
  }, Promise.resolve(Object.create(null)));
}


// Params:
// filepath    - A FilePath representing the path to the configs file.
// environment - The environment config String.
// configs     - A blank configs Object.
//
// Sets:
// configs - Mutates the configs Object with config settings.
//
// Returns a Promise for a new configs Object.
function loadConfigs(environment, filepath, configs) {
  return filepath.read().then(function (text) {
    var
    data;
    if (text) {
      data = INI.parse(text);
      Object.keys(data).reduce(function (configs, key) {
        var
        val = (data[key] || {})[environment];
        Object.defineProperty(configs, key, {
          enumerable: true,
          value: typeof val === 'undefined' ? data[key] : val
        });
        return configs;
      }, configs);
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


// Params:
// path - A FilePath instance representing the full path to the plugin.
//
// Returns a Plugin.
function loadPlugin(path) {
  var
  spec, plugin;
  spec = require(path);
  plugin = Plugin.newPlugin(spec);
  return plugin;
}


// API     - The API object (it will be appended).
// configs - The frozen configs Object
// plugins - An Array of plugin exports.
//
// Returns a Promise for the API Object.
function initializePlugins(API, configs, plugins) {
  return plugins.reduce(function (promise, plugin) {
    return promise.then(plugin.initPlugin(API, configs));
  }, Promise.cast(API));
}
