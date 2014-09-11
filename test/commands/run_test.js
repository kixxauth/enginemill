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

  'it should print help with --help switch': function (test) {
    test.expect(3);

    CP.exec(this.command +' --help', function (err, stdout, stderr) {
      var lines = err.message.split('\n');

      test.equal(lines[3], '  --a_string  Expected to be a String                        [required]');
      test.equal(lines[4], '  --a_number  Expected to be a Number.                       [required]');
      test.equal(lines[5], '  --a_bool    Expected to be a Boolean.                    ');
      test.done();
    })
    return;
  },

  'it should not run without required args': function (test) {
    test.expect(1);

    CP.exec(this.command, function (err, stdout, stderr) {
      test.ok(/Missing required arguments:/.test(stderr), "Error message")
      test.done();
    })
    return;
  },

  'it should assign arguments': function (test) {
    test.expect(4);

    CP.exec(this.command +' --a_string 999 --a_number 1 --a_boolean', function (err, stdout, stderr) {
      test.ok(!err, 'no error')

      var lines = stdout.split('\n').map(function (str) {
        return str.replace(/\W$/, '');
      });

      // Remove the first log statement.
      lines.shift();

      test.equal(lines[0], 'a_string 999');
      test.equal(lines[1], 'a_number 1');
      test.equal(lines[2], 'a_boolean true');
      test.done();
    })
    return;
  },

  'it should load expected globals': function (test) {
    test.expect(6);

    CP.exec(this.command +' --a_string 999 --a_number 1 --a_boolean', function (err, stdout, stderr) {
      test.ok(!err, 'no error')

      var lines = stdout.split('\n').map(function (str) {
        return str.replace(/\W$/, '');
      });

      // Remove the first log statement.
      lines.shift();

      test.equal(lines[3], 'LIB true');
      test.equal(lines[4], 'fail true');
      test.equal(lines[5], 'print true');
      test.equal(lines[6], 'Promise true');
      test.equal(lines[7], 'SETTINGS object');
      test.done();
    })
    return;
  }
};

