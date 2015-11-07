'use strict';

var
TOOLS = require('./tools/'),

enginemill = require('../'),
Errors     = enginemill.Errors;


exports["when file does not exist"] = {
  setUp: function (done) {
    var self = this;

    TOOLS.runOnce("when file does not exist", function () {
      return enginemill.readJSON({
        path: TOOLS.fixturePath.append('foo.json')
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

exports["with directory as path"] = {
  setUp: function (done) {
    var self = this;

    TOOLS.runOnce("with directory as path", function () {
      // There is a directory in fakedir/ named 'package.json/'.
      return enginemill.readJSON({
        path: TOOLS.fixturePath.append('fakedir', 'package.json')
      });
    })
    .then(function (res) {
      self.res = res;
    })
    .catch(Errors.OperationalError, function (err) {
      self.error = err;
    })
    .then(done)
    .catch(done);
  },

  "rejects with OperationalError": function (test) {
    var err = this.error;
    test.ok((err instanceof Errors.OperationalError), 'is not an OperationalError');
    test.ok(/^The FilePath is not a file/.test(err.message), 'err.message');
    return test.done();
  }
};

exports["with invalid JSON file"] = {
  setUp: function (done) {
    var self = this;

    TOOLS.runOnce("with invalid JSON file", function () {
      return enginemill.readJSON({
        path: TOOLS.fixturePath.append('invalid_package_json', 'package.json')
      });
    })
    .then(function (res) {
      self.res = res;
    })
    .catch(Errors.JSONParseError, function (err) {
      self.error = err;
    })
    .then(done)
    .catch(done);
  },

  "rejects with JSONParseError": function (test) {
    var err = this.error;
    test.ok((err instanceof Errors.JSONParseError), 'is not a JSONParseError');
    test.ok(/^JSON SyntaxError:/.test(err.message), err.message);
    return test.done();
  }
};

exports["with valid JSON file"] = {
  setUp: function (done) {
    var self = this;

    TOOLS.runOnce("with valid JSON file", function () {
      var fp = enginemill.filepath.create(__dirname).resolve('../package.json');
      return enginemill.readJSON({
        path: fp
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
