"use strict";

var
U  = require('../../lib/u'),
CR = require('command_runner');


exports.execAndCache = function (command, options) {
  var
  error = null,
  rv    = null;

  return function (done) {
    var
    self = this;
    if (error) {
      return done(error);
    }
    if (rv) {
      U.extend(this, rv);
      return done();
    }
    exports.exec(command, options).then(function (returnValue) {
      rv = returnValue;
      U.extend(self, rv);
      return done();
    }, function (err) {
      error = err;
      done(error);
    });
  };
};


exports.exec = function (command, options) {
  options = options || Object.create(null);
  var
  argv = command.slice(1);
  command = command[0];

  if (options.chdir) {
    process.chdir(options.chdir.toString());
  }

  return CR.spawn(command, argv, options).then(function (res) {
    var
    stdout,
    rv = U.extend(Object.create(null), res);
    if (rv.stdout) {
      stdout = rv.stdout.split('\n');
      try {
        rv.json = JSON.parse(stdout.slice(1).join('\n'));
      } catch (e) {
        rv.json = null;
      }
    }
    if (rv.stderr) {
      rv.lines = rv.stderr.split('\n');
    } else {
      rv.lines = [];
    }
    if (rv.lines.length && /Unhandled rejection/.test(rv.lines[0])) {
      console.error('\n *** Program exec crash:');
      console.error(rv.stderr);
    }
    return U.deepFreeze(rv);
  });
};
