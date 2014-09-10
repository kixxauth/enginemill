var LIB = require('../library/')


// - app.commandName (default: 'console')
// - app.commandLine
// - app.argv
// - app.name (default: 'enginemill')
//
// Defines app.command
// Defines app.commands
//
// Sets process.title
//
// Returns app
exports.run = function (app) {

  var promise = LIB.Promise.cast(app)
    .then(setProcess)
    .then(loadCommands)
    .then(maybeHelp)
    .then(getCommand)
    .then(runCommand)

  return promise;
};

// - app.name (default: 'enginemill')
//
// Sets app.title
//
// Returns app
function setProcess(app) {
  process.title = (app.name || 'enginemill');
  return app;
}

// Defines app.commands
//
// Returns app
function loadCommands(app) {
  var commands = require('./commands_factory').newCommands()
  commands.load(LIB.Path.create(__dirname, 'commands'))
  app.define('commands', commands);
  return app;
}

// - app.argv
// - app.commandLine
// - app.commands
//
// Returns app
function maybeHelp(app) {
  if (app.argv._.length < 1 && (app.argv.help || app.argv.h)) {
    console.error(enginemillHelpString(app));
    process.exit(1);
  }

  return app;
}

// - app.commandName (default: 'console')
// - app.commandLine
// - app.commands
//
// Defines app.command
//
// Returns app
function getCommand(app) {
  var commandName = app.commandName || 'console'

  app.define('command', app.commands.get(commandName));

  if (!app.command) {
    console.error(invalidCommandHelpString(app));
    process.exit(1);
  }

  return app;
}

// - app.command
// - app.argv
// - app.commands
//
// Returns app
function runCommand(app) {
  var error = app.command.run(app);
  if (error) {
    console.error("Error: "+ error +'\n');
    console.error(commandHelpString(app));
    process.exit(1);
  }

  return app;
}

// - app.commandLine
// - app.commands
//
// Returns a help String.
function enginemillHelpString(app) {
  var lines = app.commandLine.help().trim().split('\n')

  lines.push("\nTo get help with a command use `em help <command>`.");
  lines.push("Running `em` without a command will open the console.\n");
  lines.push("Commands:\n");

  cmds = app.commands.list().map(function (command) {
    return '  '+ command.usageString +'\n';
  });

  return lines.concat(cmds).join('\n');
}

// - app.command
//
// Returns a help String.
function commandHelpString(app) {
  var lines = ['Usage: '+ app.command.usageString +'\n', app.command.helpString];
  return lines.join('\n');
}

// - app.commandName
// - app.commandLine
// - app.commands
//
// Returns a help String.
function invalidCommandHelpString(app) {
  var str = "'"+ app.commandName +"' is not a valid command.\n\n"
  return str + enginemillHelpString(app);
}
