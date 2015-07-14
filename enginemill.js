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
The third convention is an expectation that all asynchronous operations will
be implemented and performed with Promises. See the ./lib/promise module for
more info.

Additionally Enginemill provides tools for performing longer operations using
Promise chains. One of these is the Action mixin. See the ./lib/action
creator for more info.

### Globals
The fourth convention is that sprinkling in a few useful globals is OK and
very useful. Enginemill adds globals to the GLOBAL object sparingly. See the
Globals section below for more info.

### Standardized Configuration
The fifth convention is a standardized way of loading configuration settings.
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
Guest application directory structure:

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
  |    |-- index.js
  |    `-- lib/
  `-- node_modules/
     `-- <plugin_name...>

*/

"use strict";

var
PATH     = require('path'),
FilePath = require('filepath').FilePath,
Yargs    = require('yargs'),
INI      = require('ini'),
U        = require('./lib/u'),
Promise  = require('./lib/promise'),
Action   = require('./lib/action'),
newAPI   = require('./lib/api').newAPI;


/*
enginemill.js Module
---------------------
The objective of this module is to provide a main entry point to the Enginemill
framework, and provide a way to take certain features a-la-carte or override
them by exposing as much of the enginemill functionality publicly on the
exports Object. The standard way to start an application is to call
enginemill exports.main(), which creates an instance of exports.Runner and
runs it with new API and args Objects. This is how the executable bin/em.js
script does it.

### exports.main()
`exports.main()` kicks off a chain of actions which initialize the process and
prepares dependencies for injection into the guest application. These actions
are performed mostly serially, and controlled by chaining promises using the
Enginemill Action construct (see lib/action). These actions are broken down
into 3 main groups: Loading configuration settings, loading and initializing
plugins, and intializing the guest application.
*/
exports.main = function () {
  var
  API, args;

  API = newAPI({
    sysconfigsdir : FilePath.root().append('etc', 'enginemill'),
    usrconfigsdir : FilePath.home().append('.enginemill'),
    appdir        : FilePath.create()
  });

  args         = Object.create(null);
  args.configs = Object.create(null);

  registerCoffeeScript();

  return exports.runnerAction(API, args)
    .then(function (args) {
      return exports.preLoaderAction(API, {
        argv       : args.argv,
        scriptPath : args.scriptPath
        // scriptPath is passed just because we need it later.
      });
    })
    .then(function (args) {
      exports.API = args.API;
      return exports.appRunnerAction(args.API, {
        scriptPath: args.scriptPath
      });
    })
    .then(function () { return exports.API; });
};


exports.load = function (argv) {
  var
  API, args;

  argv = Object.freeze(U.cloneDeep(argv));

  API = newAPI({
    sysconfigsdir : FilePath.root().append('etc', 'enginemill'),
    usrconfigsdir : FilePath.home().append('.enginemill'),
    appdir        : FilePath.create()
  });

  args         = Object.create(null);
  args.configs = Object.create(null);
  args.argv    = argv;

  registerCoffeeScript();

  return exports.preLoaderAction(API, args)
    .then(function (args) {
      exports.API = args.API;
    })
    .then(function () { return exports.API; });
};


exports.module = function (wrapper) {
  if (!exports.API) {
    throw new Error("The Enginemill API has not been initialized yet.");
  }
  return wrapper.call(null, exports.API);
};


exports.withAPI = function (wrapper) {
  if (!exports.API) {
    throw new Error("The Enginemill API has not been initialized yet.");
  }
  return wrapper(exports.API);
};


exports.action = Action.create;


/*
The first step is to register CoffeeScript, so that when require() is used to
lookup modules, `*.coffee` paths are considered along with `*.js` paths. This
means that all guest application files can be written in
CoffeeScript or JavaScript.

This method is used by the main hooks `exports.main()` and `exports.load()`.
*/

// Registers the coffee-script library so that require() looks for '.coffee'
// file extensions in addition to '.js'.
// Returns true.
function registerCoffeeScript() {
  require('coffee-script').register();
  return true;
}


/*
### exports.PreLoader
The Action definition for the application preloader.
*/
exports.PreLoader = {

  /*
  If we are still running at this point, and have not exited, it's time to
  determine the environment we're running in. If the --env argument is not
  given on the commandline, enginemill defaults to 'production'. Whatever the
  value ends up being, it is set as args.environment on the args Object.
  */

  // Params:
  // args.argv.env
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
  // args.environment  - The environment String.
  //
  // Sets:
  // API.configs     - The configs Object (will be frozen).
  // API.configs.app - The application configs Object (from package.json).
  // GLOBAL.print    - The print utility Function.
  // GLOBAL.U        - The utilities Library.
  //
  // Returns a Promise for the return value of LoadEnvironment#run().
  loadEnvironment: function (API, args) {
    return exports.environmentLoaderAction(API, {
      configs: {
        environment: args.environment
      }
    });
  },

  // Params:
  // API  - The API Object as it has been compiled so far.
  // args - The args Object.
  //
  // Sets:
  // args.API - The new (frozen) API object.
  //
  // Returns the args Object.
  setAPI: function (API, args) {
    args.API = API.freeze();
    return args;
  },
};


exports.preLoaderAction = Action.create(function () {
  return [
    exports.PreLoader.setEnvironment,
    exports.PreLoader.loadEnvironment,
    exports.PreLoader.setAPI
  ];
});


/*
### exports.Runner
The Action definition for the application runner.

This collection of methods is built into an Action Object using the Action
mixin (see lib/mixins/action).

An instance of Runner is used by `exports.main()` to do what it does. It
loads configs, loads and initializes plugins, and then intializes the guest
application.
*/
exports.Runner = {

  COMMANDS: ['help', 'run'],

  /*
  The next step is to parse the command line arguments and options passed into
  the enginemill executable. We use the Yargs library to do this, and the
  result is set on the args Object as args.argv for the remainder of the
  application initialization sequence.

  A really nice thing about using Yargs for command line parsing is that it
  makes it easy to configure command line documentation for users.
  */

  // Parses the commandline arguments and options using the Yargs utility:
  // https://www.npmjs.com/package/yargs
  //
  // Parameters:
  // API  - not used
  // args - A new argv Object will be added as .argv.
  //
  // Expects the Yargs utility to be present as Yargs.
  //
  // Returns the args Object.
  parseCommandline: function (API, args) {
    var
    usage = 'Usage:\n',
    argv;

    usage += "  em help\n";
    usage += "  em help <script_path>\n";
    usage += "  em run [<script_path>] [--env <environment>] [options]";

    argv = Yargs
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

  /*
  After parsing command line options, we check to see if the user passed in
  a valid command argument. If so, we set it as args.command on the args
  Object. If not, we print out the help docs and exit with a status code of 1.
  */

  // Checks for the positional command argument in parsed argv and takes
  // appropriate action if it is invalid.
  //
  // Params:
  // API  - not used
  // args - A new command String will be added as args.command.
  //
  // Expects this.showHelpAndExit() to be present.
  //
  // Sets:
  // args.command - The command String.
  //
  // Returns the args Object.
  checkCommand: function (API, args) {
    var
    command = args.argv._[0],
    message;
    if (!command) {
      message = "An enginemill command is required.";
    } else if (exports.Runner.COMMANDS.indexOf(command) < 0) {
      message = "'"+ command +"' is not a valid enginemill command.";
    }
    if (message) {
      message += "\nValid commands are: "+ exports.Runner.COMMANDS.join(', ');
      exports.Runner.showHelpAndExit(message);
    }
    args.command = command;
    return args;
  },

  /*
  If the command check passes (the user has passed a valid command), the next
  step is to set the scriptPath, which is the path to the entry script for the
  guest application. If the user does not provide it, we use the API.appdir()
  path, with 'app' appended onto it. This should work for app.js and
  app.coffee.
  */

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
    if (path) {
      if (isAbsolutePath(path)) {
        args.scriptPath = FilePath.create(path);
      } else {
        args.scriptPath = FilePath.create().append(path);
      }
    } else {
      args.scriptPath = API.appdir().append('app');
    }
    return args;
  },

  /*
  Once we have a command and a scriptPath, we check to see if the user is
  asking for help. There are two forms of help to consider:

  1) General Enginemill help
  2) Guest application help.

  Users can ask for commandline help for Enginemill usage by running

    em help

  To get help for the guest appliction users can run

    rm help <path to application script>

  The guest application help is configured in the guest applciation script
  file. See exports.RunApp.parseCommandline for more information about how
  the host applicaiton help text is configured.

  If either forms of help is requested by the user we show the help text and
  exit with status code 1.
  */

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
      exports.Runner.showHelpAndExit();
    } else if (args.command === 'help' && scriptPath) {
      exports.Runner.showProgramHelpAndExit(API, args.scriptPath);
    }
    return args;
  },

  // Utility method used to show the commandline help text and exit the
  // process.
  //
  // Params:
  // message - The message String to use (optional).
  showHelpAndExit: function (message) {
    if (message) {
      console.error(message);
    }
    console.error(Yargs.help());
    process.exit(1);
  },

  // Utility method used to show the commandline help text for the program
  // script and exit the process.
  //
  // Params:
  // API        - The API Object.
  // scriptPath - The FilePath instance representing the application script.
  showProgramHelpAndExit: function (API, scriptPath) {
    var
    scriptModule = exports.RunApp.loadAppModule(null, {
      scriptPath: scriptPath
    }).scriptModule;
    exports.RunApp.parseCommandline
      .call(this, API, {
        parseCommandline : false,
        scriptPath       : scriptPath,
        scriptModule     : scriptModule
      });
    this.showHelpAndExit(scriptModule.help || '');
  }
};


exports.runnerAction = Action.create(function () {
  return [
    exports.Runner.parseCommandline,
    exports.Runner.checkCommand,
    exports.Runner.setScriptPath,
    exports.Runner.checkHelp
  ];
});


/*
Configuration Structure
-----------------------
### Enginemill configs directory structure:

  |-- configs.ini

### Guest application configs directory structure:

  |-- package.json
  |-- configs.ini

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

  // Params:
  // API                      - Not used.
  // args.configs.environment - Environment String.
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
  // API.appdir - Function that takes a configs Object.
  //
  // Sets:
  // args.configs.app - Application package.json data Object.
  //
  // Returns a Promise for the args Object.
  readAppSettings: function(API, args) {
    var
    jsonPath = API.appdir(args.configs).append('package.json');

    function parseJSON(text) {
      var
      err, app;
      try {
        app = JSON.parse(text +'');
      } catch (e) {
        err = new Error("JSON SyntaxError: "+ e.message +" in "+ jsonPath);
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
    API.configs   = U.deepFreeze(configs);
    return API;
  },

  // Sets a few useful globals. Yikes!
  //
  // Params:
  // API.print - The API print Function.
  // API.U     - The API U utility library.
  //
  // Sets:
  // GLOBAL.Promise - The Promise constructor.
  // GLOBAL.print   - To API.print.
  // GLOBAL.U       - To API.U.
  //
  // Returns the GLOBAL Object.
  setGlobals: function (API) {
    return Object.defineProperties(GLOBAL, {
      Promise : {
        enumerable : true,
        value      : API.Promise
      },
      print : {
        enumerable : true,
        value      : API.print,
      },
      U : {
        enumerable : true,
        value      : API.U
      }
    });
  }
};

exports.environmentLoaderAction = Action.create(function () {
  return [
    exports.LoadEnvironment.loadCoreConfigs,
    exports.LoadEnvironment.readAppSettings,
    exports.LoadEnvironment.loadAppConfigs,
    exports.LoadEnvironment.setConfigs,
    exports.LoadEnvironment.setGlobals
  ];
});


exports.RunApp = {

  // Loads the Common.js module representing the program.
  //
  // Params:
  // API             - Not used.
  // args.scriptPath - A FilePath instance pointing to the module file.
  //
  // Sets:
  // args.scriptModule - The exported Object from the application script.
  //
  // Returns the args Object.
  loadAppModule: function (API, args) {
    args.scriptModule = require(args.scriptPath.toString());
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
  // Expects the Yargs utility to be present as Yargs.
  //
  // Returns the parsed argv Object.
  parseCommandline: function (API, args) {
    var
    opts,
    argv,
    parse = U.isBoolean(args.parseCommandline) ? args.parseCommandline : true,
    scriptPath = PATH.relative(process.cwd(), args.scriptPath.toString()),
    usage = args.scriptModule.usage,
    options = args.scriptModule.options;

    opts = Yargs
      .reset()
      .usage('Usage: em run '+ scriptPath +' '+ (usage || ''));

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

    if (parse) {
      argv = opts.argv;
    }
    API.argv(argv);
    return argv;
  },

  runApp: function (API, args) {
    exports.module(args.scriptModule.main);
    return args;
  }
};

exports.appRunnerAction = Action.create(function () {
  return [
    exports.RunApp.loadAppModule,
    exports.RunApp.parseCommandline,
    exports.RunApp.runApp
  ];
});


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
          enumerable : true,
          writable   : true,
          value      : typeof val === 'undefined' ? data[key] : val
        });
        return configs;
      }, configs);
    }
    return configs;
  });
}


// TODO: Replace with FilePath.isAbsolute() when it becomes available.
function isAbsolutePath(path) {
  if (typeof PATH.isAbsolute === 'function') {
    return PATH.isAbsolute(path);
  }
  return /^\//.test(path);
}