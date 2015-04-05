var
FilePath = require('filepath').FilePath,
U        = require('./u'),
Objects  = require('./objects');


exports.newAPI = Objects.factory({

  initialize: function (spec) {
    var argv;

    Object.defineProperties(this, {

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
        value      : FilePath
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
        value      : function (val) {
          if (argv) {
            return argv;
          }
          return argv = val;
        }
      }
    });
  },

  freeze: function () {
    var
    api,
    self = this;
    api = Object.keys(self).reduce(function (api, key) {
      api[key] = self[key];
      return api;
    }, Object.create(null));
    return Object.freeze(api);
  }
});
