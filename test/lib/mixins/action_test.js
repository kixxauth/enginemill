var
Promise = require('../../../lib/promise'),
Objects = require('../../../lib/objects'),
Action  = require('../../../lib/mixins/action').Action;


exports[".q()ed methods"] = {

  setUp: function (done) {
    var args, executed, values;

    this.api      = api      = [];
    this.args     = args     = [];
    this.executed = executed = [];
    this.values   = values   = {
      v1: {},
      v2: {}
    };

    this.factory = Objects.factory([Action], {
      initialize: function () {
        this.q('bbb');
        this.q('aaa');
      },
      bbb: function (API, a) {
        api.push(API);
        args.push(a);
        if (typeof API.retval === 'function') {
          API.retval(values.v1);
        }
        executed.push(values.v1);
      },
      aaa: function (API, a) {
        api.push(API);
        args.push(a);
        if (typeof API.retval === 'function') {
          API.retval(values.v2);
        }
        executed.push(values.v2);
      }
    });
    done();
  },

  "should be executed in order queued": function (test) {
    var self = this;

    test.expect(2);

    this.factory().run()
      .then(function () {
        test.equal(self.executed[0], self.values.v1);
        test.equal(self.executed[1], self.values.v2);
        return;
      }).then(test.done, test.done);
  },

  "an api value is always present": function (test) {
    var self = this;

    test.expect(2);

    this.factory().run()
      .then(function () {
        test.ok(self.api[0]);
        test.ok(self.api[1]);
        return;
      }).then(test.done, test.done);
  },

  "API passed to tasks come from #run(api)": function (test) {
    var
    values = [],
    api    = {},
    self   = this;

    test.expect(2);

    api.retval = function (val) {
      values.push(val);
    };

    this.factory().run(api)
      .then(function () {
        test.equal(values[0], self.values.v1);
        test.equal(values[1], self.values.v2);
        return;
      }).then(test.done, test.done);
  },

  "an args value is always present": function (test) {
    var self = this;

    test.expect(2);

    this.factory().run()
      .then(function () {
        test.ok(self.args[0]);
        test.ok(self.args[1]);
        return;
      }).then(test.done, test.done);
  },

  "args passed to tasks come from #run(args)": function (test) {
    var
    args = {},
    self = this;

    test.expect(2);

    this.factory().run(null, args)
      .then(function () {
        test.equal(self.args[0], args);
        test.equal(self.args[1], args);
        return;
      }).then(test.done, test.done);
  }

};


exports["with return value"] = {

  setUp: function (done) {
    var values;
    this.values = values = {
      v1: {},
      v2: {}
    };

    this.factory = Objects.factory([Action], {
      initialize: function () {
        this.q('aaa');
        this.q('bbb');
        this.returns = 'bar';
      },
      aaa: function (api, args) {
        args.foo = values.v1;
      },
      bbb: function (api, args) {
        args.bar = values.v2;
      }
    })

    done();
  },

  "it should return the returns value": function (test) {
    var
    self = this,
    args = {};

    this.factory().run(null, args)
      .then(function (rv) {
        test.equal(rv, self.values.v2, 'return value');
        test.equal(rv, args['bar'], 'args');
        return;
      })
      .then(test.done, test.done);
  }
};


exports["with return method"] = {

  setUp: function (done) {
    var rv;
    this.rv = rv = {};

    this.factory = Objects.factory([Action], {
      initialize: function () {
        this.q('aaa');
        this.q('bbb');
      },
      aaa: function (api, args) {
        return args;
      },
      bbb: function (api, args) {
        return args;
      },
      returns: function () {
        return rv;
      }
    })

    done();
  },

  "it should return the returns value": function (test) {
    var
    self = this,
    args = {};

    this.factory().run(null, args)
      .then(function (rv) {
        test.equal(rv, self.rv, 'return value');
        test.notEqual(rv, args, 'args');
        return;
      })
      .then(test.done, test.done);
  }
};


exports["with thrown error"] = {

  setUp: function (done) {
    var err, values, executed;
    this.err = err = new Error('E1');
    this.values = values = {
      v1: {},
      v2: {}
    };
    this.executed = executed = [];

    this.factory = Objects.factory([Action], {
      initialize: function () {
        this.q('bbb');
        this.q('aaa');
      },
      bbb: function () {
        executed.push(values.v1);
        throw err;
      },
      aaa: function () {
        executed.push(values.v2);
      }
    });
    done();
  },

  "it catches error and rejects promise": function (test) {
    var self = this;

    test.expect(1);

    this.factory().run()
      .then(function () {
        test.ok(false, 'should not be called');
        return;
      }, function (err) {
        test.equal(err, self.err);
        return;
      }).then(test.done, test.done);
  },

  "stops the chain": function (test) {
    var self = this;

    test.expect(2);

    this.factory().run()
      .then(function () {
        test.ok(false, 'should not be called');
        return;
      }, function () {
        test.equal(self.executed.length, 1);
        test.equal(self.executed[0], self.values.v1);
        return;
      }).then(test.done, test.done);
  }
};


exports["with rejection"] = {

  setUp: function (done) {
    var err, values, executed;
    this.err = err = new Error('E1');
    this.values = values = {
      v1: {},
      v2: {}
    };
    this.executed = executed = [];

    this.factory = Objects.factory([Action], {
      initialize: function () {
        this.q('bbb');
        this.q('aaa');
      },
      bbb: function () {
        executed.push(values.v1);
        return Promise.reject(err);
      },
      aaa: function () {
        executed.push(values.v2);
      }
    });
    done();
  },

  "it catches rejected object": function (test) {
    var self = this;

    test.expect(1);

    this.factory().run()
      .then(function () {
        test.ok(false, 'should not be called');
        return;
      }, function (err) {
        test.equal(err, self.err);
        return;
      }).then(test.done, test.done);
  },

  "stops the chain": function (test) {
    var self = this;

    test.expect(2);

    this.factory().run()
      .then(function () {
        test.ok(false, 'should not be called');
        return;
      }, function () {
        test.equal(self.executed.length, 1);
        test.equal(self.executed[0], self.values.v1);
        return;
      }).then(test.done, test.done);
  }
};
