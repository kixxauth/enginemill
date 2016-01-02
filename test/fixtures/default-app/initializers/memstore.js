'use strict';

var
enginemill = require('../../../../'),
Promise    = enginemill.Promise;


module.exports = function (app) {
  app.configs.ran_memstore = true;
  app.configs.memstore_has_configs  = app.configs.ran_configs || false;
  app.configs.memstore_has_database = app.API.database || false;

  return new Promise(function (resolve) {
    setTimeout(function () {
      app.API.memstore = {};
      resolve(null);
    }, 12);
  });
};
