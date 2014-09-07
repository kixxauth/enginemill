var Promise = require('iou').Promise
  , FP = require('filepath')

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

exports["with environment loaded"] = {

  setUp: (function () {
    var enginemill
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

  "loads Enginemill global setting": function (test) {
    test.strictEqual(SETTINGS.ENGINEMILL_GLOBAL, '1');
    return test.done();
  },

  "loads Enginemill global section setting": function (test) {
    test.strictEqual(SETTINGS.test_section.enginemill_global, '1');
    return test.done();
  },

  "loads Enginemill user setting": function (test) {
    test.strictEqual(SETTINGS.ENGINEMILL_USER, '2');
    return test.done();
  },

  "loads Enginemill user section setting": function (test) {
    test.strictEqual(SETTINGS.test_section.enginemill_user, '2');
    return test.done();
  },

  "loads application global setting": function (test) {
    test.strictEqual(SETTINGS.APPLICATION_GLOBAL, '3');
    return test.done();
  },

  "loads application global section setting": function (test) {
    test.strictEqual(SETTINGS.test_section.application_global, '3');
    return test.done();
  },

  "loads application user setting": function (test) {
    test.strictEqual(SETTINGS.APPLICATION_USER, '4');
    return test.done();
  },

  "loads application user section setting": function (test) {
    test.strictEqual(SETTINGS.test_section.application_user, '4');
    return test.done();
  },

  "loads application setting": function (test) {
    test.strictEqual(SETTINGS.APPLICATION_SETTINGS, '5');
    return test.done();
  },

  "loads application section setting": function (test) {
    test.strictEqual(SETTINGS.test_section.application_settings, '5');
    return test.done();
  },

  "merges environment vars": function (test) {
    test.strictEqual(SETTINGS.ENVIRONMENT_VARS, '6');
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
    var promise = Promise.resolve({
      directory: FP.root().append('etc', 'enginemill')
    , file: FP.newPath().append('test', 'fixtures', 'settings', 'enginemill_global.ini')
    , message: "global Enginemill settings"
    }).then(installFile)

    return promise;
}

function installApplicationGlobalSettings() {
    var promise = Promise.resolve({
      directory: FP.root().append('etc', 'enginemill', 'test_settings_app')
    , file: FP.newPath().append('test', 'fixtures', 'settings', 'test_app_global.ini')
    , message: "global application settings"
    }).then(installFile)

    return promise;
}

function installEnginemillUserSettings() {
    var promise = Promise.resolve({
      directory: FP.home().append('.enginemill')
    , file: FP.newPath().append('test', 'fixtures', 'settings', 'enginemill_user.ini')
    , message: "user Enginemill settings"
    }).then(installFile)

    return promise;
}

function installApplicationUserSettings() {
    var promise = Promise.resolve({
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
    return Promise.resolve(null);
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
      return Promise.reject(new Error("File access error in test setup."));
    } else {
      return Promise.reject(err);
    }
}
