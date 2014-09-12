var PROMISE = require('iou').Promise
  , FP = require('filepath')

// Get a list of all the globals in our current space.
var preDefinedGlobals = Object.getOwnPropertyNames(global)
  .map(function (key) {
    return {key: key, ref: global[key]};
  });

exports["ensure process.env writable"] = {
  setUp: function (done) {
    this.key = 'HOME';
    this.val = process.env[this.key];
    return done();
  },

  tearDown: function (done) {
    process.env[this.key] = this.val;
    return done();
  },

  "update an env var": function (test) {
    var fixture = '/foo/bar/baz'

    process.env[this.key] = fixture;

    test.notEqual(process.env[this.key], this.val);
    test.equal(process.env[this.key], fixture);

    return test.done();
  }
};


exports['when environment loaded'] = {

  setUp: (function () {
    var enginemill, app

    return function (done) {
      var self = this

      function load() {
        var root = FP.FilePath.create().append('test/fixtures/test_settings_app')

        self.enginemill = enginemill = require('../');
        enginemill.load({root: root}).then(function (application) {
          self.app = app = application;
          return done();
        }).catch(done);
      }

      if (!enginemill) {
        setupTestConfigs()
          .then(load)
          .catch(done);
      } else {
        self.enginemill = enginemill;
        self.app = app;
        return done();
      }
    };
  }()),

  'globals': {

    'it should not clobber existing globals': function (test) {
      test.expect(preDefinedGlobals.length);

      preDefinedGlobals.forEach(function (pre) {

        // Test NaN separately.
        if (pre.key === 'NaN') {
          test.ok(isNaN(NaN), "NaN should pass isNaN()");
          return;
        }

        // Test undefined separately.
        if (pre.key === 'undefined') {
          test.ok((undefined === void 0), "undefined === void 0");
          return;
        }

        test.strictEqual(global[pre.key], pre.ref, pre.key);
      });

      test.done();
    },

    'it should not introduce unexpected globals': function (test) {
      var expected = preDefinedGlobals.map(function (g) {
        return g.key;
      });

      var actual = Object.getOwnPropertyNames(global)
      test.expect(actual.length);

      actual.forEach(function (key) {
        test.ok(expected.indexOf(key) > -1, key);
      });

      test.done();
    },
  },

  'application': {

    "should have a name property": function (test) {
      test.equal(this.app.name, 'test_settings_app');
      return test.done();
    },

    "should have a root property": function (test) {
      var root = FP.FilePath.create().append('test/fixtures/test_settings_app');
      test.ok(this.app.root instanceof FP.FilePath, 'instanceof FilePath');
      test.equal(this.app.root.toString(), root.toString());
      return test.done();
    },

    "should have a settings property": function (test) {
      test.strictEqual(!!this.app.settings, true);
      test.equal(typeof this.app.settings, 'object');
      return test.done();
    }
  },

  'settings': {

    "loads Enginemill global setting": function (test) {
      var val = this.app.settings.ENGINEMILL_GLOBAL
      test.strictEqual(val, '1', 'ENGINEMILL_GLOBAL');
      return test.done();
    },

    "loads Enginemill global section setting": function (test) {
      var val = this.app.settings.test_section.enginemill_global
      test.strictEqual(val, '1', 'test_section.enginemill_global');
      return test.done();
    },

    "loads Enginemill user setting": function (test) {
      var val = this.app.settings.ENGINEMILL_USER
      test.strictEqual(val, '2', 'ENGINEMILL_USER');
      return test.done();
    },

    "loads Enginemill user section setting": function (test) {
      var val = this.app.settings.test_section.enginemill_user
      test.strictEqual(val, '2', 'test_section.enginemill_user');
      return test.done();
    },

    "loads application global setting": function (test) {
      var val = this.app.settings.APPLICATION_GLOBAL
      test.strictEqual(val, '3', 'APPLICATION_GLOBAL');
      return test.done();
    },

    "loads application global section setting": function (test) {
      var val = this.app.settings.test_section.application_global
      test.strictEqual(val, '3', 'test_section.application_global');
      return test.done();
    },

    "loads application user setting": function (test) {
      var val = this.app.settings.APPLICATION_USER
      test.strictEqual(val, '4', 'test_section.application_user');
      return test.done();
    },

    "loads application user section setting": function (test) {
      var val = this.app.settings.test_section.application_user
      test.strictEqual(val, '4', 'test_section.application_user');
      return test.done();
    },

    "loads application setting": function (test) {
      var val = this.app.settings.APPLICATION_SETTINGS
      test.strictEqual(val, '5', 'APPLICATION_SETTINGS');
      return test.done();
    },

    "loads application section setting": function (test) {
      var val = this.app.settings.test_section.application_settings
      test.strictEqual(val, '5', 'test_section.application_settings');
      return test.done();
    },

    "merges environment vars": function (test) {
      var val = this.app.settings.ENVIRONMENT_VARS
      test.strictEqual(val, '6', 'ENVIRONMENT_VARS');
      return test.done();
    },

    "Enginemill global overridden by Enginemill user": function (test) {
      var val = this.app.settings.ENGINEMILL_USER_OVER_ENGINEMILL_GLOBAL
      test.strictEqual(val, true, 'ENGINEMILL_USER_OVER_ENGINEMILL_GLOBAL');
      return test.done();
    },

    "Enginemill global section overridden by Enginemill user": function (test) {
      var val = this.app.settings.test_section.enginemill_user_over_enginemill_global
      test.strictEqual(val, true, 'test_section.enginemill_user_over_enginemill_global');
      return test.done();
    },

    "Enginemill global overridden by application global": function (test) {
      var val = this.app.settings.APPLICATION_GLOBAL_OVER_ENGINEMILL_GLOBAL
      test.strictEqual(val, true, 'APPLICATION_GLOBAL_OVER_ENGINEMILL_GLOBAL');
      return test.done();
    },

    "Enginemill global section overridden by application global": function (test) {
      var val = this.app.settings.test_section.application_global_over_enginemill_global
      test.strictEqual(val, true, 'test_section.application_global_over_enginemill_global');
      return test.done();
    },

    "Enginemill global overridden by application user": function (test) {
      var val = this.app.settings.APPLICATION_USER_OVER_ENGINEMILL_GLOBAL
      test.strictEqual(val, true, 'APPLICATION_USER_OVER_ENGINEMILL_GLOBAL');
      return test.done();
    },

    "Enginemill section global overridden by application user": function (test) {
      var val = this.app.settings.test_section.application_user_over_enginemill_global
      test.strictEqual(val, true, 'test_section.application_user_over_enginemill_global');
      return test.done();
    },

    "Enginemill global overridden by application settings": function (test) {
      var val = this.app.settings.APPLICATION_SETTINGS_OVER_ENGINEMILL_GLOBAL
      test.strictEqual(val, true, 'APPLICATION_SETTINGS_OVER_ENGINEMILL_GLOBAL');
      return test.done();
    },

    "Enginemill section global overridden by application settings": function (test) {
      var val = this.app.settings.test_section.application_settings_over_enginemill_global
      test.strictEqual(val, true, 'test_section.application_settings_over_enginemill_global');
      return test.done();
    },

    "Enginemill global overridden by environmment vars": function (test) {
      var val = this.app.settings.ENVIRONMENT_VARS_OVER_ENGINEMILL_GLOBAL
      test.strictEqual(val, true, 'ENVIRONMENT_VARS_OVER_ENGINEMILL_GLOBAL');
      return test.done();
    },

    "Enginemill user overridden by application global": function (test) {
      var val = this.app.settings.APPLICATION_GLOBAL_OVER_ENGINEMILL_USER
      test.strictEqual(val, true, 'APPLICATION_GLOBAL_OVER_ENGINEMILL_USER');
      return test.done();
    },

    "Enginemill section user overridden by application global": function (test) {
      var val = this.app.settings.test_section.application_global_over_enginemill_user
      test.strictEqual(val, true, 'test_section.application_global_over_enginemill_user');
      return test.done();
    },

    "Enginemill user overridden by application user": function (test) {
      var val = this.app.settings.APPLICATION_USER_OVER_ENGINEMILL_USER
      test.strictEqual(val, true, 'APPLICATION_USER_OVER_ENGINEMILL_USER');
      return test.done();
    },

    "Enginemill section user overridden by application user": function (test) {
      var val = this.app.settings.test_section.application_user_over_enginemill_user
      test.strictEqual(val, true, 'test_section.application_user_over_enginemill_user');
      return test.done();
    },

    "Enginemill user overridden by application settings": function (test) {
      var val = this.app.settings.APPLICATION_SETTINGS_OVER_ENGINEMILL_USER
      test.strictEqual(val, true, 'APPLICATION_SETTINGS_OVER_ENGINEMILL_USER');
      return test.done();
    },

    "Enginemill section user overridden by application settings": function (test) {
      var val = this.app.settings.test_section.application_settings_over_enginemill_user
      test.strictEqual(val, true, 'test_section.application_settings_over_enginemill_user');
      return test.done();
    },

    "Enginemill user overridden by environment vars": function (test) {
      var val = this.app.settings.ENVIRONMENT_VARS_OVER_ENGINEMILL_USER
      test.strictEqual(val, true, 'ENVIRONMENT_VARS_OVER_ENGINEMILL_USER');
      return test.done();
    },

    "Application global overridden by application user": function (test) {
      var val = this.app.settings.APPLICATION_USER_OVER_APPLICATION_GLOBAL
      test.strictEqual(val, true, 'APPLICATION_USER_OVER_APPLICATION_GLOBAL');
      return test.done();
    },

    "Application global section overridden by application user": function (test) {
      var val = this.app.settings.test_section.application_user_over_application_global
      test.strictEqual(val, true, 'test_section.application_user_over_application_global');
      return test.done();
    },

    "Application global overridden by application settings": function (test) {
      var val = this.app.settings.APPLICATION_SETTINGS_OVER_APPLICATION_GLOBAL
      test.strictEqual(val, true, 'APPLICATION_SETTINGS_OVER_APPLICATION_GLOBAL');
      return test.done();
    },

    "Application global section overridden by application settings": function (test) {
      var val = this.app.settings.test_section.application_settings_over_application_global
      test.strictEqual(val, true, 'test_section.application_settings_over_application_global');
      return test.done();
    },

    "Application global overridden by environment vars": function (test) {
      var val = this.app.settings.ENVIRONMENT_VARS_OVER_APPLICATION_GLOBAL
      test.strictEqual(val, true, 'ENVIRONMENT_VARS_OVER_APPLICATION_GLOBAL');
      return test.done();
    },

    "Application user overridden by application settings": function (test) {
      var val = this.app.settings.APPLICATION_SETTINGS_OVER_APPLICATION_USER
      test.strictEqual(val, true, 'APPLICATION_SETTINGS_OVER_APPLICATION_USER');
      return test.done();
    },

    "Application user section overridden by application settings": function (test) {
      var val = this.app.settings.test_section.application_settings_over_application_user
      test.strictEqual(val, true, 'test_section.application_settings_over_application_user');
      return test.done();
    },

    "Application user overridden by environment vars": function (test) {
      var val = this.app.settings.ENVIRONMENT_VARS_OVER_APPLICATION_USER
      test.strictEqual(val, true, 'ENVIRONMENT_VARS_OVER_APPLICATION_USER');
      return test.done();
    },

    "Application settings overridden by environment vars": function (test) {
      var val = this.app.settings.ENVIRONMENT_VARS_OVER_APPLICATION_SETTINGS
      test.strictEqual(val, true, 'ENVIRONMENT_VARS_OVER_APPLICATION_SETTINGS');
      return test.done();
    }
  }
};

