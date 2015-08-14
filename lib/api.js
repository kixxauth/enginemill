"use strict";

var
FilePath    = require('filepath').FilePath,
U           = require('./u'),
Objects     = require('./objects'),
Action      = require('./action'),
initializer = require('./initializer');


exports.newAPI = Objects.factory({

  initialize: function (spec) {
    var
    _argv, _configs,
    _values = Object.create(null);

    Object.defineProperties(this, {

      Promise : {
        enumerable : true,
        value      : require('./promise')
      },

      print : {
        enumerable : true,
        value      : console.log
      },

      U : {
        enumerable : true,
        value      : U
      },

      factory : {
        enumerable : true,
        value      : Objects.factory
      },

      path : {
        enumerable : true,
        value      : FilePath.create
      },

      initializer : {
        enumerable : true,
        value      : initializer
      },

      action : {
        enumerable : true,
        value      : Action.create
      },

      // Smartly get the application directory.
      appdir : {
        enumerable : true,
        value      : function (configs) {
          configs = configs || Object.create(null);
          if (configs.appdir) {
            return FilePath.create(configs.appdir);
          }
          return spec.appdir;
        }
      },

      // Smartly get the system configurations directory.
      sysconfigsdir : {
        enumerable : true,
        value      : function (configs) {
          configs = configs || Object.create(null);
          if (configs.sysconfigsdir) {
            return FilePath.create(configs.sysconfigsdir);
          }
          return spec.sysconfigsdir;
        }
      },

      // Smartly get the user configurations directory.
      usrconfigsdir : {
        enumerable : true,
        value      : function (configs) {
          configs = configs || Object.create(null);
          if (configs.usrconfigsdir) {
            return FilePath.create(configs.usrconfigsdir);
          }
          return spec.usrconfigsdir;
        }
      },

      // Set and get the commandline argv.
      argv : {
        enumerable : true,
        set : function (val) {
          if (typeof _argv === 'undefined') {
            if (typeof val !== 'object') {
              throw new Error('API.argv must be an Object.');
            }
            _argv = val;
          } else {
            throw new Error('API.argv is already set.');
          }
        },
        get : function () {
          return _argv;
        }
      },

      configs : {
        enumerable : true,
        set : function (val) {
          if (typeof _configs === 'undefined') {
            if (typeof val !== 'object' || val === null) {
              throw new Error('API.configs must be an Object.');
            }
            _configs = val;
          } else {
            throw new Error('API.configs is already set.');
          }
        },
        get : function () {
          return _configs;
        }
      },

      set : {
        value : function (key, val) {
          if (typeof key !== 'string') {
            throw new Error('String key required by API.set');
          }
          if (typeof val === 'undefined') {
            throw new Error ('API.set does not accept an undefined value.')
          }
          if (typeof _values[key] !== 'undefined' || key in this) {
            throw new Error('API.'+ key +' is already set.');
          }
          _values[key] = val;
        }
      },

      get : {
        value : function (key) {
          return _values[key];
        }
      }
    });
  },

  freeze: function () {
    return Object.freeze(this);
  }
});
