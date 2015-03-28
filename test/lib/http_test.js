var
U       = require('../../lib/u'),
REQ     = require('../../lib/http'),
IMP     = require('request'),
Request = IMP.Request,
SERVER  = require('../common/server');


exports["get() without error"] = {
  setUp: function (done) {
    this.originalMethod = IMP.get;

    var options = this.options = Object.create(null)
      , body = this.body = Object.create(null)
      , response = this.response = Object.create(null)
      , request = this.request = Object.create(null)

    IMP.get = function (opts, callback) {
      U.extend(options, opts);
      process.nextTick(function () {
        return callback(null, response, body);
      });
      return request;
    };

    return done();
  },

  tearDown: function (done) {
    IMP.get = this.originalMethod;
    return done();
  },

  "originalMethod exists": function (test) {
    test.equal(typeof this.originalMethod, 'function');
    return test.done();
  },

  "passes uri": function (test) {
    test.expect(1);
    REQ.get('http://www.example.com').promise.then(function (res) {
      return test.done();
    });
    test.equal(this.options.uri, 'http://www.example.com');
  },

  "passes followRedirect = false": function (test) {
    test.expect(1);
    REQ.get('http://www.example.com').promise.then(function (res) {
      return test.done();
    });
    test.strictEqual(this.options.followRedirect, false);
  },

  "returns the request object": function (test) {
    test.expect(1);
    var req = REQ.get('http://www.example.com')
    req.promise.then(function (res) {
      return test.done();
    });
    test.strictEqual(this.request, req);
  },

  "promise for response object": function (test) {
    test.expect(2);
    var response = this.response
      , body = this.body

    REQ.get('http://www.example.com').promise.then(function (res) {
      test.strictEqual(res, response, 'response object');
      test.strictEqual(res.body, body, 'body object');
      return test.done();
    });
  }
};

exports["get() with error"] = {
  setUp: function (done) {
    this.originalMethod = IMP.get;
    var request = this.request = Object.create(null)
      , error = this.error = new Error("POST Error")

    IMP.get = function (options, callback) {
      process.nextTick(function () {
        return callback(error);
      });
      return request;
    };

    return done();
  },

  tearDown: function (done) {
    IMP.get = this.originalMethod;
    return done();
  },

  "it rejects with an error": function (test) {
    test.expect(1);
    var error = this.error

    function shouldSkip() {
      test.ok(false, "should not be called");
      return test.done();
    }

    REQ.get('http://www.example.com').promise
      .then(shouldSkip)
      .catch(function (err) {
        test.strictEqual(err, error);
        return test.done();
      })
  }
};

exports["post() without error"] = {
  setUp: function (done) {
    this.originalMethod = IMP.post;

    var options = this.options = Object.create(null)
      , body = this.body = Object.create(null)
      , response = this.response = Object.create(null)
      , request = this.request = Object.create(null)

    IMP.post = function (opts, callback) {
      U.extend(options, opts);
      process.nextTick(function () {
        return callback(null, response, body);
      });
      return request;
    };

    return done();
  },

  tearDown: function (done) {
    IMP.post = this.originalMethod;
    return done();
  },

  "originalMethod exists": function (test) {
    test.equal(typeof this.originalMethod, 'function');
    return test.done();
  },

  "passes uri": function (test) {
    test.expect(1);
    REQ.post('http://www.example.com').promise.then(function (res) {
      return test.done();
    });
    test.equal(this.options.uri, 'http://www.example.com');
  },

  "passes followRedirect = false": function (test) {
    test.expect(1);
    REQ.post('http://www.example.com').promise.then(function (res) {
      return test.done();
    });
    test.strictEqual(this.options.followRedirect, false);
  },

  "passes form as option": function (test) {
    test.expect(1);
    var form = {key: 'value'}
      , req = REQ.post('http://www.example.com', {body: form})

    test.strictEqual(this.options.body, form);

    req.promise.then(function (res) {
      return test.done();
    });
  },

  "returns the request object": function (test) {
    test.expect(1);
    var req = REQ.post('http://www.example.com')
    req.promise.then(function (res) {
      return test.done();
    });
    test.strictEqual(this.request, req);
  },

  "promise for response object": function (test) {
    test.expect(2);
    var response = this.response
      , body = this.body

    REQ.post('http://www.example.com').promise.then(function (res) {
      test.strictEqual(res, response, 'response object');
      test.strictEqual(res.body, body, 'response body');
      return test.done();
    });
  }
}