function setupTestConfigs(done) {
  var promise = installEnginemillGlobalSettings()
    .then(installApplicationGlobalSettings)
    .then(installEnginemillUserSettings)
    .then(installApplicationUserSettings)
    .catch(handleSettingsFixtureSetupError)
    .then(setEnvironmentVars)

  return promise;
}

function setEnvironmentVars() {
  var spec = {
    ENVIRONMENT_VARS: 6
  , ENVIRONMENT_VARS_OVER_ENGINEMILL_GLOBAL: true
  , ENVIRONMENT_VARS_OVER_ENGINEMILL_USER: true
  , ENVIRONMENT_VARS_OVER_APPLICATION_GLOBAL: true
  , ENVIRONMENT_VARS_OVER_APPLICATION_USER: true
  , ENVIRONMENT_VARS_OVER_APPLICATION_SETTINGS: true
  }

  Object.keys(spec).forEach(function (key) {
    process.env[key] = spec[key];
  });
}

function installEnginemillGlobalSettings() {
    var promise = PROMISE.resolve({
      directory: FP.root().append('etc', 'enginemill')
    , file: FP.newPath().append('test', 'fixtures', 'settings', 'enginemill_global.ini')
    , message: "global Enginemill settings"
    }).then(installFile)

    return promise;
}

