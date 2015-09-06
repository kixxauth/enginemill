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

    this.readJSON = sinon.stub(jsonReader, 'readJSON');

    // Setup the first two calls.
    this.readJSON.onCall(0).returns(Promise.resolve(null));
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

  "appends 'package.json' to passed directory": function (test) {
    var
    appArg, sysArg,
    stub        = this.readJSON,
    appExpected = FP.create(__dirname).append('configs.json').toString(),
    sysExpected = FP.root().append('configs.json').toString();

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
      secret_one: 'should not be used',
      secret_two: 'also should not be used',
      app_config: 'qwerty',
      sys_config: 'will be overwritten',
      undef: 'will be undefined'
    };
    this.appVal[this.environment] = {
      secret_one: 'first secret',
      secret_two: 'second secret',
      another_undef: 'will also be undefined'
    };

    this.sysVal = {
      sys_config: 'tyuiop',
      global_config: 'global config',
      another_undef: null
    };
    this.sysVal[this.environment] = {
      secret_two: 'overwritten secret',
      env_global_config: 'environment global config',
      undef: null
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

  "environment configs get precedence": function (test) {
    var
    res    = this.res,
    env    = this.environment,
    appVal = this.appVal,
    sysVal = this.sysVal;

    test.equal(res.secret_one, appVal[env].secret_one);
    test.equal(res.secret_two, sysVal[env].secret_two);
    test.done();
  },

  "sys configs overwrite": function (test) {
    var
    res    = this.res,
    env    = this.environment,
    sysVal = this.sysVal;

    test.equal(res.sys_config, sysVal.sys_config);
    test.equal(res.secret_two, sysVal[env].secret_two);
    test.done();
  },

  "values can be set to null": function (test) {
    var
    res = this.res;

    test.equal(res.undef, null);
    test.equal(res.another_undef, null);
    test.done();
  },

  "environment object does not exist": function (test) {
    var
    res = this.res,
    env = this.environment;

    test.equal(typeof res[env], 'undefined');
    test.done();
  },

  "values are not unset with undefined": function (test) {
    var
    res    = this.res,
    appVal = this.appVal;

    test.notEqual(typeof res.app_config, 'undefined');
    test.equal(res.app_config, appVal.app_config);
    test.done();
  }
};
