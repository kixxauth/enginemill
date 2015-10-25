'use strict';

var
sinon       = require('sinon'),
application = require('../../lib/application');


exports["with defaults"] = {

  setUp: function (done) {
    var app = application.create({
      name: 'foo-app'
    });

    this.stub = sinon.stub(process.stdout, 'write');

    this.logger = app.logger.create({
      sub: 'test-logger'
    });
    done();
  },

  tearDown: function (done) {
    this.stub.restore();
    done();
  },

  "INFO level does not log TRACE": function (test) {
    this.logger.trace('foo message');
    test.equal(this.stub.callCount, 0);
    test.done();
  },

  "INFO level does not log DEBUG": function (test) {
    this.logger.debug('foo message');
    test.equal(this.stub.callCount, 0);
    test.done();
  },

  "INFO level will log INFO": function (test) {
    this.logger.info('foo message');
    var rec = JSON.parse(this.stub.getCall(0).args[0]);
    test.equal(rec.level, 30);
    test.equal(rec.msg, 'foo message');
    test.done();
  },

  "INFO level will log WARN": function (test) {
    this.logger.warn('foo message');
    var rec = JSON.parse(this.stub.getCall(0).args[0]);
    test.equal(rec.level, 40);
    test.equal(rec.msg, 'foo message');
    test.done();
  },

  "INFO level will log ERROR": function (test) {
    this.logger.error('foo message');
    var rec = JSON.parse(this.stub.getCall(0).args[0]);
    test.equal(rec.level, 50);
    test.equal(rec.msg, 'foo message');
    test.done();
  },

  "INFO level will log FATAL": function (test) {
    this.logger.fatal('foo message');
    var rec = JSON.parse(this.stub.getCall(0).args[0]);
    test.equal(rec.level, 60);
    test.equal(rec.msg, 'foo message');
    test.done();
  },

  "has record.name": function (test) {
    this.logger.info('foo message');
    var rec = JSON.parse(this.stub.getCall(0).args[0]);
    test.equal(rec.name, 'foo-app');
    test.done();
  },

  "has record.sub": function (test) {
    this.logger.info('foo message');
    var rec = JSON.parse(this.stub.getCall(0).args[0]);
    test.equal(rec.sub, 'test-logger');
    test.done();
  }
};
