var LIB = require('./')


// - process.env
// - values.root (default: current working directory)
//
// Defines values.settings
// Defines values.root (if not defined)
//
// Sets LIB values on global.
// Sets global.SETTINGS (if it does not exist already)
//
// Returns Promise for values.
exports.load = function (values) {
  if (!(values instanceof LIB.Crystal)) {
    if (values && typeof values === 'object') {
      values = LIB.Crystal.create(values);
    } else {
      values = LIB.Crystal.create();
    }
  }

  var promise = LIB.Promise.cast(values)
    .then(loadCoffeeScript)
    .then(defineGlobals)
    .then(getRootPath)
    .then(defineSettings)

  return promise;
}

function loadCoffeeScript(values) {
  require('coffee-script').register();
  return values;
}

// Sets LIB values on global.
//
// Returns values.
function defineGlobals(values) {
  require('./expected_globals').forEach(function (key) {
    if (LIB.hasOwnProperty(key) && global[key] === void 0) {
      Object.defineProperty(global, key, {
        enumerable: true
      , value: LIB[key]
      });
    }
  });

  Object.defineProperty(global, 'LIB', {
    enumerable: true
  , value: LIB
  });

  return values;
}

// - values.root (default: current working directory)
//
// Defines values.root (if not defined)
//
// Returns values.
function getRootPath(values) {
  if (!values.isDefined('root')) {
    values.define('root', LIB.Path.create());
  }
  return values;
}

// Returns Promise for values.
function defineSettings(values) {
  var promise = LIB.Promise.cast(values)
    .then(readAppSettings)
    .then(loadSettingsPath)
    .then(mergeEnvironmentVars)
    .then(setSettings)
  return promise;
}

// - values.root
//
// Defines values.settings
//
// Returns Promise for values.
function readAppSettings(values) {
  var promise = values.root.append('package.json').read()
    .then(JSON.parse)
    .then(function (meta) {
      values.define('settings', LIB.extend(Object.create(null), {application: meta}));
      return values;
    })

  return promise;
}

// - values.settings
// - values.settings.application.name
// - values.root
//
// Mutates values.settings
//
// Returns Promise for values.
function loadSettingsPath(values) {
  var promise
    , appname                 = values.settings.application.name || 'default'
    , globalPath              = LIB.Path.root().append('etc', 'enginemill')
    , globalEnginemillPath    = globalPath.append('settings.ini')
    , globalApplicationPath   = globalPath.append(appname, 'settings.ini')
    , userPath                = LIB.Path.home().append('.enginemill')
    , userEnginemillPath      = userPath.append('settings.ini')
    , userApplicationPath     = userPath.append(appname, 'settings.ini')
    , applicationSettingsPath = values.root.append('settings.ini')

  function loadPath(path) {
    return path.read()
      .then(LIB.parseIni)
      .then(LIB.partial(LIB.merge, values.settings));
  };

  promise = loadPath(globalEnginemillPath)
    .then(LIB.partial(loadPath, userEnginemillPath))
    .then(LIB.partial(loadPath, globalApplicationPath))
    .then(LIB.partial(loadPath, userApplicationPath))
    .then(LIB.partial(loadPath, applicationSettingsPath))

  return promise.then(LIB.returnValue(values));
}

// - process.env
// - values.settings
//
// Mutates values.settings.
//
// Returns values.
function mergeEnvironmentVars(values) {
  Object.keys(process.env).reduce(function (settings, key) {
    var val = process.env[key]

    if (val === 'true') {
      val = true;
    } else if (val === 'false') {
      val = false;
    }

    settings[key] = val;
    return settings;
  }, values.settings);
  return values;
}

// - values.settings
//
// Sets global.SETTINGS (if it does not exist already)
//
// Returns values
function setSettings(values) {
  var settings = LIB.Crystal.create(values.settings)

  Object.defineProperty(settings, 'facade', {
    enumerable: true
  , value: function () {
      var self = this
      return Object.keys(self).reduce(function (rv, key) {
        rv[key] = self[key];
        return rv;
      }, Object.create(null));
    }
  });

  if (global.SETTINGS === void 0) {
    Object.defineProperty(global, 'SETTINGS', {
      enumerable: true
    , value: settings
    })
  }

  return values;
}
