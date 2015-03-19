var
Promise = require('../../lib/promise'),
Objects = require('../../lib/objects'),
Action  = require('../../lib/mixins/action').Action;


exports[".q()ed methods"] = {

  setUp: function (done) {
    var args, executed, values;

    this.args     = args     = [];
    this.executed = executed = [];
    this.values   = values   = {
      v1: {},
      v2: {}
    };

    this.factory = Objects.factory([Action], {
      initialize: function () {
        this.q(this.bbb);
        this.q(this.aaa);
      },
      bbb: function (a) {
        args.push(a);
        executed.push(values.v1);
      },
      aaa: function (a) {
        args.push(a);
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

  "an args value is always present": function (test) {
    var self = this;

    test.expect(2);

    this.factory().run()
      .then(function () {
        test.ok(self.args[1]);
        test.ok(self.args[1]);
        return;
      }).then(test.done, test.done);
  },

  "args passed to tasks come from #run(args)": function (test) {
    var
    args = {},
    self = this;

    test.expect(2);

    this.factory().run(args)
      .then(function () {
        test.equal(self.args[1], args);
        test.equal(self.args[1], args);
        return;
      }).then(test.done, test.done);
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
        this.q(this.bbb);
        this.q(this.aaa);
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
        this.q(this.bbb);
        this.q(this.aaa);
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


exports["overridden onerror handler"] = {

  setUp: function (done) {
    var err, values, executed;
    this.err = err = new Error('E1');
    this.values = values = {
      v1: {}
    };
    this.executed = executed = [];

    this.factory = Objects.factory([Action], {
      initialize: function () {
        this.q(this.bbb);
        this.q(this.aaa);
      },
      bbb: function () {
        return Promise.reject(err);
      },
      aaa: function () {
        executed.push(values.v2);
      },
      onerror: function () {
        return values.v1;
      }
    });
    done();
  },

  "it can resulve error by returning it": function (test) {
    var self = this;

    test.expect(1);

    this.factory().run()
      .then(function (val) {
        test.equal(val, self.values.v1);
        return;
      }).then(test.done, test.done);
  }
};