var OPT = require('yargs')

  , LIB = require('./lib/library/')

  , ENV = require('./lib/enginemill/environment')
  , EPR = require('./lib/enginemill/process')


exports.main = function () {
  var promise = LIB.Promise.cast(LIB.Crystal.create())
    .then(ENV.load)
    .then(buildCommandLineOpts)
    .then(EPR.run)
    .catch(LIB.fail)

  return promise;
};


exports.load = function () {
  var promise = LIB.Promise.cast(LIB.Crystal.create())
    .then(ENV.load)
    .then(LIB.build)
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
