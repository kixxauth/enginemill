"use strict";

var
Promise = require('./promise'),
REQ = require('request');


exports.newRequest = function (uri, opts, makeRequest) {
  var
  req, promise, resolve, reject, params;

  promise = new Promise(function (res, rej) {
    resolve = res;
    reject = rej;
  });

  params = REQ.initParams(uri, opts, function (err, res, body) {
    if (err) {
      return reject(err);
    }

    Object.defineProperties(res, {
      body: {
        enumerable : true,
        value      : body
      }
    });
    return resolve(res);
  });

  params.followRedirect = params.followRedirect || false;
  params.encoding = typeof params.encoding === 'string' ? params.encoding : null;
  req = makeRequest(params, params.callback);
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

