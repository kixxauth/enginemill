var LIB = require('./lib/')
  , OPT = require('optimist')

exports.main = function () {
  var values = LIB.Crystal.create()
    , opts = OPT
              .usage('Enginemill -- Making it easier to build awesome stuff on the web.')
              .boolean('help')
              .describe('help', "Print out this helpful help message and exit.")
              .alias('help', 'h')

  values.define('commandLine', opts);
  values.define('argv', values.commandLine.argv);
  values.define('commandName', values.argv._[0]);

  var promise = LIB.Promise.cast(values)
    .then(loadEnvironment)
    .then(setProcess)
    .then(loadCommands)
    .then(maybeHelp)
    .then(getCommand)
    .then(runCommand)
    .catch(LIB.fail)

  return promise;
};

function loadEnvironment(values) {
  if (!(values instanceof LIB.Crystal)) {
    if (values && typeof values === 'object') {
      values = LIB.Crystal.create(values);
    } else {
      values = LIB.Crystal.create();
    }
  }

  var promise = LIB.Promise.cast(values)
    .then(loadCoffeeScript)
    .then(defineGlobals)
    .then(getRootPath)
    .then(defineSettings)

  return promise;
}
exports.load = loadEnvironment;

function loadCoffeeScript(values) {
  require('coffee-script');
  return values;
}

function defineGlobals(values) {
  require('./lib/expected_globals').forEach(function (key) {
    if (LIB.hasOwnProperty(key) && global[key] === void 0) {
      Object.defineProperty(global, key, {
        enumerable: true
      , value: LIB[key]
      });
    }
  });

  Object.defineProperty(global, 'LIB', {
    enumerable: true
  , value: LIB
  });

  return values;
}

function getRootPath(values) {
  if (!values.isDefined('root')) {
    values.define('root', LIB.Path.create());
  }
  return values;
}

function defineSettings(values) {
  var promise = LIB.Promise.cast(values)
    .then(readAppSettings)
    .then(loadSettingsPath)
    .then(mergeEnvironmentVars)
    .then(setSettings)
  return promise;
}

function readAppSettings(values) {
  var promise = values.root.append('package.json').read()
    .then(JSON.parse)
    .then(function (meta) {
      values.define('settings', LIB.extend(Object.create(null), {application: meta}));
      return values;
    })

  return promise;
}

function loadSettingsPath(values) {
  var promise
    , appname                 = values.settings.application.name || 'default'
    , globalPath              = LIB.Path.root().append('etc', 'enginemill')
    , globalEnginemillPath    = globalPath.append('settings.ini')
    , globalApplicationPath   = globalPath.append(appname, 'settings.ini')
    , userPath                = LIB.Path.home().append('.enginemill')
    , userEnginemillPath      = userPath.append('settings.ini')
    , userApplicationPath     = userPath.append(appname, 'settings.ini')
    , applicationSettingsPath = values.root.append('settings.ini')

  function loadPath(path) {
    return function () {
      return path.read().then(LIB.parseIni).then(mergeSettings);
    };
  };

  function mergeSettings(settings) {
    LIB.extend(values.settings, settings);
  }

  promise = loadPath(globalEnginemillPath)()
    .then(loadPath(userEnginemillPath))
    .then(loadPath(globalApplicationPath))
    .then(loadPath(userApplicationPath))
    .then(loadPath(applicationSettingsPath))

  return promise.then(LIB.returnValue(values));
}

function mergeEnvironmentVars(values) {
  LIB.extend(values.settings, process.env);
  Object.keys(process.env).reduce(function (settings, key) {
    var val = process.env[key]

    if (val === 'true') {
      val = true;
    } else if (val === 'false') {
      val = false;
    }

    settings[key] = val;
    return settings;
  }, values.settings);
  return values;
}

function setSettings(values) {
  var settings = LIB.Crystal.create(values.settings)

  if (global.SETTINGS === void 0) {
    Object.defineProperty(global, 'SETTINGS', {
      enumerable: true
    , value: settings
    })
  }

  return values;
}

function setProcess(values) {
  process.title = 'Enginemill:'+ (values.settings.name || 'anonymous_app')
  return values;
}

function loadCommands(values) {
  var commands = require('./lib/commands_factory').newCommands()
  commands.load(LIB.Path.create(__dirname, 'lib', 'commands'))
  values.define('commands', commands);
  return values;
}

function maybeHelp(values) {
  if (values.argv.help || values.argv.h) {
    console.error(enginemillHelpString(values));
    process.exit(1);
  }

  return values;
}

function getCommand(values) {
  var commandName = values.commandName || 'console'

  values.define('command', values.commands.get(commandName));

  if (!values.command) {
    console.error(invalidCommandHelpString(values));
    process.exit(1);
  }

  return values;
}

function runCommand(values) {
  var error = values.command.run(values.argv, values.commands);
  if (error) {
    console.error("Error: "+ error +'\n');
    console.error(commandHelpString(values));
    process.exit(1);
  }

  return values;
}

function enginemillHelpString(values) {
  var lines = values.commandLine.help().trim().split('\n')

  lines.push("\nTo get help with a command use `em help <command>`.");
  lines.push("Running `em` without a command will open the console.\n");
  lines.push("Commands:\n");

  cmds = values.commands.list().map(function (command) {
    return '  '+ command.usageString +'\n';
  });

  return lines.concat(cmds).join('\n');
}

function commandHelpString(values) {
  var lines = ['Usage: '+ values.command.usageString +'\n', values.command.helpString];
  return lines.join('\n');
}

function invalidCommandHelpString(values) {
  var str = "'"+ values.commandName +"' is not a valid command.\n\n"
  return str + enginemillHelpString(values);
}
