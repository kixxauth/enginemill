'use strict';

var
U       = require('./u'),
objects = require('./objects'),
radio   = require('oddcast'),
bunyan  = require('bunyan');

exports.FATAL = 'fatal';
exports.ERROR = 'error';
exports.WARN  = 'warn';
exports.INFO  = 'info';
exports.DEBUG = 'debug';
exports.TRACE = 'trace';

exports.PATTERNS = {
  FATAL : {role: 'logging', level: exports.FATAL},
  ERROR : {role: 'logging', level: exports.ERROR},
  WARN  : {role: 'logging', level: exports.WARN},
  INFO  : {role: 'logging', level: exports.INFO},
  DEBUG : {role: 'logging', level: exports.DEBUG},
  TRACE : {role: 'logging', level: exports.TRACE}
};


function EmitterRawStream(spec) {
  this.channel = spec.channel;
}
EmitterRawStream.prototype.write = function (rec) {
  var level = bunyan.nameFromLevel[rec.level].toUpperCase();
  this.channel.broadcast(exports.PATTERNS[level], rec);
};


exports.createLogger = objects.factory({
  initialize: function (args) {
    this.channel = radio.eventChannel();
    this.channel.use({role: 'logging'}, radio.inprocessTransport());

    this.logger = bunyan.createLogger({
      name: args.appname
    });
    this.logger.addStream({
      type: 'raw',
      stream: new EmitterRawStream({
        channel: this.channel
      }),
      closeOnExit: false
    });

    this.defaultObserver = function (rec) {
      process.stdout.write(JSON.stringify(rec));
    };
  },

  // configs.useDefaultStream - Boolean (optional) hook up default observers?
  //   (default is to do nothing)
  // args.level - String (optional) "FATAL|ERROR|WARN|INFO|DEBUG|TRACE"
  //   (default="INFO")
  configure: function (configs) {
    configs = U.ensure(configs);

    if (U.isBoolean(configs.useDefaultStream)) {
      if (configs.useDefaultStream) {
        this.removeDefaultListeners();
        this.useDefaultListeners();
      } else {
        this.removeDefaultListeners();
      }
    }

    if (configs.level) {
      this.logger.level(configs.level);
    }
  },

  create: function (options) {
    return this.logger.child(options);
  },

  useDefaultListeners: function () {
    this.channel.observe({role: 'logging'}, this.defaultObserver);
  },

  removeDefaultListeners: function () {
    this.channel.remove({role: 'logging'}, this.defaultObserver);
  }
});
