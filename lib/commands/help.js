exports.command = {
  usageString: "help <command>\tGet help for a specific command.",

  helpString: [
    "Arguments:"
  , "  <command>  The command name to fetch help text for.  [required]"
  ].join('\n'),

  run: function (opts, commands) {
  	var commandName = opts._[1]
  		, command
  		, lines

  	if (!commandName) {
  		return "Missing required argument <command>."
  	}

		command = commands.get(commandName)

		if (!command) {
			return "'"+ commandName +"' is not a valid command."
		}

		lines = [command.usageString +'\n', command.helpString];
		console.error(lines.join('\n'));
		return;
  },
};