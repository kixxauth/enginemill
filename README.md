Enginemill
==========

A Node.js web development environment. Enginemill makes it easy to quickly create a Node.js script, or boot up an application.

* Includes [Bluebird](https://github.com/petkaantonov/bluebird) for Promises.
* Includes [Lodash](https://lodash.com/) too (Underscore).
* Includes [Filepath](https://github.com/kixxauth/filepath) to work with the filesystem.
* Parses command line options with [Yargs](https://github.com/bcoe/yargs).
* Serially loads plugins you define and kicks off your app only when they have all loaded.
* Includes a handy Promisified [request](https://github.com/request/request) wrapper for [making HTTP requests](https://github.com/kixxauth/enginemill/blob/master/docs/current/making_http_requests.md).
* Supports [CoffeeScript](http://coffeescript.org/) out of the box, which is nice for config and plugin initialization files.

Here is an example of booting up a new [Express.js](http://expressjs.com/) web application:

In `./bin/start-server.js`:
```js
var enginemill = require('enginemill');

// Loads the filepath (https://github.com/kixxauth/filepath) module.
var path = enginemill.path;

var server = require('../server');

enginemill.load({
    appdir: path.create(__dirname, '..'),

    // Plugins (expected in appdir/initializers/).
    initializers: [
        'configs',
        'middleware',
        'routes'
    ]
})
.then(server.start)
.catch(function (err) {
    console.error('There was an error starting the server:');
    console.error(err.stack || err.message || err);
    process.exit(1);
});
```

In './initializers/configs.coffee' (configs plugin):
```CoffeeScript
enginemill = require 'enginemill'
path       = enginemill.path

module.exports = (app) ->
    # app.environment is set with the --environment option, or the
    # NODE_ENV environment variable.
    app.configs.port = if app.environment is 'production' then 8080 else 3000

    # Set the public path to '../public'
    app.configs.public_path = path.create(__dirname, '..', 'public')
```

In './initializers/middleware.coffee':
```CoffeeScript
express = require 'express'

module.exports = (app) ->
    app.API.httpApp = express()
    app.API.httpApp.use bodyParser.json()
    app.API.httpApp.use bodyParser.urlencoded({ extended: false })
    app.API.httpApp.use cookieParser()
    app.API.httpApp.use express.static(app.configs.public_path.toString())
```

In './initializers/routes.coffee':
```CoffeeScript
dashboard = require '../presenters/dashboard'

module.exports = (app) ->
    app.API.httpApp.get '/', dashboard.get
```

In `./server.js`:
```js
var http = require('http');
var enginemill = require('enginemill');

// Loads Underscore/Lodash as 'U' symbol.
var U = enginemill.U;

exports.start = function (app) {
    var port = app.configs.port;

    // Set the port number in Express.
    app.httpApp.set('port', port);

    // Setup the server
    var server = http.createServer(app.httpApp);
    server.on('listening', U.partial(exports.onServerListening, server));
    server.listen(port);
};

exports.onServerListening = function (server) {
    var addr = server.address();
    console.log('Listening on %s:%s', addr.address, addr.port);
    console.log('press CTRL-C to stop');
};
```

Run the server with `node ./bin/start-server.js --environment production`;

Copyright and License
---------------------
Copyright: (c) 2014 - 2015 by Kris Walker <kris@kixx.name> (http://www.kixx.name/)

Unless otherwise indicated, all source code is licensed under the MIT license. See MIT-LICENSE for details.
