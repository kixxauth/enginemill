"use strict";

var
LIB          = require('../common/'),
execAndCache = require('../common/process').execAndCache,

COMMAND = LIB.projectDir('bin', 'em.js').toString();


exports["em (no arguments)"] = {

  setUp : execAndCache([COMMAND], {
    chdir: LIB.fixtures('default_app')
  }),

  "it declares the enginemill lib it is running": function (test) {
    test.ok(/Running Enginemill from/.test(this.stdout), this.stdout.trim());
    return test.done();
  },

  "it messages a user about required commands": function (test) {
    test.equal(this.lines[0], "An enginemill command is required.");
    return test.done();
  },

  "it displays the help text": function (test) {
    test.ok(this.lines.length > 2, "stderr lines length");
    return test.done();
  }
};


exports["em foo (invalid command)"] = {

  setUp : execAndCache([COMMAND, 'foo'], {
    chdir: LIB.fixtures('default_app')
  }),

  "it messages the user about invalid command": function (test) {
    test.equal(this.lines[0], "'foo' is not a valid enginemill command.");
    return test.done();
  },

  "it shows valid commands": function (test) {
    test.equal(this.lines[1], "Valid commands are: help, run");
    return test.done();
  },

  "it displays the help text": function (test) {
    test.ok(this.lines.length > 3, "stderr lines length");
    return test.done();
  }
};


exports["em help (general help)"] = {

  setUp : execAndCache([COMMAND, 'help'], {
    chdir: LIB.fixtures('default_app')
  }),

  "it shows help and exits": function (test) {
    test.equal(this.lines[0], "Usage:");
    test.ok(this.lines.length > 3, "stderr lines length");
    return test.done();
  }
};


exports["em help <script_path>"] = {

  setUp : execAndCache([COMMAND, 'help', LIB.fixtures('default_app', 'app.coffee')], {
    chdir: LIB.fixtures('default_app')
  }),

  "it displays the help for the given script": function (test) {
    test.ok(/Usage: em run/.test(this.lines[0]), this.lines[0]);
    test.equal(this.lines[2], 'Options:', this.lines[2]);
    return test.done();
  }
};

