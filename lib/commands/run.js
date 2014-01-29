var OPT = require('optimist');


exports.command = {
  usageString: "run <torun>\tRun a program script."

, helpString: [
    "Arguments:"
  , "  <torun>  The path to the program script to run.  [required]"
  ].join('\n')


, run: function (opts) {
    var torun = opts._[1]

    if (!torun) {
      return "<torun> is a required argument.";
    }

    var torun = LIB.Path.create(torun).resolve()
    if (!torun.exists()) {
      return torun +" does not exist.";
    }
    if (!torun.isFile()) {
      return torun +" is not a file.";
    }

    // Load the script.
    torun = require(torun.toString());

    // Expected values:
    //   torun.usage
    //   torun.options
    //   torun.main
    var opts = exports.command.parseOptions(process.argv.slice(4), torun);

    // Run the script.
    torun.main(opts);
    return;
  }


, parseOptions: function (argv, script) {
    script = script || Object.create(null);
    var usage = script.usage || ''
      , opts = script.options || Object.create(null)
      , help = script.help
      , setup = OPT.usage(usage)
      , strings = []

    setup = setup.options('h', {alias: 'help'}).boolean('h')

    Object.keys(opts).forEach(function (key) {
      var conf = opts[key] || Object.create(null)

      if (conf.alias) {
        setup = setup.alias(key, conf.alias);
      }
      if (conf.boolean) {
        setup = setup.boolean(key);
      }
      if (conf.required) {
        setup = setup.demand(key);
      }
      if (conf.defaultValue) {
        setup = setup.default(key, conf.defaultValue);
      }
      if (conf.description) {
        setup = setup.describe(key, conf.description);
      }
      if (conf.forceString) {
        setup = setup.string(key);
        strings.push(key);
      }
    });

    // The parser will catch missing arguments.
    argv = setup.parse(argv);

    if (argv.help) {
      OPT.showHelp();
      if (help) {
        console.error(help);
      }
      process.exit(1);
    }

    strings.forEach(function (key) {
      var arg = argv[key];
      if (typeof arg === 'boolean' || typeof arg === 'undefined') {
        delete argv[key];
      } else {
        argv[key] = arg +'';
      }
    });

    return argv;
  }
};
