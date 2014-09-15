exports.command = {
  usageString: "console\tRun a read-eval-print-loop console."
, helpString: ''

, run: function (opts) {
    var msg = "# You are inside the Enginemill REPL (Read - Eval - Print - Loop).\n";
    msg += "# Control+D will exit.\n";
    msg += "# Multi-line expressions can be input using Ctrl-v.\n";
    msg += "# Tab completion is supported for both global and local variables.\n";
    msg += "# The special variable _ (underscore) contains the result of\n# the last expression.\n#\n";
    msg += "# Type the command `.help` to get info about other useful commands.\n\n";
    process.stdout.write(msg);

    require('../repl').startCSRepl();
  }
};
