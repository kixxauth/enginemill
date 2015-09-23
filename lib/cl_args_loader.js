'use strict';

var
Yargs = require('yargs');

// args.usageString
// args.helpString
// args.options
// args.argv
exports.loadArgv = function (args) {
  var options = Yargs
    .reset()
    .usage(args.usageString)
    .help('help', args.helpString);

  if (args.options && typeof args.options === 'object') {
    Object.keys(args.options).forEach(function (key) {
      var
      conf = args.options[key];

      // conf.describe - Description String
      // conf.demand - Boolean
      // conf.alias - String
      // conf.type - String ("boolean"|"string")
      // conf.default - Any value
      options = options.option(key, conf);
    });
  }

  return options.parse(args.argv);
};