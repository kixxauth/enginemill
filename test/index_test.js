'use strict';


exports["exported modules"] = {
  setUp: function (done) {
    this.enginemill = require('../');
    done();
  },

  "exports.Promise": function (test) {
    test.equal(typeof this.enginemill.Promise, 'function', 'enginemill.Promise');
    test.done();
  },

  "exports.U": function (test) {
    test.equal(typeof this.enginemill.U, 'function', 'enginemill.U');
    test.equal(typeof this.enginemill.U.VERSION, 'string', 'enginemill.U.VERSION');
    test.done();
  },

  "exports.U.ensure": function (test) {
    var U = this.enginemill.U;
    test.equal(typeof U.ensure, 'function', 'enginemill.U.ensure');
    test.done();
  },

  "exports.U.deepFreeze": function (test) {
    var U = this.enginemill.U;
    test.equal(typeof U.deepFreeze, 'function', 'enginemill.U.deepFreeze');
    test.done();
  },

  "exports.U.exists": function (test) {
    var U = this.enginemill.U;
    test.equal(typeof U.exists, 'function', 'enginemill.U.exists');
    test.done();
  },

  "exports.U.stringify": function (test) {
    var U = this.enginemill.U;
    test.equal(typeof U.stringify, 'function', 'enginemill.U.stringify');
    test.done();
  },

  "exports.U.factory": function (test) {
    var U = this.enginemill.U;
    test.equal(typeof U.factory, 'function', 'enginemill.U.factory');
    test.done();
  },

  "exports.filepath": function (test) {
    test.equal(this.enginemill.filepath, require('filepath'));
    test.done();
  },

  "exports.Errors.OperationalError": function (test) {
    var Errors = this.enginemill.Errors;
    test.equal(typeof Errors.OperationalError, 'function', 'OperationalError');
    test.done();
  },

  "exports.Errors.NotImplementedError": function (test) {
    var Errors = this.enginemill.Errors;
    test.equal(typeof Errors.NotImplementedError, 'function', 'NotImplementedError');
    test.done();
  },

  "exports.Errors.NotFoundError": function (test) {
    var Errors = this.enginemill.Errors;
    test.equal(typeof Errors.NotFoundError, 'function', 'NotFoundError');
    test.done();
  },

  "exports.Errors.JSONParseError": function (test) {
    var Errors = this.enginemill.Errors;
    test.equal(typeof Errors.JSONParseError, 'function', 'JSONParseError');
    test.done();
  },

  "exports.oddcast": function (test) {
    test.equal(this.enginemill.oddcast, require('oddcast'));
    test.done();
  },

  "exports.moment": function (test) {
    test.equal(this.enginemill.moment, require('moment'));
    test.done();
  },

  "exports.numeral": function (test) {
    test.equal(this.enginemill.numeral, require('numeral'));
    test.done();
  },

  "exports.Mixins.EventEmitter": function (test) {
    var Mixins = this.enginemill.Mixins;
    test.equal(typeof Mixins.EventEmitter, 'object', 'Mixins.EventEmitter');
    test.done();
  },

  "exports.Request": function (test) {
    test.equal(typeof this.enginemill.Request, 'object', 'enginemill.Request');
    test.done();
  }
};
