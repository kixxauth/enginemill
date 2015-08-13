"use strict";

var
Promise = require('../../lib/promise'),
Action  = require('../../lib/action');


exports[".q()ed methods"] = {

  setUp: function (done) {
    var args, executed, values;

    this.args     = args     = [];
    this.executed = executed = [];
    this.values   = values   = {
      v1: {},
      v2: {}
    };

    this.action = Action.create(function () {
      var
      self = {
        bbb: function (a) {
          args.push(a);
          executed.push(values.v1);
        },
        aaa: function (a) {
          args.push(a);
          executed.push(values.v2);
        }
      };

      return [
        self.bbb,
        self.aaa
      ];
    });

    done();
  },

  "should be executed in order queued": function (test) {
    var self = this;

    test.expect(2);

    this.action()
      .then(function () {
        test.equal(self.executed[0], self.values.v1);
        test.equal(self.executed[1], self.values.v2);
        return;
      }).then(test.done, test.done);
  },

  "an args value is always present": function (test) {
    var self = this;

    test.expect(1);

    this.action()
      .then(function () {
        test.ok(self.args[0]);
        return;
      }).then(test.done, test.done);
  },

  "args passed to tasks come from #run(args)": function (test) {
    var
    args = {},
    self = this;

    test.expect(1);

    this.action(args)
      .then(function () {
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

    this.action = Action.create(function () {
      var
      self = {
        aaa: function (args) {
          args.foo = values.v1;
        },
        bbb: function (args) {
          args.bar = values.v2;
        }
      };

      return [
        self.aaa,
        self.bbb
      ];
    });

    done();
  },

  "it should return the given args value": function (test) {
    var
    self = this,
    args = {};

    this.action(args)
      .then(function (rv) {
        test.equal(rv, args, 'args');
        test.equal(rv.foo, self.values.v1, 'return value 1');
        test.equal(rv.bar, self.values.v2, 'return value 2');
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

    this.action = Action.create(function () {
      var
      self = {
        bbb: function () {
          executed.push(values.v1);
          throw err;
        },
        aaa: function () {
          executed.push(values.v2);
        }
      };

      return [
        self.bbb,
        self.aaa
      ];
    });
    done();
  },

  "it catches error and rejects promise": function (test) {
    var self = this;

    test.expect(1);

    this.action()
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

    this.action()
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

    this.action = Action.create(function () {
      var
      self = {
        bbb: function () {
          executed.push(values.v1);
          return Promise.reject(err);
        },
        aaa: function () {
          executed.push(values.v2);
        }
      };

      return [
        self.bbb,
        self.aaa
      ];
    });
    done();
  },

  "it catches rejected object": function (test) {
    var self = this;

    test.expect(1);

    this.action()
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

    this.action()
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
