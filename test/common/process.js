var
Promise = require('../../lib/promise'),
U       = require('../../lib/u'),
CP      = require('child_process');


exports.execCache = function (command) {
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
    exports.exec(command).then(function (returnValue) {
      rv = returnValue;
      U.extend(self, rv);
      return done();
    }, function (err) {
      error = err;
      done(error);
    });
  };
};


exports.exec = function (command) {
  return new Promise(function (resolve, reject) {
    CP.exec(command, function (err, stdout, stderr) {
      if (err && !/Command failed/.test(err.message)) {
        return reject(err);
      }
      var
      rv = Object.create(null);
      rv.stdout = stdout;
      rv.stderr = stderr;
      rv.lines  = null;
      rv.json   = null;
      if (stdout) {
        try {
          rv.json = JSON.parse(stdout);
        } catch (err) {
          rv.json = null;
        }
      }
      if (stderr) {
        rv.lines = stderr.split('\n');
      }
      return resolve(rv);
    });
  });
};
