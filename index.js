'use strict';

var
FP                 = require('filepath'),
Promise            = require('./lib/promise'),
U                  = require('./lib/u'),
clArgsLoader       = require('./lib/cl_args_loader'),
packageJSONLoader  = require('./lib/package_json_loader'),
configsFilesLoader = require('./lib/configs_files_loader'),
application        = require('./lib/application'),

DEFAULTS = Object.freeze(U.extend(Object.create(null), {
  usageString: '',
  commandLineOptions: Object.create(null),
  environment: 'development',
  appdir: process.cwd(),
  appname: 'enginemill_app'
}));


// args.name
// args.commandLineOptions
// args.usageString
exports.loadApp = function (args) {
  var
  fileConfigs,
  envConfigs,
  argv,
  appdir,
  sysconfigsdir,
  packageJSON,
  appname,
  environment,
  usageString        = args.usageString || DEFAULTS.usageString,
  commandLineOptions = args.commandLineOptions || DEFAULTS.commandLineOptions;

  envConfigs = Object.freeze(U.extend(Object.create(null), process.env));

  argv = Object.freeze(clArgsLoader.loadArgv({
    usage   : usageString,
    options : commandLineOptions
  }));

  environment = envConfigs.environment || argv.environment || DEFAULTS.environment;

  appdir = FP.create(argv.appdir || DEFAULTS.appdir);

  packageJSON = packageJSONLoader.readPackageJSON({
    appdir: appdir
  });
  appname = args.name || packageJSON.name || DEFAULTS.appname;

  sysconfigsdir = FP.create(argv.sysconfigsdir || ('/etc/'+ appname));

  fileConfigs = configsFilesLoader
    .loadConfigs({
      appdir        : appdir,
      sysconfigsdir : sysconfigsdir,
      environment   : environment
    });

  return Promise.join({
      environment   : environment,
      appname       : appname,
      appdir        : appdir,
      sysconfigsdir : sysconfigsdir
    },
    envConfigs,
    argv,
    packageJSON,
    fileConfigs,
    createApplication);
};


function createApplication(options, envConfigs, argv, packageJSON, fileConfigs) {
  return application.createApplication({
    name          : options.appname,
    version       : packageJSON.version,
    appdir        : options.appdir.toString(),
    sysconfigsdir : options.sysconfigsdir.toString(),
    environment   : options.environment,
    packageJSON   : packageJSON,
    configs       : U.extend(Object.create(null), fileConfigs, envConfigs, argv),
    argv          : argv
  });
});
