var Promise = require('iou').Promise

  , REQ = require('request')


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

    res.body = body;
    return resolve(res);
  });

  req = makeRequest(params);

  req.promise = function () {
    return promise;
  };

  return req;
};


exports.request = function (uri, opts) {
  return exports.newRequest(uri, opts, REQ);
};

exports.get = function (uri, opts) {
  return exports.newRequest(uri, opts, REQ.get);
};

exports.post = function (uri, opts) {
  return exports.newRequest(uri, opts, REQ.post);
};

exports.put = function (uri, opts) {
  return exports.newRequest(uri, opts, REQ.put);
};

exports.del = function (uri, opts) {
  return exports.newRequest(uri, opts, REQ.del);
};

exports.patch = function (uri, opts) {
  return exports.newRequest(uri, opts, REQ.patch);
};
