var EM = exports

  , OPT = require('yargs')

  , LIB = require('./lib/library/')

  , ENV = require('./lib/enginemill/environment')
  , EPR = require('./lib/enginemill/process')
  , APP = require('./lib/enginemill/application')


exports.main = function (values) {
  values = LIB.crystalize(values);

  var promise = LIB.Promise.cast(values)
    .then(EM.load)
    .then(buildCommandLineOpts)
    .then(EPR.run)
    .catch(LIB.fail)

  return promise;
};


exports.load = function (values) {
  values = LIB.crystalize(values);

  var promise = LIB.Promise.cast(values)
    .then(ENV.load)
    .then(APP.Application.create)
    .catch(LIB.fail)

  return promise;
};


exports.lib = function () {
  return LIB;
};


function buildCommandLineOpts(app) {
  var opts = OPT
              .usage('Enginemill -- Making it easier to build awesome stuff on the web.')
              .boolean('help')
              .describe('help', "Print out this helpful help message and exit.")
              .alias('help', 'h')

  app.define('commandLine', opts);
  app.define('argv', opts.argv);
  app.define('commandName', opts.argv._[0]);
  return app;
}
