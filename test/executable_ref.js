var CP = require('child_process')
  , FS = require('fs')

  , FP = require('filepath')

  , PUTIL = require('./lib/process')


exports['with invalid command'] = {
  setUp: PUTIL.processCache({
    key: 'with invalid command'
  , command: './bin/em.js foobar'
  }),

  "should print error line": function (test) {
    var errorLine = this.lines[0]
    test.equal(errorLine, "'foobar' is not a valid command.");
    return test.done();
  },

  "should print usage line": function (test) {
    var usageLine = this.lines[2]
    test.equal(usageLine, "Enginemill -- Making it easier to build awesome stuff on the web.");
    return test.done();
  },

  "should print options lines": function (test) {
    var options1 = this.lines[4]
      , options2 = this.lines[5]

    test.equal(options1, "Options:");
    test.equal(options2, "  --help, -h  Print out this helpful help message and exit.");
    return test.done();
  },

  "should print summary lines": function (test) {
    var summary1 = this.lines[7]
      , summary2 = this.lines[8]

    test.equal(summary1, "To get help with a command use `em help <command>`.");
    test.equal(summary2, "Running `em` without a command will open the console.");
    return test.done();
  },

  "should print help text": function (test) {
    var helpText = this.lines[10]

    test.equal(helpText, "Commands:");
    return test.done();
  }
};

exports['with --help switch'] = {
  setUp: PUTIL.processCache({
    key: 'with --help switch'
  , command: './bin/em.js --help'
  }),

  "should print usage line": function (test) {
    var usageLine = this.lines[0]
    test.equal(usageLine, "Enginemill -- Making it easier to build awesome stuff on the web.");
    return test.done();
  },

  "should print options lines": function (test) {
    var options1 = this.lines[2]
      , options2 = this.lines[3]

    test.equal(options1, "Options:");
    test.equal(options2, "  --help, -h  Print out this helpful help message and exit.");
    return test.done();
  },

  "should print summary lines": function (test) {
    var summary1 = this.lines[5]
      , summary2 = this.lines[6]

    test.equal(summary1, "To get help with a command use `em help <command>`.");
    test.equal(summary2, "Running `em` without a command will open the console.");
    return test.done();
  },

  "should print help text": function (test) {
    var helpText = this.lines[8]

    test.equal(helpText, "Commands:");
    return test.done();
  }
};

exports['with -h switch'] = {
  setUp: PUTIL.processCache({
    key: 'with -h switch'
  , command: './bin/em.js -h'
  }),

  "should print usage line": function (test) {
    var usageLine = this.lines[0]
    test.equal(usageLine, "Enginemill -- Making it easier to build awesome stuff on the web.");
    return test.done();
  },

  "should print options lines": function (test) {
    var options1 = this.lines[2]
      , options2 = this.lines[3]

    test.equal(options1, "Options:");
    test.equal(options2, "  --help, -h  Print out this helpful help message and exit.");
    return test.done();
  },

  "should print summary lines": function (test) {
    var summary1 = this.lines[5]
      , summary2 = this.lines[6]

    test.equal(summary1, "To get help with a command use `em help <command>`.");
    test.equal(summary2, "Running `em` without a command will open the console.");
    return test.done();
  },

  "should print help text": function (test) {
    var helpText = this.lines[8]

    test.equal(helpText, "Commands:");
    return test.done();
  }
};


exports['outside of an Enginemill directory'] = {
  setUp: (function () {
    var command

    return function (done) {
      if (command) {
        this.command = command;
        return done();
      }

      var packageJSON = FP.root().append('tmp', 'package.json')
        , execPath

      this.cwd = FP.newPath();
      execPath = this.cwd.append('bin', 'em.js');

      if (packageJSON.isFile()) {
        FS.unlinkSync(packageJSON.toString());
      }

      try {
        process.chdir(FP.root().append('tmp').toString());
      } catch (err) {
        console.error("Error attempting to change directories")
        return done(err);
      }

      this.command = command = execPath.toString() + ' -h';
      return done();
    };
  }()),

  "it uses default application info to run": function (test) {
    test.expect(1);
    CP.exec(this.command, function (err, stdout, stderr) {
      var lines = stderr.split('\n');
      test.ok(!/error/i.test(lines[0]), 'runtime error');
      return test.done();
    });
  },

  tearDown: function (done) {
    if (this.cwd) {
      process.chdir(this.cwd.toString());
    }
    return done();
  }
};


exports['with invalid package.json JSON'] = {
  setUp: (function () {
    var command

    return function (done) {
      if (command) {
        this.command = command;
        return done();
      }

      this.cwd = FP.newPath();
      var execPath = this.cwd.append('bin', 'em.js');

      try {
        process.chdir(FP.newPath(__dirname).append('fixtures', 'json').toString());
      } catch (err) {
        console.error("Error attempting to change directories")
        return done(err);
      }

      this.command = command = execPath.toString() + ' -h';
      return done();
    };
  }()),

  "it prints an informative error message": function (test) {
    test.expect(1);
    CP.exec(this.command, function (err, stdout, stderr) {
      var lines = stderr.split('\n')
      test.ok(/^Error: JSON SyntaxError:/.test(lines[0]));
      return test.done();
    });
  },

  tearDown: function (done) {
    if (this.cwd) {
      process.chdir(this.cwd.toString());
    }
    return done();
  }
};

