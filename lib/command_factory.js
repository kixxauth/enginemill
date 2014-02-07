exports.newCommand = function (opts) {
  var self = Object.create(null)
    , path = opts.path
    , spec = require(path.toString()).command

  Object.defineProperties(self, {
    name: {value: path.basename('.js'), enumerable: true}
  , usageString: {value: spec.usageString, enumerable: true}
  , helpString: {value: spec.helpString, enumerable: true}
  , run: {value: spec.run, enumerable: true}
  });

  return self;
};