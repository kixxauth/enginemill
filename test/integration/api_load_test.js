"use strict";

var
LIB          = require('../common/'),
execAndCache = require('../common/process').execAndCache,

COMMAND = LIB.projectDir('bin', 'em.js').toString();


exports["em run default_app (configs loading)"] = {

  setUp: execAndCache([COMMAND, 'run', LIB.fixtures('default_app', 'app.coffee')], {
    chdir: LIB.fixtures('default_app')
  }),

  "it has an exit code of 0": function (test) {
    test.strictEqual(this.exitCode, 0, 'exit code should be 0');
    return test.done();
  },

  "it has .Promise": function (test) {
    test.ok(this.json.API.Promise);
    return test.done();
  },

  "it has .print": function (test) {
    test.ok(this.json.API.print);
    return test.done();
  },

  "it has .U": function (test) {
    test.ok(this.json.API.U);
    return test.done();
  },

  "it has .factory": function (test) {
    test.ok(this.json.API.factory);
    return test.done();
  },

  "it has .path": function (test) {
    test.ok(this.json.API.path);
    return test.done();
  },

  "it has .initializer": function (test) {
    test.ok(this.json.API.initializer);
    return test.done();
  },

  "it has .action": function (test) {
    test.ok(this.json.API.action);
    return test.done();
  },

  "it has .appdir": function (test) {
    test.ok(this.json.API.appdir);
    return test.done();
  },

  "it has .sysconfigsdir": function (test) {
    test.ok(this.json.API.sysconfigsdir);
    return test.done();
  },

  "it has .usrconfigsdir": function (test) {
    test.ok(this.json.API.usrconfigsdir);
    return test.done();
  },

  "it has .argv": function (test) {
    test.ok(this.json.API.argv);
    return test.done();
  },

  "it has .configs": function (test) {
    test.equal(typeof this.json.API.configs, 'object');
    return test.done();
  },

  "it has a setter": function (test) {
    test.ok(this.json.API.set);
    return test.done();
  },

  "it has a getter": function (test) {
    test.ok(this.json.API.get);
    test.equal(this.json.API_SETVAL, 'this value was set');
    return test.done();
  }
};
