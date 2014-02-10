var Promise = require('iou').Promise

  , REQ = require('request')


exports.newRequest = function (opts) {
  var req, promise, resolve, reject

  promise = new Promise(function (res, rej) {
    resolve = res;
    reject = rej;
  });

  req = REQ(opts, function (err, res, body) {
    if (err) {
      return reject(err);
    }

    res.body = body;
    return resolve(res);
  });

  req.promise = function () {
    return promise;
  };

  return req;
};


exports.get = function (opts) {
  opts = opts || Object.create(null);
  opts.method = 'GET';
  return exports.newRequest(opts);
};
