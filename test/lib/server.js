var NHTTP = require('http')

exports.createServer = function (opts, callback) {
  if (typeof callback !== 'function') {
    throw new Error('The callback argument passed into createServer(opts, callback) must be a function.');
  }
  opts = opts || Object.create(null);
  var server
    , port = opts.port || 8080
    , url = opts.url || '/'
    , responseStatus = opts.responseStatus || 200
    , responseContentType = opts.responseContentType || 'text/plain'
    , responseBody = opts.responseBody || 'hi\n'
    , echo = false

  if (opts.echo) {
    echo = true;
    responseContentType = 'application/json';
  }

  server = NHTTP.createServer(function (req, res) {
    var data

    function sendResponse() {
      var headers = Object.create(null)
        , rv = null

      if (echo) {
        rv = Object.create(null);
        rv.method = req.method;
        rv.url = req.url;
        rv.headers = req.headers;
        rv.body = data;
        responseBody = JSON.stringify(rv);
      }

      headers['content-type'] = responseContentType;
      headers['content-length'] = Buffer.byteLength(responseBody);
      res.writeHead(responseStatus, headers);
      res.end(responseBody);
    }
    if (req.method !== 'GET' && req.method !== 'DELETE') {
      data = '';
      req.setEncoding('utf8');
      req.on('data', function (chunk) {
        data += chunk;
      });
      req.on('end', sendResponse);
    } else {
      sendResponse();
    }
  });
  server.on('error', function (err) {
    if (err.code === 'EADDRNOTAVAIL') {
      err = new Error('TestServer - The port address '+ port +' is not available for connection.');
    }
    return callback(err);
  });
  server.listen(port, 'localhost', function () {
    var addr = server.address();
    return callback(null, 'http://'+ addr.address +':'+ addr.port);
  });
  return server;
};


