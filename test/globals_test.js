// Expected globals in native JavaScript.
var javaScriptGlobals = [
  'JSON',
  'escape',
  'Math',
  'EvalError',
  'encodeURI',
  'encodeURIComponent',
  'RangeError',
  'RegExp',
  'Infinity',
  'eval',
  'URIError',
  'parseInt',
  'parseFloat',
  'SyntaxError',
  'Date',
  'isFinite',
  'NaN',
  'Number',
  'Object',
  'Function',
  'Boolean',
  'Error',
  'TypeError',
  'decodeURIComponent',
  'decodeURI',
  'ReferenceError',
  'undefined',
  'isNaN',
  'Array',
  'Uint8ClampedArray',
  'String',
  'unescape'
]

// Expected globals in Node.js.
var nodejsGlobals = [
  'ArrayBuffer',
  'Int8Array',
  'Uint8Array',
  'Uint8ClampedArray',
  'Int16Array',
  'Uint16Array',
  'Int32Array',
  'Uint32Array',
  'Float32Array',
  'Float64Array',
  'DataView',
  'global',
  'process',
  'GLOBAL',
  'root',
  'Buffer',
  'setTimeout',
  'setInterval',
  'clearTimeout',
  'clearInterval',
  'console'
]

// Expected globals introduced by Enginemill.
var enginemillGlobals = [
  'fail',
  'LIB',
  'print',
  'Promise',
  'SETTINGS'
]

// Get a list of all the globals in our current space.
var preDefinedGlobals = Object.getOwnPropertyNames(global)
  .map(function (key) {
    return {key: key, ref: global[key]};
  });



exports['when environment loaded'] = {

  setUp: function (done) {
    require('../').load()
      .then(function (env) {
        done();
      }).catch(done);
  },

  'it should not clobber existing globals': function (test) {
    test.expect(preDefinedGlobals.length);

    preDefinedGlobals.forEach(function (pre) {

      // Test NaN separately.
      if (pre.key === 'NaN') {
        test.ok(isNaN(NaN), "NaN should pass isNaN()");
        return;
      }

      // Test undefined separately.
      if (pre.key === 'undefined') {
        test.ok((undefined === void 0), "undefined === void 0");
        return;
      }

      test.strictEqual(global[pre.key], pre.ref, pre.key);
    });
    
    test.done();
  },

  'it should not introduce unexpected globals': function (test) {
    var expected = preDefinedGlobals.map(function (g) {
      return g.key;
    });

    expected = expected.concat(enginemillGlobals);

    var actual = Object.getOwnPropertyNames(global)
    test.expect(actual.length);

    actual.forEach(function (key) {
      test.ok(expected.indexOf(key) > -1, key);
    });

    test.done();
  },

  'it should keep all JavaScript globals': function (test) {
    test.expect(javaScriptGlobals.length);

    var globalKeys = Object.getOwnPropertyNames(global)

    javaScriptGlobals.forEach(function (key) {
      test.ok(globalKeys.indexOf(key) > -1, key);
    });

    test.done();
  },

  'it should keep all Node.js globals': function (test) {
    test.expect(nodejsGlobals.length);

    var globalKeys = Object.getOwnPropertyNames(global)

    nodejsGlobals.forEach(function (key) {
      test.ok(globalKeys.indexOf(key) > -1, key);
    });

    test.done();
  },

  'it should merge in all Enginemill globals': function (test) {
    test.expect(enginemillGlobals.length);

    var globalKeys = Object.getOwnPropertyNames(global)

    enginemillGlobals.forEach(function (key) {
      test.ok(globalKeys.indexOf(key) > -1, key);
    });

    test.done();
  },

  'it should make Enginemill globals unwritable': function (test) {
    test.expect(enginemillGlobals.length);

    enginemillGlobals.forEach(function (key) {
      var x = {};
      global[key] = x;
      test.notStrictEqual(global[key], x, key);
    });

    test.done();
  },

  'it should make Enginemill globals unconfigurable': function (test) {
    test.expect(enginemillGlobals.length);

    enginemillGlobals.forEach(function (key) {
      test.throws(function () {
        Object.defineProperty(global, key, {value: 'foo'});
      }, 'Cannot redefine property: '+ key, key + ' should throw');
    });

    test.done();
  },

  'it should make Enginemill globals enumerable': function (test) {
    test.expect(enginemillGlobals.length);

    var enumerables = Object.keys(global);

    enginemillGlobals.forEach(function (key) {
      test.ok(enumerables.indexOf(key) > 1, key);
    });

    test.done();
  }
};
