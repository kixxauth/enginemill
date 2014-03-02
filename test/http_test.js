var LIB = require('../lib/')
  , REQ = require('request')
  , Request = REQ.Request


exports["get() without error"] = {
  setUp: function (done) {
    this.originalMethod = REQ.get;

    var options = this.options = Object.create(null)
      , body = this.body = Object.create(null)
      , response = this.response = Object.create(null)
      , request = this.request = Object.create(null)

    REQ.get = function (opts, callback) {
      LIB.extend(options, opts);
      process.nextTick(function () {
        return callback(null, response, body);
      });
      return request;
    };

    return done();
  },

  tearDown: function (done) {
    REQ.get = this.originalMethod;
    return done();
  },

  "originalMethod exists": function (test) {
    test.equal(typeof this.originalMethod, 'function');
    return test.done();
  },

  "passes uri": function (test) {
    test.expect(1);
    LIB.http.get('http://www.example.com').promise.then(function (res) {
      return test.done();
    });
    test.equal(this.options.uri, 'http://www.example.com');
  },

  "passes followRedirect = false": function (test) {
    test.expect(1);
    LIB.http.get('http://www.example.com').promise.then(function (res) {
      return test.done();
    });
    test.strictEqual(this.options.followRedirect, false);
  },

  "returns the request object": function (test) {
    test.expect(1);
    var req = LIB.http.get('http://www.example.com')
    req.promise.then(function (res) {
      return test.done();
    });
    test.strictEqual(this.request, req);
  },

  "promise for response object": function (test) {
    test.expect(2);
    var response = this.response
      , body = this.body

    LIB.http.get('http://www.example.com').promise.then(function (res) {
      test.strictEqual(res, response, 'response object');
      test.strictEqual(res.body, body, 'body object');
      return test.done();
    });
  }
};

exports["get() with error"] = {
  setUp: function (done) {
    this.originalMethod = REQ.get;
    var request = this.request = Object.create(null)
      , error = this.error = new Error("POST Error")

    REQ.get = function (options, callback) {
      process.nextTick(function () {
        return callback(error);
      });
      return request;
    };

    return done();
  },

  tearDown: function (done) {
    REQ.get = this.originalMethod;
    return done();
  },

  "it rejects with an error": function (test) {
    test.expect(1);
    var error = this.error

    function shouldSkip() {
      test.ok(false, "should not be called");
      return test.done();
    }

    LIB.http.get('http://www.example.com').promise
      .then(shouldSkip)
      .catch(function (err) {
        test.strictEqual(err, error);
        return test.done();
      })
  }
};

exports["post() without error"] = {
  setUp: function (done) {
    this.originalMethod = REQ.post;

    var options = this.options = Object.create(null)
      , body = this.body = Object.create(null)
      , response = this.response = Object.create(null)
      , request = this.request = Object.create(null)

    REQ.post = function (opts, callback) {
      LIB.extend(options, opts);
      process.nextTick(function () {
        return callback(null, response, body);
      });
      return request;
    };

    return done();
  },

  tearDown: function (done) {
    REQ.post = this.originalMethod;
    return done();
  },

  "originalMethod exists": function (test) {
    test.equal(typeof this.originalMethod, 'function');
    return test.done();
  },

  "passes uri": function (test) {
    test.expect(1);
    LIB.http.post('http://www.example.com').promise.then(function (res) {
      return test.done();
    });
    test.equal(this.options.uri, 'http://www.example.com');
  },

  "passes followRedirect = false": function (test) {
    test.expect(1);
    LIB.http.post('http://www.example.com').promise.then(function (res) {
      return test.done();
    });
    test.strictEqual(this.options.followRedirect, false);
  },

  "passes form as option": function (test) {
    test.expect(1);
    var form = {key: 'value'}
      , req = LIB.http.post('http://www.example.com', {body: form})

    test.strictEqual(this.options.body, form);

    req.promise.then(function (res) {
      return test.done();
    });
  },

  "returns the request object": function (test) {
    test.expect(1);
    var req = LIB.http.post('http://www.example.com')
    req.promise.then(function (res) {
      return test.done();
    });
    test.strictEqual(this.request, req);
  },

  "promise for response object": function (test) {
    test.expect(2);
    var response = this.response
      , body = this.body

    LIB.http.post('http://www.example.com').promise.then(function (res) {
      test.strictEqual(res, response, 'response object');
      test.strictEqual(res.body, body, 'response body');
      return test.done();
    });
  }
}

