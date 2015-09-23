'use strict';

var
Promise = require('../../../../lib/promise');


module.exports = function (app) {
  app.configs.ran_database = true;
  app.configs.database_has_configs = app.configs.ran_configs || false;
  app.configs.database_has_memstore = app.API.memstore || false;

  return new Promise(function (resolve) {
    setTimeout(function () {
      app.API.database = {};
      resolve(null);
    }, 12);
  });
};
