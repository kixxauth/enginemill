var

U = require('../../lib/u');


exports["U.execute()"] = {

  "with no arguments": {

    setUp: function (done) {
      var
      res = executeWithNoArguments();
      this.returns = res.returns;
      return done();
    },

    "it returns a function that returns an empty array": function (test) {
      var
      res = this.returns();

      test.ok(isArray(res));
      test.strictEqual(res.length, 0);

      return test.done();
    }
  },

  "with invalid arguments": {

    setUp: function (done) {
      var
      res = executeWithInvalidArguments();
      this.returns = res.returns;
      return done();
    },

    "it returns a function that returns an empty array": function (test) {
      var
      res = this.returns();

      test.ok(isArray(res));
      test.strictEqual(res.length, 0);

      return test.done();
    }
  },

  "with list of Functions with no args": {

    setUp: function (done) {
      var
      res = executeWithFunctionsWithNoArgs();
      this.functions = res.functions;
      this.expectedResults = res.expectedResults;
      this.executionOrder = res.executionOrder;
      this.returns = res.returns;
      return done();
    },

    "it returns a function that executes functions in order": function (test) {
      var
      order, functions,
      res = this.returns();

      order = this.executionOrder,
      functions = this.functions;

      test.equal(order[0], functions[0]);
      test.equal(order[1], functions[1]);
      test.equal(order[2], functions[2]);

      return test.done();
    },

    "it return a function that returns an ordered array of results": function (test) {
      var
      res = this.returns();

      test.strictEqual(res[0], this.expectedResults[0]);
      test.strictEqual(res[1], this.expectedResults[1]);
      test.strictEqual(res[2], this.expectedResults[2]);

      return test.done();
    }
  },

  "with bound and passed arguments": {

    setUp: function (done) {
      var
      res = executeWithBoundArgs();
      this.returns = res.returns;
      this.boundArguments = res.boundArguments;
      return done();
    },

    "functions are called with bound arguments first": function (test) {
      var
      args, res1, res2,
      res = this.returns();

      args = this.boundArguments;
      res1 = res[0];
      res2 = res[1];

      test.strictEqual(res1[0], args[0]);
      test.strictEqual(res1[1], args[1]);
      test.strictEqual(res1[2], args[2]);
      test.strictEqual(res2[0], args[0]);
      test.strictEqual(res2[1], args[1]);
      test.strictEqual(res2[2], args[2]);

      return test.done();
    },

    "functions are called with passed arguments second": function (test) {
      var
      res, res1, res2,
      arg1 = {},
      arg2 = {},

      res = this.returns(arg1, arg2);
      res1 = res[0];
      res2 = res[1];

      test.equal(res1[3], arg1);
      test.equal(res1[4], arg2);
      test.equal(res2[3], arg1);
      test.equal(res2[4], arg2);

      return test.done();
    }
  }
};


var executeWithNoArguments = U.once(function () {
  var
  res = Object.create(null);

  res.returns = U.execute();
  return res;
});

var executeWithInvalidArguments = U.once(function () {
  var
  res = Object.create(null);

  res.returns = U.execute(1);
  return res;
});

var executeWithFunctionsWithNoArgs = U.once(function () {
  var
  res = Object.create(null);
  res.expectedResults = ['one', 'two', 'three'];
  res.executionOrder = [];

  function f1() {
    res.executionOrder.push(f1);
    return res.expectedResults[0];
  }

  function f2() {
    res.executionOrder.push(f2);
    return res.expectedResults[1];
  }

  function f3() {
    res.executionOrder.push(f3);
    return res.expectedResults[2];
  }

  res.functions = [f1, f2, f3];
  res.returns = U.execute(res.functions);
  return res;
});

var executeWithBoundArgs = U.once(function () {
  var
  args,
  res = Object.create(null);
  res.boundArguments = args = [true, 2, 'three'];

  function f1() {
    return arguments;
  }

  function f2() {
    return arguments;
  }

  res.returns = U.execute([f1, f2], args[0], args[1], args[2]);
  return res;
});


function isArray(obj) {
  return Object.prototype.toString.call(obj) === '[object Array]';
}