exports["post() with error"] = {
  setUp: function (done) {
    this.originalMethod = REQ.post;
    var request = this.request = Object.create(null)
      , error = this.error = new Error("POST Error")

    REQ.post = function (options, callback) {
      process.nextTick(function () {
        return callback(error);
      });
      return request;
    };

    return done();
  },

  tearDown: function (done) {
    REQ.post = this.originalMethod;
    return done();
  },

  "it rejects with an error": function (test) {
    test.expect(1);
    var error = this.error

    function shouldSkip() {
      test.ok(false, "should not be called");
      return test.done();
    }

    LIB.http.post('http://www.example.com').promise
      .then(shouldSkip)
      .catch(function (err) {
        test.strictEqual(err, error);
        return test.done();
      })
  }
};

exports["put() without error"] = {
  setUp: function (done) {
    this.originalMethod = REQ.put;

    var options = this.options = Object.create(null)
      , body = this.body = Object.create(null)
      , response = this.response = Object.create(null)
      , request = this.request = Object.create(null)

    REQ.put = function (opts, callback) {
      LIB.extend(options, opts);
      process.nextTick(function () {
        return callback(null, response, body);
      });
      return request;
    };

    return done();
  },

  tearDown: function (done) {
    REQ.put = this.originalMethod;
    return done();
  },

  "originalMethod exists": function (test) {
    test.equal(typeof this.originalMethod, 'function');
    return test.done();
  },

  "passes uri": function (test) {
    test.expect(1);
    LIB.http.put('http://www.example.com').promise.then(function (res) {
      return test.done();
    });
    test.equal(this.options.uri, 'http://www.example.com');
  },

  "passes followRedirect = false": function (test) {
    test.expect(1);
    LIB.http.put('http://www.example.com').promise.then(function (res) {
      return test.done();
    });
    test.strictEqual(this.options.followRedirect, false);
  },

  "passes form as option": function (test) {
    test.expect(1);
    var form = {key: 'value'}
      , req = LIB.http.put('http://www.example.com', {body: form})

    test.strictEqual(this.options.body, form);

    req.promise.then(function (res) {
      return test.done();
    });
  },

  "returns the request object": function (test) {
    test.expect(1);
    var req = LIB.http.put('http://www.example.com')
    req.promise.then(function (res) {
      return test.done();
    });
    test.strictEqual(this.request, req);
  },

  "promise for response object": function (test) {
    test.expect(2);
    var response = this.response
      , body = this.body

    LIB.http.put('http://www.example.com').promise.then(function (res) {
      test.strictEqual(res, response, 'response object');
      test.strictEqual(res.body, body, 'response body');
      return test.done();
    });
  }
};

exports["put() with error"] = {
  setUp: function (done) {
    this.originalMethod = REQ.put;
    var request = this.request = Object.create(null)
      , error = this.error = new Error("PUT Error")

    REQ.put = function (options, callback) {
      process.nextTick(function () {
        return callback(error);
      });
      return request;
    };

    return done();
  },

  tearDown: function (done) {
    REQ.put = this.originalMethod;
    return done();
  },

  "it rejects with an error": function (test) {
    test.expect(1);
    var error = this.error

    function shouldSkip() {
      test.ok(false, "should not be called");
      return test.done();
    }

    LIB.http.put('http://www.example.com').promise
      .then(shouldSkip)
      .catch(function (err) {
        test.strictEqual(err, error);
        return test.done();
      })
  }
};

