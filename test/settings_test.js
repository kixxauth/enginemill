var Promise = require('iou').Promise
  , FP = require('filepath')

exports["with environment loaded"] = {

  setUp: function (done) {
    setupTestConfigs()
      .then(function () { return done(); }, handleSettingsFixtureSetupError)
      .catch(done);
  },

  "should not be smoking": function (test) {
    test.ok(true, "not smoking");
    return test.done();
  },

  "and should not be on fire": function (test) {
    test.ok(true, "not on fire");
    return test.done();
  }
};


function setupTestConfigs(done) {
  var promise = installEnginemillGlobalSettings()
    .then(installApplicationGlobalSettings)
    .then(installEnginemillUserSettings)
    .then(installApplicationUserSettings)

  return promise;
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
    console.log(message +" already installed.");
    return Promise.resolve(null);
  }

  console.log("Installing "+ message +" to "+ dir);
  dir.mkdir();
  return file.copy(dir.append('settings.ini'));
}

function loadEnvironment() {
  return require('../').load();
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
