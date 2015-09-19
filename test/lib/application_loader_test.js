'use strict';

var
TOOLS = require('../tools/'),

applicationLoader = require('../../lib/application_loader');


exports["with defaults"] = {
  setUp: function (done) {
    var
    self = this;
    this.appdir = TOOLS.fixturePath.append('default-app');

    applicationLoader.load({
      appdir       : this.appdir,
      initializers : [
        'configs',
        require(this.appdir.append('initializers', 'memstore').toString()),
        require(this.appdir.append('initializers', 'database').toString())
      ]
    })
    .then(function (app) {
      self.app = app;
      done();
    });
  },

  "has default application name": function (test) {
    test.equal(this.app.name, 'not-named');
    test.done();
  },

  "has default application version": function (test) {
    test.equal(this.app.version, '0');
    test.done();
  },

  "has appdir": function (test) {
    var
    appdir   = this.app.appdir.toString(),
    expected = this.appdir.toString();

    test.equal(appdir, expected);
    test.done();
  },

  "has null packageJSON": function (test) {
    test.equal(this.app.packageJSON, null);
    test.done();
  },

  "default environment is development": function (test) {
    test.equal(this.app.environment, 'development');
    test.done();
  },

  "has configs values": function (test) {
    var
    configs = this.app.configs;

    test.equal(configs.port, 8080);
    test.equal(configs.sky_color, 'blue');
    test.ok(configs.database_has_configs);
    test.ok(configs.memstore_has_configs);
    test.done();
  },

  "has argv values": function (test) {
    var
    argv = this.app.argv;

    test.ok(Array.isArray(argv._));
    test.equal(argv.help, false);
    test.done();
  },

  "ran initializers in the correct order": function (test) {
    var
    configs = this.app.configs,
    API     = this.app.API;

    test.ok(API.memstore);
    test.ok(API.database);
    test.equal(configs.memstore_has_database, false);
    test.ok(configs.database_has_memstore);
    test.done();
  }
};