exports["patch() without error"] = {
  setUp: function (done) {
    this.originalMethod = REQ.patch;

    var options = this.options = Object.create(null)
      , body = this.body = Object.create(null)
      , response = this.response = Object.create(null)
      , request = this.request = Object.create(null)

    REQ.patch = function (opts, callback) {
      LIB.extend(options, opts);
      process.nextTick(function () {
        return callback(null, response, body);
      });
      return request;
    };

    return done();
  },

  tearDown: function (done) {
    REQ.patch = this.originalMethod;
    return done();
  },

  "originalMethod exists": function (test) {
    test.equal(typeof this.originalMethod, 'function');
    return test.done();
  },

  "passes uri": function (test) {
    test.expect(1);
    LIB.http.patch('http://www.example.com').promise.then(function (res) {
      return test.done();
    });
    test.equal(this.options.uri, 'http://www.example.com');
  },

  "passes followRedirect = false": function (test) {
    test.expect(1);
    LIB.http.patch('http://www.example.com').promise.then(function (res) {
      return test.done();
    });
    test.strictEqual(this.options.followRedirect, false);
  },

  "passes form as option": function (test) {
    test.expect(1);
    var form = {key: 'value'}
      , req = LIB.http.patch('http://www.example.com', {body: form})

    test.strictEqual(this.options.body, form);

    req.promise.then(function (res) {
      return test.done();
    });
  },

  "returns the request object": function (test) {
    test.expect(1);
    var req = LIB.http.patch('http://www.example.com')
    req.promise.then(function (res) {
      return test.done();
    });
    test.strictEqual(this.request, req);
  },

  "promise for response object": function (test) {
    test.expect(2);
    var response = this.response
      , body = this.body

    LIB.http.patch('http://www.example.com').promise.then(function (res) {
      test.strictEqual(res, response, 'response object');
      test.strictEqual(res.body, body, 'response body');
      return test.done();
    });
  }
};

exports["patch() with error"] = {
  setUp: function (done) {
    this.originalMethod = REQ.patch;
    var request = this.request = Object.create(null)
      , error = this.error = new Error("PATCH Error")

    REQ.patch = function (options, callback) {
      process.nextTick(function () {
        return callback(error);
      });
      return request;
    };

    return done();
  },

  tearDown: function (done) {
    REQ.patch = this.originalMethod;
    return done();
  },

  "it rejects with an error": function (test) {
    test.expect(1);
    var error = this.error

    function shouldSkip() {
      test.ok(false, "should not be called");
      return test.done();
    }

    LIB.http.patch('http://www.example.com').promise
      .then(shouldSkip)
      .catch(function (err) {
        test.strictEqual(err, error);
        return test.done();
      })
  }
};

exports["del() without error"] = {
  setUp: function (done) {
    this.originalMethod = REQ.del;

    var options = this.options = Object.create(null)
      , body = this.body = Object.create(null)
      , response = this.response = Object.create(null)
      , request = this.request = Object.create(null)

    REQ.del = function (opts, callback) {
      LIB.extend(options, opts);
      process.nextTick(function () {
        return callback(null, response, body);
      });
      return request;
    };

    return done();
  },

  tearDown: function (done) {
    REQ.del = this.originalMethod;
    return done();
  },

  "originalMethod exists": function (test) {
    test.equal(typeof this.originalMethod, 'function');
    return test.done();
  },

  "passes uri": function (test) {
    test.expect(1);
    LIB.http.del('http://www.example.com').promise.then(function (res) {
      return test.done();
    });
    test.equal(this.options.uri, 'http://www.example.com');
  },

  "passes followRedirect = false": function (test) {
    test.expect(1);
    LIB.http.del('http://www.example.com').promise.then(function (res) {
      return test.done();
    });
    test.strictEqual(this.options.followRedirect, false);
  },

  "returns the request object": function (test) {
    test.expect(1);
    var req = LIB.http.del('http://www.example.com')
    req.promise.then(function (res) {
      return test.done();
    });
    test.strictEqual(this.request, req);
  },

  "promise for response object": function (test) {
    test.expect(2);
    var response = this.response
      , body = this.body

    LIB.http.del('http://www.example.com').promise.then(function (res) {
      test.strictEqual(res, response, 'response object');
      test.strictEqual(res.body, body, 'body object');
      return test.done();
    });
  }
};

