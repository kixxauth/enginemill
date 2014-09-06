var LIB = require('./lib/')

  , OPT = require('yargs')

  , ENV = require('./lib/enginemill_environment')
  , EPR = require('./lib/enginemill_process')

exports.load = ENV.load;

exports.main = function () {
  var promise = LIB.Promise.cast(LIB.Crystal.create())
    .then(ENV.load)
    .then(buildCommandLineOpts)
    .then(EPR.run)
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
