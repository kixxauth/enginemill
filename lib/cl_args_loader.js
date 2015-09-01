// args.usage
// args.options
exports.loadArgv = function (args) {
  var
  argv,
  options = Yargs
    .usage(args.usage)
    .help('help', 'Print help and exit.')
    .option('env', {
      alias    : 'e',
      default  : 'development',
      describe : 'The application runtime environment.',
      type     : 'string'
    });

  if (args.options && typeof args.options === 'object') {
    Object.keys(args.options).forEach(function (key) {
      var
      conf = args.options[key];

      // conf.describe - Description String
      // conf.demand - Boolean
      // conf.alias - String
      // conf.type - String ("boolean"|"string")
      options = options.option(key, conf);
    });
  }

  return options.argv;
};