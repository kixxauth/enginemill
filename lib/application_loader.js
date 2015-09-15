'use strict';

var
FP          = require('filepath'),
Promise     = require('./promise'),
U           = require('./u'),
errors      = require('./errors'),
application = require('./application');


exports.load = function () {
  var
  promises,
  app         = application.create(),
  appRoot     = FP.create().resolve(process.argv[1]).dirname(),
  pluginsDir  = appRoot.append('plugins'),
  pluginFiles = [];

  if (pluginsDir.isDirectory()) {
    pluginFiles = pluginsDir.list();
  }

  promises = U.compact(pluginFiles.map(U.partial(loadPlugin, app)));
  return Promise.all(promises);
};


function loadPlugin(app, path) {
  var plugin;

  if (path.isFile()) {
    path = path.toString();
    plugin = require(path);

    if (typeof plugin !== 'function') {
      throw new errors.ArgumentError('Plugin exports must be a function: '+ path);
    }

    return Promise.resolve(plugin(app));
  }

  return null;
}
