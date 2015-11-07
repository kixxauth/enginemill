'use strict';

var
sinon = require('sinon'),

enginemill = require('../');


exports["with no defined options"] = {
  setUp: function (done) {
    this.argv = [
      'node',
      'debug',
      './some/path/to/script.js',
      '--foo',
      'bar'
    ];

    this.parsedArgv = enginemill.parseCommandLineOptions({
      argv: this.argv
    });

    done();
  },

  "provides the script path": function (test) {
    test.equal(typeof this.parsedArgv.$0, 'string');
    test.ok(this.parsedArgv.$0.length);
    test.done();
  },

  "provides args array": function (test) {
    test.ok(Array.isArray(this.parsedArgv._));
    test.equal(this.parsedArgv._.length, 3);
    test.done();
  },

  "help boolean is false": function (test) {
    test.strictEqual(this.parsedArgv.help, false);
    test.done();
  },

  "automagically parses options": function (test) {
    test.equal(this.parsedArgv.foo, 'bar');
    test.done();
  }
};

exports["with defined options"] = {
  setUp: function (done) {
    this.argv = [
      '-n',
      '0.45',
      '-b',
      'false',
      '-s',
      '2'
    ];

    this.options = {
      'has-default': {
        default: 'my_default'
      },
      anumber: {
        alias: 'n'
      },
      aboolean: {
        alias: 'b',
        type: 'boolean'
      },
      astring: {
        alias: 's',
        type: 'string'
      }
    };

    this.parsedArgv = enginemill.parseCommandLineOptions({
      options : this.options,
      argv    : this.argv
    });

    done();
  },

  "fills defaults": function (test) {
    test.equal(this.parsedArgv['has-default'], this.options['has-default'].default);
    test.done();
  },

  "automagically parses numbers as numbers": function (test) {
    var expected = parseFloat(this.argv[1]);
    test.equal(this.parsedArgv.anumber, expected);
    test.done();
  },

  "can parse booleans as booleans": function (test) {
    test.strictEqual(this.parsedArgv.aboolean, false);
    test.done();
  },

  "and parse numbers as strings": function (test) {
    test.strictEqual(this.parsedArgv.astring, this.argv[5]);
    test.done();
  }
};

exports["when help is invoked"] = {
  setUp: function (done) {
    var
    self = this,
    buff = '';

    this.argv = [
      '--help'
    ];

    this.options = {
      environment: {
        describe : 'the runtime environment',
        default  : 'development'
      }
    };

    this.processStdoutWrite = sinon.stub(process.stdout, 'write', function (data) {
      buff += data;
    });

    this.processExit = sinon.stub(process, 'exit', function (code) {
      self.exitCode = code;
      self.stdout   = buff;
      done();
    });

    this.parsedArgv = enginemill.parseCommandLineOptions({
      options : this.options,
      argv    : this.argv
    });
  },

  tearDown: function(done) {
    this.processStdoutWrite.restore();
    this.processExit.restore();
    done();
  },

  "emits exit code of 0": function (test) {
    test.strictEqual(this.exitCode, 0);
    test.done();
  },

  "prints help string for options": function (test) {
    var
    regex = /^\-\-environment[\s]+the runtime environment[\s]+\[default: \"development\"\]/,
    line = this.stdout.split('\n')[2].trim();
    test.ok(regex.test(line), line);
    test.done();
  }
};
