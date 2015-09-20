'use strict';

var
FP      = require('filepath'),
sinon   = require('sinon'),
Promise = require('../../lib/promise'),

readPackageJSON = require('../../lib/package_json_loader').readPackageJSON,
jsonReader      = require('../../lib/json_reader');


exports["with directory"] = {
  setUp: function (done) {
    var self = this;

    this.readJSON = sinon.stub(jsonReader, 'readJSON');
    this.returns  = Object.create(null);
    this.readJSON.returns(Promise.resolve(this.returns));

    readPackageJSON({
      appdir: FP.create(__dirname)
    })
    .then(function (res) {
      self.res = res;
    })
    .then(done)
    .catch(done);
  },

  tearDown: function (done) {
    this.readJSON.restore();
    done();
  },

  "appends 'package.json' to passed directory": function (test) {
    var
    arg,
    stub = this.readJSON,
    expected = FP.create(__dirname).append('package.json').toString();

    test.ok(stub.calledOnce, 'was not called once');
    arg = stub.args[0][0].toString();
    test.equal(arg, expected, arg);

    test.done();
  },

  "returns the return value from jsonReader": function (test) {
    var
    res      = this.res,
    expected = this.returns;

    test.strictEqual(res, expected, 'expected isnt ===');

    test.done();
  }
};
