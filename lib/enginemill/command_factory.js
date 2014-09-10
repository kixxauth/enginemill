var LIB = require('../library/')


exports.newCommand = function (opts) {
  var self = Object.create(null)
    , path = opts.path
    , spec = require(path.toString()).command

  function run(app) {
    Object.defineProperties(global, {
      SETTINGS: {
        enumerable: true
      , value: app.settings
      }
    , Promise: {
        enumerable: true
      , value: LIB.Promise
      }
    , print: {
        enumerable: true
      , value: LIB.print
      }
    , fail: {
        enumerable: true
      , value: LIB.fail
      }
    , LIB: {
        enumerable: true
      , value: LIB
      }
    });

    return spec.run(app.argv, app.commands);
  }

  Object.defineProperties(self, {
    name: {value: path.basename('.js'), enumerable: true}
  , usageString: {value: spec.usageString, enumerable: true}
  , helpString: {value: spec.helpString, enumerable: true}
  , run: {value: run, enumerable: true}
  });

  return self;
};