var LIB = require('./')


// - values.commandName (default: 'console')
// - values.commandLine
// - values.argv
// - values.settings.name (default: 'enginemill')
//
// Defines values.command
// Defines values.commands
//
// Sets process.title
//
// Returns values
exports.run = function (values) {
  if (!(values instanceof LIB.Crystal)) {
    if (values && typeof values === 'object') {
      values = LIB.Crystal.create(values);
    } else {
      values = LIB.Crystal.create();
    }
  }

  var promise = LIB.Promise.cast(values)
    .then(setProcess)
    .then(loadCommands)
    .then(maybeHelp)
    .then(getCommand)
    .then(runCommand)

  return promise;
};

// - values.settings.name (default: 'enginemill')
//
// Sets process.title
//
// Returns values
function setProcess(values) {
  process.title = (values.settings.application.name || 'enginemill');
  return values;
}

// Defines values.commands
//
// Returns values
function loadCommands(values) {
  var commands = require('./commands_factory').newCommands()
  commands.load(LIB.Path.create(__dirname, 'commands'))
  values.define('commands', commands);
  return values;
}

// - values.argv
// - values.commandLine
// - values.commands
//
// Returns values
function maybeHelp(values) {
  if (values.argv._.length < 1 && (values.argv.help || values.argv.h)) {
    console.error(enginemillHelpString(values));
    process.exit(1);
  }

  return values;
}

// - values.commandName (default: 'console')
// - values.commandLine
// - values.commands
//
// Defines values.command
//
// Returns values
function getCommand(values) {
  var commandName = values.commandName || 'console'

  values.define('command', values.commands.get(commandName));

  if (!values.command) {
    console.error(invalidCommandHelpString(values));
    process.exit(1);
  }

  return values;
}

// - values.command
// - values.argv
// - values.commands
//
// Returns values
function runCommand(values) {
  var error = values.command.run(values.argv, values.commands);
  if (error) {
    console.error("Error: "+ error +'\n');
    console.error(commandHelpString(values));
    process.exit(1);
  }

  return values;
}

// - values.commandLine
// - values.commands
//
// Returns a help String.
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

// - values.command
//
// Returns a help String.
function commandHelpString(values) {
  var lines = ['Usage: '+ values.command.usageString +'\n', values.command.helpString];
  return lines.join('\n');
}

// - values.commandName
// - values.commandLine
// - values.commands
//
// Returns a help String.
function invalidCommandHelpString(values) {
  var str = "'"+ values.commandName +"' is not a valid command.\n\n"
  return str + enginemillHelpString(values);
}