exports["post() with error"] = {
  setUp: function (done) {
    this.originalMethod = IMP.post;
    var request = this.request = Object.create(null)
      , error = this.error = new Error("POST Error")

    IMP.post = function (options, callback) {
      process.nextTick(function () {
        return callback(error);
      });
      return request;
    };

    return done();
  },

  tearDown: function (done) {
    IMP.post = this.originalMethod;
    return done();
  },

  "it rejects with an error": function (test) {
    test.expect(1);
    var error = this.error

    function shouldSkip() {
      test.ok(false, "should not be called");
      return test.done();
    }

    REQ.post('http://www.example.com').promise
      .then(shouldSkip)
      .catch(function (err) {
        test.strictEqual(err, error);
        return test.done();
      })
  }
};

exports["put() without error"] = {
  setUp: function (done) {
    this.originalMethod = IMP.put;

    var options = this.options = Object.create(null)
      , body = this.body = Object.create(null)
      , response = this.response = Object.create(null)
      , request = this.request = Object.create(null)

    IMP.put = function (opts, callback) {
      U.extend(options, opts);
      process.nextTick(function () {
        return callback(null, response, body);
      });
      return request;
    };

    return done();
  },

  tearDown: function (done) {
    IMP.put = this.originalMethod;
    return done();
  },

  "originalMethod exists": function (test) {
    test.equal(typeof this.originalMethod, 'function');
    return test.done();
  },

  "passes uri": function (test) {
    test.expect(1);
    REQ.put('http://www.example.com').promise.then(function (res) {
      return test.done();
    });
    test.equal(this.options.uri, 'http://www.example.com');
  },

  "passes followRedirect = false": function (test) {
    test.expect(1);
    REQ.put('http://www.example.com').promise.then(function (res) {
      return test.done();
    });
    test.strictEqual(this.options.followRedirect, false);
  },

  "passes form as option": function (test) {
    test.expect(1);
    var form = {key: 'value'}
      , req = REQ.put('http://www.example.com', {body: form})

    test.strictEqual(this.options.body, form);

    req.promise.then(function (res) {
      return test.done();
    });
  },

  "returns the request object": function (test) {
    test.expect(1);
    var req = REQ.put('http://www.example.com')
    req.promise.then(function (res) {
      return test.done();
    });
    test.strictEqual(this.request, req);
  },

  "promise for response object": function (test) {
    test.expect(2);
    var response = this.response
      , body = this.body

    REQ.put('http://www.example.com').promise.then(function (res) {
      test.strictEqual(res, response, 'response object');
      test.strictEqual(res.body, body, 'response body');
      return test.done();
    });
  }
};

exports["put() with error"] = {
  setUp: function (done) {
    this.originalMethod = IMP.put;
    var request = this.request = Object.create(null)
      , error = this.error = new Error("PUT Error")

    IMP.put = function (options, callback) {
      process.nextTick(function () {
        return callback(error);
      });
      return request;
    };

    return done();
  },

  tearDown: function (done) {
    IMP.put = this.originalMethod;
    return done();
  },

  "it rejects with an error": function (test) {
    test.expect(1);
    var error = this.error

    function shouldSkip() {
      test.ok(false, "should not be called");
      return test.done();
    }

    REQ.put('http://www.example.com').promise
      .then(shouldSkip)
      .catch(function (err) {
        test.strictEqual(err, error);
        return test.done();
      })
  }
};

