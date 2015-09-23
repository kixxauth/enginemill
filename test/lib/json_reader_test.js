'use strict';

var
FP     = require('filepath'),
TOOLS  = require('../tools/'),
ERRORS = require('../../lib/errors'),

readJSON = require('../../lib/json_reader').readJSON;


exports["when file does not exist"] = {
  setUp: function (done) {
    var self = this;

    TOOLS.runOnce("when file does not exist", function () {
      return readJSON(TOOLS.fixturePath.append('foo.json'));
    })
    .then(function (res) {
      self.res = res;
    })
    .then(done)
    .catch(done);
  },

  "returns null": function (test) {
    var res = this.res;
    test.strictEqual(res, null, 'is not null');
    return test.done();
  }
};

exports["with directory as path"] = {
  setUp: function (done) {
    var self = this;

    TOOLS.runOnce("with directory as path", function () {
      // There is a directory in fakedir/ named 'package.json/'.
      return readJSON(TOOLS.fixturePath.append('fakedir', 'package.json'));
    })
    .then(function (res) {
      self.res = res;
    })
    .catch(ERRORS.ArgumentError, function (err) {
      self.error = err;
    })
    .then(done)
    .catch(done);
  },

  "rejects with ArgumentError": function (test) {
    var err = this.error;
    test.ok((err instanceof ERRORS.ArgumentError), 'is not an ArgumentError');
    test.equal(err.message, 'The expected file path is not a file');
    return test.done();
  }
};

exports["with invalid JSON file"] = {
  setUp: function (done) {
    var self = this;

    TOOLS.runOnce("with invalid JSON file", function () {
      return readJSON(TOOLS.fixturePath.append('invalid_package_json', 'package.json'));
    })
    .then(function (res) {
      self.res = res;
    })
    .catch(ERRORS.JSONReadError, function (err) {
      self.error = err;
    })
    .then(done)
    .catch(done);
  },

  "rejects with JSONReadError": function (test) {
    var err = this.error;
    test.ok((err instanceof ERRORS.JSONReadError), 'is not a JSONReadError');
    test.ok(/^JSON SyntaxError:/.test(err.message), err.message);
    return test.done();
  }
};

exports["with valid JSON file"] = {
  setUp: function (done) {
    var self = this;

    TOOLS.runOnce("with valid JSON file", function () {
      return readJSON(FP.create(__dirname).resolve('../../package.json'));
    })
    .then(function (res) {
      self.res = res;
    })
    .then(done)
    .catch(done);
  },

  "returns an Object": function (test) {
    var res = this.res;
    test.equal(typeof res, 'object');
    test.equal(res.name, 'enginemill');
    test.equal(typeof res.version, 'string');
    return test.done();
  }
};
