'use strict';

var
sinon   = require('sinon'),
FP      = require('filepath'),
Promise = require('../lib/promise'),
U       = require('../lib/u'),
objects = require('../lib/objects'),
errors  = require('../lib/errors'),
REQ     = require('../lib/http'),

applicationLoader = require('../lib/application_loader');


exports["exported modules"] = {
  setUp: function (done) {
    this.enginemill = require('../');
    done();
  },

  "exports.Promise": function (test) {
    test.equal(this.enginemill.Promise, Promise);
    test.done();
  },

  "exports.U": function (test) {
    test.equal(this.enginemill.U, U);
    test.done();
  },

  "exports.objects": function (test) {
    test.equal(this.enginemill.objects, objects);
    test.done();
  },

  "exports.FP": function (test) {
    test.equal(this.enginemill.FP, FP);
    test.done();
  },

  "exports.errors": function (test) {
    test.equal(this.enginemill.errors, errors);
    test.done();
  },

  "exports.REQ": function (test) {
    test.equal(this.enginemill.REQ, REQ);
    test.done();
  }
};

exports[".load() with defaults"] = {
  setUp: function (done) {
    this.enginemill = require('../');
    this.applicationLoader = sinon.stub(applicationLoader, 'load');
    this.enginemill.load();
    done();
  },

  tearDown: function (done) {
    this.applicationLoader.restore();
    done();
  },

  "called once": function (test) {
    test.equal(this.applicationLoader.callCount, 1);
    test.done();
  },

  "called with a single argument object": function (test) {
    var
    args = this.applicationLoader.args[0];
    test.equal(args.length, 1);
    test.done();
  },

  "called with default": function (test) {
    var
    args = this.applicationLoader.args[0][0],
    expectedAppdir = FP.create().append('management');

    test.equal(args.appdir.toString(), expectedAppdir.toString());
    test.equal(typeof args.name, 'undefined');
    test.equal(typeof args.version, 'undefined');
    test.equal(typeof args.usageString, 'undefined');
    test.equal(typeof args.helpString, 'undefined');
    test.equal(typeof args.options, 'undefined');
    test.equal(typeof args.environment, 'undefined');
    test.equal(typeof args.initializers, 'undefined');
    test.done();
  }
};
