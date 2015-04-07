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

  "it has app.name": function (test) {
    var
    configs = this.json.API.configs;
    test.equal(configs.app.name, 'default_app');
    return test.done();
  },

  "it has app.version": function (test) {
    var
    configs = this.json.API.configs;
    test.equal(configs.app.version, '0.0.0');
    return test.done();
  },

  "it has app.description": function (test) {
    var
    configs = this.json.API.configs;
    test.equal(configs.app.description, 'Default test app.');
    return test.done();
  }
};
