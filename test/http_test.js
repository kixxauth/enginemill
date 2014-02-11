var LIB = require('../lib/')
  , HTTP = LIB.HTTP

  , REQ = require('request')
  , Request = REQ.Request


exports["get() without error"] = {
  setUp: function (done) {
    this.originalMethod = REQ.get;
    var options = this.options = Object.create(null)
      , body = this.body = Object.create(null)
      , response = this.response = Object.create(null)
      , request = this.request = Object.create(null)

    REQ.get = function (opts) {
      LIB.extend(options, opts);
      process.nextTick(function () {
        return options.callback(null, response, body);
      });
      return request;
    };

    return done();
  },

  tearDown: function (done) {
    REQ.get = this.originalMethod;
    return done();
  },

  "passes uri": function (test) {
    test.expect(1);
    HTTP.get('http://www.example.com').promise().then(function (res) {
      return test.done();
    });
    test.equal(this.options.uri, 'http://www.example.com');
  }
};

exports["with GET request"] = {
  setUp: function (done) {
    this.req = HTTP.get('http://www.example.com');
    var self = this;

    this.req.promise().then(function (res) {
      self.res = res;
      return done();
    }).catch(done);
  },

  "it has a request instance": function (test) {
    test.ok(this.req instanceof Request);
    test.equal(this.req.method, 'GET', 'method');
    test.equal(this.req.href, 'http://www.example.com/', 'href');
    return test.done();
  },

  "its status is 200": function (test) {
    test.strictEqual(this.res.statusCode, 200);
    return test.done();
  },

  "its content-type is text/html": function (test) {
    var headers = this.res.headers
    test.equal(headers['content-type'], 'text/html');
    return test.done();
  },

  "it has a body": function (test) {
    test.equal(typeof this.res.body, 'string', 'body is a string');
    test.ok(this.res.body.length > 0, 'body has length');
    return test.done();
  }
};
