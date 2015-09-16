'use strict';

var
FP      = require('filepath'),
sinon   = require('sinon'),
U       = require('../../lib/u'),
Promise = require('../../lib/promise'),
TOOLS   = require('../tools/'),

loadConfigs = require('../../lib/configs_files_loader').loadConfigs,
jsonReader  = require('../../lib/json_reader');


exports["when both files not found"] = {
  setUp: function (done) {
    var self = this;

    this.environment = 'development';
    this.readJSON = sinon.stub(jsonReader, 'readJSON');

    // Setup the first two calls.
    this.readJSON.onCall(0).returns(Promise.resolve(null));
    this.readJSON.onCall(1).returns(Promise.resolve(null));

    loadConfigs({
      appdir        : FP.create(__dirname),
      sysconfigsdir : FP.root(),
      environment   : this.environment
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

  "jsonReader is called twice": function (test) {
    var stub = this.readJSON;
    test.equal(stub.callCount, 2, 'was not called twice');
    test.done();
  },

  "appends '<environment>.json' to passed directory": function (test) {
    var
    appArg, sysArg,
    stub        = this.readJSON,
    appExpected = FP.create(__dirname).append(this.environment +'.json').toString(),
    sysExpected = FP.root().append(this.environment +'.json').toString();

    appArg = stub.args[0][0].toString();
    sysArg = stub.args[1][0].toString();
    test.equal(appArg, appExpected, appArg);
    test.equal(sysArg, sysExpected, sysArg);

    test.done();
  },

  "returns an emtpy Object": function (test) {
    var
    ownProperties,
    res = this.res;

    test.ok(U.isObject(res), 'return value is not an Object');
    ownProperties = Object.getOwnPropertyNames(res);
    test.equal(ownProperties.length, 0, 'return value is not an empty Object');

    test.done();
  }
};

exports["when appdir file cannot be found"] = {
  setUp: function (done) {
    var self = this;

    this.sysVal = {
      foo: 'bar',
      num: 1
    };

    this.readJSON = sinon.stub(jsonReader, 'readJSON');

    // Setup the first two calls.
    this.readJSON.onCall(0).returns(Promise.resolve(null));
    this.readJSON.onCall(1).returns(Promise.resolve(this.sysVal));

    loadConfigs({
      appdir        : FP.create(__dirname),
      sysconfigsdir : FP.root(),
      environment   : 'development'
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

  "jsonReader is called twice": function (test) {
    var stub = this.readJSON;
    test.equal(stub.callCount, 2, 'was not called twice');
    test.done();
  },

  "returns object with expected own properties": function (test) {
    var
    res = this.res;

    test.ok(U.isObject(res), 'return value is not an Object');
    test.ok(TOOLS.hasOwnProp(res, 'foo'));
    test.equal(res.foo, this.sysVal.foo, 'own property "foo"');
    test.ok(TOOLS.hasOwnProp(res, 'num'));
    test.equal(res.num, this.sysVal.num, 'own property "num"');

    test.done();
  }
};

exports["when sysconfigsdir file cannot be found"] = {
  setUp: function (done) {
    var self = this;

    this.appVal = {
      foo: 'bar',
      num: 1
    };

    this.readJSON = sinon.stub(jsonReader, 'readJSON');

    // Setup the first two calls.
    this.readJSON.onCall(0).returns(Promise.resolve(this.appVal));
    this.readJSON.onCall(1).returns(Promise.resolve(null));

    loadConfigs({
      appdir        : FP.create(__dirname),
      sysconfigsdir : FP.root(),
      environment   : 'development'
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

  "jsonReader is called twice": function (test) {
    var stub = this.readJSON;
    test.equal(stub.callCount, 2, 'was not called twice');
    test.done();
  },

  "returns object with expected own properties": function (test) {
    var
    res = this.res;

    test.ok(U.isObject(res), 'return value is not an Object');
    test.ok(TOOLS.hasOwnProp(res, 'foo'));
    test.equal(res.foo, this.appVal.foo, 'own property "foo"');
    test.ok(TOOLS.hasOwnProp(res, 'num'));
    test.equal(res.num, this.appVal.num, 'own property "num"');

    test.done();
  }
};

exports["with sys and environment conflicts"] = {
  setUp: function (done) {
    var self = this;
    this.environment = 'development';

    this.appVal = {
      app_config: 'qwerty',
      sys_config: 'will be overwritten',
      nulled: 'will be set to null',
      not_undefined: 'survives'
    };

    this.sysVal = {
      sys_config: 'tyuiop',
      global_config: 'global config',
      nulled: null,
      not_undefined: undefined
    };

    this.readJSON = sinon.stub(jsonReader, 'readJSON');

    // Setup the first two calls.
    this.readJSON.onCall(0).returns(Promise.resolve(this.appVal));
    this.readJSON.onCall(1).returns(Promise.resolve(this.sysVal));

    loadConfigs({
      appdir        : FP.create(__dirname),
      sysconfigsdir : FP.root(),
      environment   : this.environment
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

  "jsonReader is called twice": function (test) {
    var stub = this.readJSON;
    test.equal(stub.callCount, 2, 'was not called twice');
    test.done();
  },

  "app configs persist when not overwritten": function (test) {
    var
    res    = this.res,
    appVal = this.appVal;

    test.equal(res.app_config, appVal.app_config);
    test.done();
  },

  "sys configs overwrite": function (test) {
    var
    res    = this.res,
    sysVal = this.sysVal;

    test.equal(res.sys_config, sysVal.sys_config);
    test.done();
  },

  "values can be set to null": function (test) {
    var
    res = this.res;

    test.equal(res.undef, null);
    test.done();
  },

  "values are not unset with undefined": function (test) {
    var
    res    = this.res,
    sysVal = this.sysVal;

    test.strictEqual(res.not_undefined, sysVal.not_undefined);
    test.done();
  }
};
