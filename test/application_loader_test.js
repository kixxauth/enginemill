'use strict';

var
TOOLS = require('./tools/'),

enginemill = require('../'),
U          = enginemill.U,
Errors     = enginemill.Errors;


exports["with defaults"] = {
  setUp: function (done) {
    var
    self = this;
    this.appdir = TOOLS.fixturePath.append('default-app');

    enginemill.load({
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

exports["with argv"] = {
  setUp: function (done) {
    var
    self = this;
    this.appdir = TOOLS.fixturePath.append('default-app');
    this.argv = {
      host: '127.0.0.0',
      port: 8888
    };

    enginemill.load({
      appdir       : this.appdir,
      argv         : this.argv,
      options      : {
        host: {
          describe: 'The host String for the server',
          default: 'localhost'
        },
        port: {
          describe: 'The port Number for the server',
          default: 3000
        }
      },
      initializers : [
        'configs'
      ]
    })
    .then(function (app) {
      self.app = app;
      done();
    });
  },

  "has set argv values": function (test) {
    test.equal(this.app.argv.host, this.argv.host);
    test.equal(this.app.argv.port, this.argv.port);
    return test.done();
  }
};

exports["with config values"] = {
  setUp: function (done) {
    var
    self = this;
    this.appdir = TOOLS.fixturePath.append('default-app');
    this.configs = {
      logLevel: 'ALL',
      secretKey: 'foobarbaz'
    };

    enginemill.load({
      appdir       : this.appdir,
      configs      : this.configs,
      options      : {
        host: {
          describe: 'The host String for the server',
          default: 'localhost'
        },
        port: {
          describe: 'The port Number for the server',
          default: 3000
        }
      },
      initializers : [
        'configs'
      ]
    })
    .then(function (app) {
      self.app = app;
      done();
    });
  },

  "has set config values": function (test) {
    var
    configs = this.app.configs;

    test.equal(configs.logLevel, this.configs.logLevel);
    test.equal(configs.secretKey, this.configs.secretKey);
    return test.done();
  },

  "also assigns config file values": function (test) {
    var
    configs = this.app.configs;

    test.equal(configs.port, 8080);
    test.equal(configs.sky_color, 'blue');
    return test.done();
  }
};

exports["with package.json"] = {
  setUp: function (done) {
    var
    self = this;
    this.appdir = TOOLS.fixturePath.append('app');

    enginemill.load({
      appdir: this.appdir,
    })
    .then(function (app) {
      self.app = app;
      done();
    });
  },

  "has a non-default name": function (test) {
    test.equal(this.app.name, 'test-fixture');
    test.done();
  },

  "has a non-default version": function (test) {
    test.equal(this.app.version, '1.0.0');
    test.done();
  },

  "has a packageJSON": function (test) {
    test.ok(U.isObject(this.app.packageJSON));
    test.done();
  },

  "packageJSON has repository object": function (test) {
    test.ok(U.isObject(this.app.packageJSON.repository));
    test.done();
  },

  "packageJSON is deeply frozen": function (test) {
    function walkTree(obj) {
      test.ok(Object.isFrozen(obj));

      Object.keys(obj).forEach(function (key) {
        var val = obj[key];
        if (U.isObject(val)) {
          walkTree(val);
        }
      });
    }

    walkTree(this.app.packageJSON);
    test.done();
  }

};

exports["initializer not found"] = {
  setUp: function (done) {
    var
    self = this;
    this.appdir = TOOLS.fixturePath.append('default-app');

    enginemill.load({
      appdir       : this.appdir,
      initializers : [
        'foobar'
      ]
    })
    .then(function () {
      done(new Error('Success handler should not be called.'));
    })
    .catch(function (err) {
      self.error = err;
      done();
    });
  },

  "rejects with an NotFoundError": function (test) {
    var
    path = this.appdir.append('initializers', 'foobar');
    test.ok(this.error instanceof Error);
    test.ok(this.error instanceof Errors.NotFoundError);
    test.ok(/^Initializer module not found/.test(this.error.message));
    test.ok(this.error.message.indexOf(path) > 0);
    test.done();
  }
};

exports["initializer not a function"] = {
  setUp: function (done) {
    var
    self = this;
    this.appdir = TOOLS.fixturePath.append('default-app');

    enginemill.load({
      appdir       : this.appdir,
      initializers : [ {} ]
    })
    .then(function () {
      done(new Error('Success handler should not be called.'));
    })
    .catch(function (err) {
      self.error = err;
      done();
    });
  },

  "rejects with an OperationalError": function (test) {
    test.ok(this.error instanceof Error);
    test.ok(this.error instanceof Errors.OperationalError);
    test.equal(this.error.message, 'Initializers must be functions: index 0');
    test.done();
  }
};
