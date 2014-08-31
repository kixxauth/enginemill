var UTIL = require('util')

  , LIB = require('../lib/')


exports["stringify"] = {
  setUp: function (done) {
    this._inspect = UTIL.inspect
    done();
  },

  tearDown: function (done) {
    UTIL.inspect = this._inspect;
    done();
  },

  "should simply return Strings": function (test) {
    test.equal(LIB.stringify('a'), 'a')
    return test.done();
  },

  "should return Error stack String if Error": function (test) {
    var e = new Error("My new Error")
      , str = LIB.stringify(e)

    test.equal(str, e.stack);

    return test.done();
  },

  "should call facade() method if it exists": function (test) {
    var x = Object.create(null)

    test.equal(LIB.stringify(x), '{}');

    x.facade = 'bar';
    test.equal(LIB.stringify(x), "{ facade: \u001b[32m\'bar\'\u001b[39m }");

    x.facade = function (opts) {
      test.equal(opts.foo, 'bar');
      return {foo: 'bar'};
    };
    test.equal(LIB.stringify(x, {foo: 'bar'}), "{ foo: \u001b[32m\'bar\'\u001b[39m }");

    return test.done();
  },

  "should call UTIL.inspect on resulting objects": function (test) {
    var x = Object.create(null)
      , y = Object.create(null)
      , options = {}

    UTIL.inspect = function (obj) {
      test.strictEqual(obj, x);
    };
    LIB.stringify(x);

    UTIL.inspect = function (obj) {
      test.strictEqual(obj, y);
    };
    x.facade = function (opts) {
      test.strictEqual(opts, options);
      return y;
    };
    LIB.stringify(x, options);

    UTIL.inspect = function (obj, opts) {
      test.strictEqual(opts.showHidden, false);
      test.strictEqual(opts.depth, 3);
      test.strictEqual(opts.colors, true);
      test.strictEqual(opts.customInspect, true);
    };
    LIB.stringify();

    UTIL.inspect = function (obj, opts) {
      test.strictEqual(opts.showHidden, true);
      test.strictEqual(opts.depth, null);
      test.strictEqual(opts.colors, false);
      test.strictEqual(opts.customInspect, false);
    };
    LIB.stringify(null, {
      showHidden: true
    , depth: null
    , colors: false
    , customInspect: false
    });

    return test.done();
  }
};
