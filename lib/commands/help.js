exports.command = {
  usageString: "help <command>\tGet help, or help for a specific command.",

  helpString: [
    "Arguments:"
  , "  <command>  The command name to fetch help text for."
  ].join('\n'),

  run: function (opts, commands) {
  	var commandName = opts._[1]
  		, command
  		, lines

  	if (commandName) {
		  command = commands.get(commandName)
      if (!command) {
  		  return "The command '"+ commandName +"' does not exist."
      }
      lines = [command.usageString +'\n', command.helpString];
      console.error(lines.join('\n'));
      return;
    } else {
      return "Missing required argument <command>";
    }
  },
};
