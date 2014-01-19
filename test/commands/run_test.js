var CP = require('child_process')


exports["in help context"] = {
  setUp: function (done) {
    var self = this
    CP.exec('./bin/em.js help run', function (err, stdout, stderr) {
      self.lines = stderr.split('\n');
      done();
    });
  },

  "should print usage line": function (test) {
    var usage = this.lines[0]
    test.equal(usage, "run <torun>\tRun a program script.");
    return test.done();
  },

  "should print help text": function (test) {
    var help1 = this.lines[2]
      , help2 = this.lines[3]

    test.equal(help1, "Arguments:")
    test.equal(help2, "  <torun>  The path to the program script to run.  [required]")
    return test.done();
  }
};

exports['without arguments'] = function (test) {
  test.expect(1);

  CP.exec('./bin/em.js run', function (err, stdout, stderr) {
    test.equal(typeof err.message, 'string', 'Error message');
    test.done();
  })
}

exports['when path does not exist'] = function (test) {
  test.expect(1);

  CP.exec('./bin/em.js run foo', function (err, stdout, stderr) {
    test.ok(/does\snot\sexist/.test(err.message), 'Expected error message');
    test.done();
  })
}

exports['when path is a directory'] = function (test) {
  test.expect(1);

  CP.exec('./bin/em.js run test/', function (err, stdout, stderr) {
    test.ok(/is\snot\sa\sfile/.test(err.message), 'Expected error message');
    test.done();
  })
};

exports['with script'] = {

  setUp: function (done) {
    this.command = './bin/em.js run test/fixtures/scripts/echo_args.coffee';
    return done();
  },

  'it should not run without required args': function (test) {
    test.expect(1);
    
    CP.exec(this.command, function (err, stdout, stderr) {
      test.ok(/Missing required arguments: filter, source/.test(stderr), "Error message")
      test.done();
    })
    return;
  },

  'it should assign arguments': function (test) {
    test.expect(3);

    CP.exec(this.command +' --filter test_filter --source test_source', function (err, stdout, stderr) {
      test.ok(!err, 'no error')

      var lines = stdout.split('\n').map(function (str) {
        return str.replace(/\W$/, '');
      });

      test.equal(lines[0], 'filter: test_filter');
      test.equal(lines[1], 'source: test_source');
      test.done();
    })
    return;
  },
};