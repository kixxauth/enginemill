var CP = require('child_process')

  , cache = {}

exports.processCache = function (args) {
  var key = args.key
    , command = args.command

  return function (done) {
    var self = this
    if (cache[key]) {
      self.lines = cache[key];
      done();
    } else {
      CP.exec(command, function (err, stdout, stderr) {
        self.lines = cache[key] = stderr.split('\n');
        if (/Error/.test(self.lines[0])) {
          console.error('Process execution error:\n', stderr);
          return done(new Error("Process execution error. See stack dump above."));
        } else {
          return done();
        }
      });
    }
  };
}