exports["patch() without error"] = {
  setUp: function (done) {
    this.originalMethod = IMP.patch;

    var options = this.options = Object.create(null)
      , body = this.body = Object.create(null)
      , response = this.response = Object.create(null)
      , request = this.request = Object.create(null)

    IMP.patch = function (opts, callback) {
      U.extend(options, opts);
      process.nextTick(function () {
        return callback(null, response, body);
      });
      return request;
    };

    return done();
  },

  tearDown: function (done) {
    IMP.patch = this.originalMethod;
    return done();
  },

  "originalMethod exists": function (test) {
    test.equal(typeof this.originalMethod, 'function');
    return test.done();
  },

  "passes uri": function (test) {
    test.expect(1);
    REQ.patch('http://www.example.com').promise.then(function (res) {
      return test.done();
    });
    test.equal(this.options.uri, 'http://www.example.com');
  },

  "passes followRedirect = false": function (test) {
    test.expect(1);
    REQ.patch('http://www.example.com').promise.then(function (res) {
      return test.done();
    });
    test.strictEqual(this.options.followRedirect, false);
  },

  "passes form as option": function (test) {
    test.expect(1);
    var form = {key: 'value'}
      , req = REQ.patch('http://www.example.com', {body: form})

    test.strictEqual(this.options.body, form);

    req.promise.then(function (res) {
      return test.done();
    });
  },

  "returns the request object": function (test) {
    test.expect(1);
    var req = REQ.patch('http://www.example.com')
    req.promise.then(function (res) {
      return test.done();
    });
    test.strictEqual(this.request, req);
  },

  "promise for response object": function (test) {
    test.expect(2);
    var response = this.response
      , body = this.body

    REQ.patch('http://www.example.com').promise.then(function (res) {
      test.strictEqual(res, response, 'response object');
      test.strictEqual(res.body, body, 'response body');
      return test.done();
    });
  }
};

exports["patch() with error"] = {
  setUp: function (done) {
    this.originalMethod = IMP.patch;
    var request = this.request = Object.create(null)
      , error = this.error = new Error("PATCH Error")

    IMP.patch = function (options, callback) {
      process.nextTick(function () {
        return callback(error);
      });
      return request;
    };

    return done();
  },

  tearDown: function (done) {
    IMP.patch = this.originalMethod;
    return done();
  },

  "it rejects with an error": function (test) {
    test.expect(1);
    var error = this.error

    function shouldSkip() {
      test.ok(false, "should not be called");
      return test.done();
    }

    REQ.patch('http://www.example.com').promise
      .then(shouldSkip)
      .catch(function (err) {
        test.strictEqual(err, error);
        return test.done();
      })
  }
};

exports["del() without error"] = {
  setUp: function (done) {
    this.originalMethod = IMP.del;

    var options = this.options = Object.create(null)
      , body = this.body = Object.create(null)
      , response = this.response = Object.create(null)
      , request = this.request = Object.create(null)

    IMP.del = function (opts, callback) {
      U.extend(options, opts);
      process.nextTick(function () {
        return callback(null, response, body);
      });
      return request;
    };

    return done();
  },

  tearDown: function (done) {
    IMP.del = this.originalMethod;
    return done();
  },

  "originalMethod exists": function (test) {
    test.equal(typeof this.originalMethod, 'function');
    return test.done();
  },

  "passes uri": function (test) {
    test.expect(1);
    REQ.del('http://www.example.com').promise.then(function (res) {
      return test.done();
    });
    test.equal(this.options.uri, 'http://www.example.com');
  },

  "passes followRedirect = false": function (test) {
    test.expect(1);
    REQ.del('http://www.example.com').promise.then(function (res) {
      return test.done();
    });
    test.strictEqual(this.options.followRedirect, false);
  },

  "returns the request object": function (test) {
    test.expect(1);
    var req = REQ.del('http://www.example.com')
    req.promise.then(function (res) {
      return test.done();
    });
    test.strictEqual(this.request, req);
  },

  "promise for response object": function (test) {
    test.expect(2);
    var response = this.response
      , body = this.body

    REQ.del('http://www.example.com').promise.then(function (res) {
      test.strictEqual(res, response, 'response object');
      test.strictEqual(res.body, body, 'body object');
      return test.done();
    });
  }
};

