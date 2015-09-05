'use strict';

var
FP     = require('filepath'),
TOOLS  = require('../tools/'),
ERRORS = require('../../lib/errors'),

readPackageJSON = require('../../lib/package_json_loader').readPackageJSON;


exports["when file does not exist"] = {
  setUp: function (done) {
    var self = this;

    TOOLS.runOnce("when file does not exist", function () {
      return readPackageJSON({
        appdir: TOOLS.fixturePath
      });
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

exports["when directory does not exist"] = {
  setUp: function (done) {
    var self = this;

    TOOLS.runOnce("when directory does not exist", function () {
      return readPackageJSON({
        appdir: TOOLS.fixturePath.append('foo')
      });
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

exports["with directory named package.json"] = {
  setUp: function (done) {
    var self = this;

    TOOLS.runOnce("with directory named package.json", function () {
      return readPackageJSON({
        // There is a directory in fakedir/ named 'package.json/'.
        appdir: TOOLS.fixturePath.append('fakedir')
      });
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
    test.equal(err.message, 'The expected file path is a directory');
    return test.done();
  }
};

exports["with invalid package.json"] = {
  setUp: function (done) {
    var self = this;

    TOOLS.runOnce("with invalid package.json", function () {
      return readPackageJSON({
        appdir: TOOLS.fixturePath.append('invalid_package_json')
      });
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

exports["with valid package.json"] = {
  setUp: function (done) {
    var self = this;

    TOOLS.runOnce("with valid package.json", function () {
      return readPackageJSON({
        appdir: FP.create(__dirname).resolve('../../')
      });
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
