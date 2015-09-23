Make Node.js Scripts a Snap
===========================
You can easily write and run your own scripts with the Enginemill environment
preloaded into them, which makes your scripting tasks easier than ever.

To create an Enginemill script just compose a JavaScript file with the following structure:

```JS
'use strict';

var enginemill = require('enginemill');

// Enginemill attaches the Bluebird promise implementation for convenience.
var Promise = enginemill.Promise;

// Enginemill also attaches the FilePath utility for convenience.
var path = enginemill.path;

// Internal module used in this example.
var CRYPT = require('../lib/crypt');

// We name and version our script.
var NAME = 'hash-to-xuid';
var VERSION = '1.0.0';

// Load your script.
enginemill.load({

  // Set the application root directory. This is not required, but is shown
  // here for completeness.
  appdir: path.create(__dirname, '..'),

  // Name and version are also not required, but shown here.
  name: NAME,
  version: VERSION,

  // Setup the command line options and documentation for your script.
  usageString: 'hash-to-xuid --key <string> --hash <string>',
  options: {
    key: {
      alias: 'k',
      description: 'auth crypto key',
      type: 'string',
      required: true
    },
    hash: {
      alias: 'x',
      description: 'hashed XUID',
      type: 'string',
      required: true
    }
  }
})

// After the load operation resolves, your script runs in the 'then' handler.
.then(function (app) {
  // Command line arguments are available on app.argv
  if (!app.argv.key) {
    return Promise.reject(new Error('--key must not be an empty string.'));
  }

  var crypto = CRYPT.createCrypto({ KEY: app.argv.key });
  console.log(crypto.decrypt(app.argv.hash));
})

// If there is an error loading your script, it will be printed out here.
.catch(function (err) {
  console.error('Caught an error in ' + __filename);
  console.error(err.stack || err.message || err);
  process.exit(1);
});
```

## Running The Script
Running the script above scripts is easy with `node hash-to-xuid.js` assuming you actually named it `hash-to-xuid.js`.

To print the usage and help strings from your script run it with the `--help`switch like this:

    node hash-to-xuid.js --help