exports["del() with error"] = {
  setUp: function (done) {
    this.originalMethod = IMP.del;
    var request = this.request = Object.create(null)
      , error = this.error = new Error("DELETE Error")

    IMP.del = function (options, callback) {
      process.nextTick(function () {
        return callback(error);
      });
      return request;
    };

    return done();
  },

  tearDown: function (done) {
    IMP.del = this.originalMethod;
    return done();
  },

  "it rejects with an error": function (test) {
    test.expect(1);
    var error = this.error

    function shouldSkip() {
      test.ok(false, "should not be called");
      return test.done();
    }

    REQ.del('http://www.example.com').promise
      .then(shouldSkip)
      .catch(function (err) {
        test.strictEqual(err, error);
        return test.done();
      })
  }
};

exports["with GET request"] = {
  setUp: function (done) {
    var self = this
    this.server = SERVER.createServer(null, function (err, address) {
      if (err) return done(err);
      self.address = address;
      try {
        self.req = REQ.get(address);
      } catch (err) {
        return done(err);
      }
      self.req.promise.then(function (response) {
        self.res = response;
        return done();
      }).catch(done);
    });
  },

  tearDown: function (done) {
    this.server.close();
    return done();
  },

  "it has a request instance": function (test) {
    test.ok(this.req instanceof Request, 'Request instance');
    test.equal(this.req.method, 'GET', 'method');
    test.equal(this.req.href, this.address +'/', 'href');
    return test.done();
  },

  "its status is 200": function (test) {
    test.strictEqual(this.res.statusCode, 200);
    return test.done();
  },

  "its content-type is text/plain": function (test) {
    var headers = this.res.headers
    test.equal(headers['content-type'], 'text/plain');
    return test.done();
  },

  "it has a body": function (test) {
    test.ok(Buffer.isBuffer(this.res.body), 'body is a Buffer');
    test.ok(this.res.body.length > 0, 'body has length');
    return test.done();
  }
};

exports["with POST request"] = {
  setUp: function (done) {
    var self = this
      , opts = {
          echo: true
        , responseStatus: 201
        }

    this.server = SERVER.createServer(opts, function (err, address) {
      if (err) return done(err);
      self.address = address;
      try {
        self.req = REQ.post(address).form({key: 'value'});
      } catch (err) {
        return done(err);
      }
      self.req.promise.then(function (response) {
        self.res = response;
        self.echo = JSON.parse(response.body.toString());
        return done();
      }).catch(done);
    });
  },

  tearDown: function (done) {
    this.server.close();
    return done();
  },

  "it has a request instance": function (test) {
    test.ok(this.req instanceof Request, 'Request instance');
    test.equal(this.req.method, 'POST', 'method');
    test.equal(this.req.href, this.address +'/', 'href');
    return test.done();
  },

  "it has a request body": function (test) {
    test.equal(this.req.body, 'key=value');
    return test.done();
  },

  "its method was POST": function (test) {
    test.equal(this.echo.method, 'POST');
    return test.done();
  },

  "its status is 201": function (test) {
    test.strictEqual(this.res.statusCode, 201);
    return test.done();
  },

  "its POST body was correct": function (test) {
    test.equal(this.echo.body, 'key=value');
    return test.done();
  }
};

