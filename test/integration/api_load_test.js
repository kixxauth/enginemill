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
  }
};
