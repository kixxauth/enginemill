var HTTP = require('../lib/').HTTP

  , Request = require('request').Request


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

  "it has response headers": function (test) {
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