exports["with PUT request"] = {
  setUp: function (done) {
    var self = this
      , opts = {
          echo: true
        }

    this.server = SERVER.createServer(opts, function (err, address) {
      if (err) return done(err);
      self.address = address;
      try {
        self.req = REQ.put(address).form({key: 'value'});
      } catch (err) {
        return done(err);
      }
      self.req.promise.then(function (response) {
        self.res = response;
        self.echo = JSON.parse(response.body.toString());
        return done();
      }).catch(done);
    });
  },

  tearDown: function (done) {
    this.server.close();
    return done();
  },

  "it has a request instance": function (test) {
    test.ok(this.req instanceof Request, 'Request instance');
    test.equal(this.req.method, 'PUT', 'method');
    test.equal(this.req.href, this.address +'/', 'href');
    return test.done();
  },

  "its method was PUT": function (test) {
    test.equal(this.echo.method, 'PUT');
    return test.done();
  },

  "it has a request body": function (test) {
    test.equal(this.req.body, 'key=value');
    return test.done();
  }
};

exports["with PATCH request"] = {
  setUp: function (done) {
    var self = this
      , opts = {
          echo: true
        }

    this.server = SERVER.createServer(opts, function (err, address) {
      if (err) return done(err);
      self.address = address;
      try {
        self.req = REQ.patch(address).form({key: 'value'});
      } catch (err) {
        return done(err);
      }
      self.req.promise.then(function (response) {
        self.res = response;
        self.echo = JSON.parse(response.body.toString());
        return done();
      }).catch(done);
    });
  },

  tearDown: function (done) {
    this.server.close();
    return done();
  },

  "it has a request instance": function (test) {
    test.ok(this.req instanceof Request, 'Request instance');
    test.equal(this.req.method, 'PATCH', 'method');
    test.equal(this.req.href, this.address +'/', 'href');
    return test.done();
  },

  "its method was PATCH": function (test) {
    test.equal(this.echo.method, 'PATCH');
    return test.done();
  },

  "it has a request body": function (test) {
    test.equal(this.req.body, 'key=value');
    return test.done();
  }
};

exports["with DELETE request"] = {
  setUp: function (done) {
    var self = this
      , opts = {
          echo: true
        }

    this.server = SERVER.createServer(opts, function (err, address) {
      if (err) return done(err);
      self.address = address;
      try {
        self.req = REQ.del(address);
      } catch (err) {
        return done(err);
      }
      self.req.promise.then(function (response) {
        self.res = response;
        self.echo = JSON.parse(response.body.toString());
        return done();
      }).catch(done);
    });
  },

  tearDown: function (done) {
    this.server.close();
    return done();
  },

  "it has a request instance": function (test) {
    test.ok(this.req instanceof Request, 'Request instance');
    test.equal(this.req.method, 'DELETE', 'method');
    test.equal(this.req.href, this.address +'/', 'href');
    return test.done();
  },

  "its method was DELETE": function (test) {
    test.equal(this.echo.method, 'DELETE');
    return test.done();
  },

  "its status is 200": function (test) {
    test.strictEqual(this.res.statusCode, 200);
    return test.done();
  },
};

exports["request() with GET"] = {
  setUp: function (done) {
    var self = this
    this.server = SERVER.createServer(null, function (err, address) {
      if (err) return done(err);
      self.address = address;
      try {
        self.req = REQ.request(address, {method: 'GET'});
      } catch (err) {
        return done(err);
      }
      self.req.promise.then(function (response) {
        self.res = response;
        return done();
      }).catch(done);
    });
  },

  tearDown: function (done) {
    this.server.close();
    return done();
  },

  "it has a request instance": function (test) {
    test.ok(this.req instanceof Request, 'Request instance');
    test.equal(this.req.method, 'GET', 'method');
    test.equal(this.req.href, this.address +'/', 'href');
    return test.done();
  },

  "its status is 200": function (test) {
    test.strictEqual(this.res.statusCode, 200);
    return test.done();
  },

  "its content-type is text/html": function (test) {
    var headers = this.res.headers
    test.equal(headers['content-type'], 'text/plain');
    return test.done();
  },

  "it has a body": function (test) {
    test.ok(Buffer.isBuffer(this.res.body), 'body is a Buffer');
    test.ok(this.res.body.length > 0, 'body has length');
    return test.done();
  }
};