function installApplicationGlobalSettings() {
    var promise = PROMISE.resolve({
      directory: FP.root().append('etc', 'enginemill', 'test_settings_app')
    , file: FP.newPath().append('test', 'fixtures', 'settings', 'test_app_global.ini')
    , message: "global application settings"
    }).then(installFile)

    return promise;
}

function installEnginemillUserSettings() {
    var promise = PROMISE.resolve({
      directory: FP.home().append('.enginemill')
    , file: FP.newPath().append('test', 'fixtures', 'settings', 'enginemill_user.ini')
    , message: "user Enginemill settings"
    }).then(installFile)

    return promise;
}

function installApplicationUserSettings() {
    var promise = PROMISE.resolve({
      directory: FP.home().append('.enginemill', 'test_settings_app')
    , file: FP.newPath().append('test', 'fixtures', 'settings', 'test_app_user.ini')
    , message: "user application settings"
    }).then(installFile)

    return promise;
}

function installFile(opts) {
  var dir = opts.directory
    , file = opts.file
    , message = opts.message

  if (dir.exists()) {
    return PROMISE.resolve(null);
  }

  console.log("Installing "+ message +" to "+ dir);
  dir.mkdir();
  return file.copy(dir.append('settings.ini'));
}

function handleSettingsFixtureSetupError(err) {
    if (err.code === 'EACCES') {
      console.error("ERROR: file permission access error during test setup in "+ __filename);
      console.error("You probably need to run tests as sudo first, to setup the global settings files.");
      console.error("After the first run, you should run the tests *without* sudo.");
      return PROMISE.reject(new Error("File access error in test setup."));
    } else {
      return PROMISE.reject(err);
    }
}
