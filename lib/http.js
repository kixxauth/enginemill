var Promise = require('iou').Promise

  , REQ = require('request')

  , responsePrototype


exports.newRequest = function (uri, opts, makeRequest) {
  var req, promise, resolve, reject, params

  promise = new Promise(function (res, rej) {
    resolve = res;
    reject = rej;
  });

  params = REQ.initParams(uri, opts, function (err, res, body) {
    if (err) {
      return reject(err);
    }

    Object.defineProperties(res, {
      facade: {
        enumerable: true
      , value: responsePrototype.facade
      }
    , body: {
        enumerable: true
      , value: body
      }
    });
    return resolve(res);
  });

  params.options.followRedirect = params.options.followRedirect || false;
  params.options.encoding = typeof params.options.encoding === 'string' ? params.options.encoding : null;
  req = makeRequest(params.options, params.callback);
  req.promise = promise;
  return req;
};


exports.request = function (uri, opts) {
  return exports.newRequest(uri, opts, REQ);
};

exports.get = function (uri, opts) {
  return exports.newRequest(uri, opts, REQ.get.bind(REQ));
};

exports.post = function (uri, opts) {
  return exports.newRequest(uri, opts, REQ.post.bind(REQ));
};

exports.put = function (uri, opts) {
  return exports.newRequest(uri, opts, REQ.put.bind(REQ));
};

exports.del = function (uri, opts) {
  return exports.newRequest(uri, opts, REQ.del.bind(REQ));
};

exports.patch = function (uri, opts) {
  return exports.newRequest(uri, opts, REQ.patch.bind(REQ));
};


responsePrototype = {
  facade: function () {
    var obj = Object.create(null)
    obj.httpVersion = this.httpVersion;
    obj.httpVersionMajor = this.httpVersionMajor;
    obj.httpVersionMinor = this.httpVersionMinor;
    obj.headers = this.headers;
    obj.statusCode = this.statusCode;
    obj.body = Buffer.isBuffer(this.body) ? '[object Buffer]' : typeof this.body === 'string' ? '< String >' : '[object Object]';
    obj.request = '[object Request]'
    return obj;
  }
};
