var LIB = require('./')

  , newCommand = require('./command_factory').newCommand


exports.newCommands = function () {
  var self = Object.create(null)
    , memo

  function factoryReducer(memo, path) {
    var command = newCommand({path: path})

    Object.defineProperty(memo, command.name, {
      value: Object.freeze(command)
    , enumerable: true
    });
    return memo;
  }

  self.load = function (directoryPath) {
    memo = directoryPath
      .list()
      .reduce(factoryReducer, memo || Object.create(null));

    return LIB.extend(Object.create(null), memo);
  };

  self.list = function () {
    return LIB.values(memo || Object.create(null));
  };

  self.get = function (key) {
    return (memo || Object.create(null))[key];
  };

  Object.freeze(self);
  return self;
};