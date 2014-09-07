var OPT = require('yargs')

  , LIB = require('./lib/library/')

  , ENV = require('./lib/enginemill/environment')
  , EPR = require('./lib/enginemill/process')
  , APP = require('./lib/enginemill/application')


exports.main = function () {
  var promise = LIB.Promise.cast(LIB.Crystal.create())
    .then(ENV.load)
    .then(buildCommandLineOpts)
    .then(EPR.run)
    .catch(LIB.fail)

  return promise;
};


exports.load = function (values) {
  if (!(values instanceof LIB.Crystal)) {
    if (values && typeof values === 'object') {
      values = LIB.Crystal.create(values);
    } else {
      values = LIB.Crystal.create();
    }
  }

  var promise = LIB.Promise.cast(values)
    .then(ENV.load)
    .then(APP.Application.create)
    .catch(LIB.fail)

  return promise;
};


function buildCommandLineOpts(values) {
  var opts = OPT
              .usage('Enginemill -- Making it easier to build awesome stuff on the web.')
              .boolean('help')
              .describe('help', "Print out this helpful help message and exit.")
              .alias('help', 'h')

  values.define('commandLine', opts);
  values.define('argv', opts.argv);
  values.define('commandName', opts.argv._[0]);
  return values;
}
