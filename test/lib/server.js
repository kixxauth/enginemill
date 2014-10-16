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

  server = NHTTP.createServer(function (req, res) {
    var headers = Object.create(null)
    headers['content-type'] = responseContentType;
    headers['content-length'] = Buffer.byteLength(responseBody);
    res.writeHead(responseStatus, headers);
    res.end(responseBody);
  });
  server.on('error', function (err) {
    if (err.code === 'EADDRNOTAVAIL') {
      err = new Error('TestServer - The port address '+ port +' is not available for connection.');
    }
    return callback(err);
  });
  server.listen(port, function () {
    var addr = server.address();
    return callback(null, 'http://'+ addr.address +':'+ addr.port);
  });
  return server;
};