exports["del() with error"] = {
  setUp: function (done) {
    this.originalMethod = REQ.del;
    var request = this.request = Object.create(null)
      , error = this.error = new Error("DELETE Error")

    REQ.del = function (options, callback) {
      process.nextTick(function () {
        return callback(error);
      });
      return request;
    };

    return done();
  },

  tearDown: function (done) {
    REQ.del = this.originalMethod;
    return done();
  },

  "it rejects with an error": function (test) {
    test.expect(1);
    var error = this.error

    function shouldSkip() {
      test.ok(false, "should not be called");
      return test.done();
    }

    LIB.http.del('http://www.example.com').promise
      .then(shouldSkip)
      .catch(function (err) {
        test.strictEqual(err, error);
        return test.done();
      })
  }
};

exports["with GET request"] = {
  setUp: function (done) {
    this.req = LIB.http.get('http://www.example.com');
    var self = this;

    this.req.promise.then(function (res) {
      self.res = res;
      return done();
    }).catch(done);
  },

  "it has a request instance": function (test) {
    test.ok(this.req instanceof Request, 'Request instance');
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

exports["with POST request"] = {
  setUp: function (done) {
    this.form = {key: 'value'}
    this.req = LIB.http.post('http://www.example.com').form(this.form);
    var self = this;

    this.req.promise.then(function (res) {
      self.res = res;
      return done();
    }).catch(done);
  },

  "it has a request instance": function (test) {
    test.ok(this.req instanceof Request, 'Request instance');
    test.equal(this.req.method, 'POST', 'method');
    test.equal(this.req.href, 'http://www.example.com/', 'href');
    return test.done();
  },

  "it has a request body": function (test) {
    test.equal(this.req.body, 'key=value');
    return test.done();
  }
};

exports["with PUT request"] = {
  setUp: function (done) {
    this.req = LIB.http.put('http://www.example.com').form({key: 'value'});
    var self = this;

    this.req.promise.then(function (res) {
      self.res = res;
      return done();
    }).catch(done);
  },

  "it has a request instance": function (test) {
    test.ok(this.req instanceof Request, 'Request instance');
    test.equal(this.req.method, 'PUT', 'method');
    test.equal(this.req.href, 'http://www.example.com/', 'href');
    return test.done();
  },

  "it has a request body": function (test) {
    test.equal(this.req.body, 'key=value');
    return test.done();
  }
};

exports["with PATCH request"] = {
  setUp: function (done) {
    this.req = LIB.http.patch('http://www.example.com').form({key: 'value'});
    var self = this;

    this.req.promise.then(function (res) {
      self.res = res;
      return done();
    }).catch(done);
  },

  "it has a request instance": function (test) {
    test.ok(this.req instanceof Request, 'Request instance');
    test.equal(this.req.method, 'PATCH', 'method');
    test.equal(this.req.href, 'http://www.example.com/', 'href');
    return test.done();
  },

  "it has a request body": function (test) {
    test.equal(this.req.body, 'key=value');
    return test.done();
  }
};

exports["with DELETE request"] = {
  setUp: function (done) {
    this.req = LIB.http.del('http://www.example.com');
    var self = this;

    this.req.promise.then(function (res) {
      self.res = res;
      return done();
    }).catch(done);
  },

  "it has a request instance": function (test) {
    test.ok(this.req instanceof Request, 'Request instance');
    test.equal(this.req.method, 'DELETE', 'method');
    test.equal(this.req.href, 'http://www.example.com/', 'href');
    return test.done();
  }
};

exports["request() with GET"] = {
  setUp: function (done) {
    this.req = LIB.http.request('http://www.example.com', {method: 'GET'});
    var self = this;

    this.req.promise.then(function (res) {
      self.res = res;
      return done();
    }).catch(done);
  },

  "it has a request instance": function (test) {
    test.ok(this.req instanceof Request, 'Request instance');
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