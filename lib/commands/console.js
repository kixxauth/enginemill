exports.command = {
  usageString: "console [--language]\tRun a read-eval-print-loop console."
, helpString: [
    "Options:"
  , "  -l, --language  The language to use (CoffeeScript or JavaScript).  [default=CoffeeScript]"
  ].join('\n')

, run: function (opts) {
    var lang = opts.l ? opts.l.toLowercase() : 'cs';
    if (lang === 'coffeescript') {
      lang = 'cs';
    } else if (lang === 'javascript') {
      lang = 'js';
    } else if (lang !== 'cs' && lang !== 'js') {
      return "Invalid --language '"+ lang +"'.";
    }

    var msg = "# You are inside the Enginemill REPL (Read - Eval - Print - Loop).\n";
    msg += "# Control+D will exit.\n# Multi-line expressions can be input.\n";
    msg += "# Tab completion is supported for both global and local variables.\n";
    msg += "# The special variable _ (underscore) contains the result of\n# the last expression.\n#\n";
    msg += "# Type the command .help to get info about other useful commands.\n\n";
    process.stdout.write(msg);

    if (lang === 'js') {
      require('../repl').startJSRepl();
    } else {
      require('../repl').startCSRepl();
    }
    return;
  }
};
