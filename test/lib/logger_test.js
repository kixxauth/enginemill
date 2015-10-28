'use strict';

var
Promise     = require('../../lib/promise'),
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
    var self = this;
    this.logger.trace('foo message');

    // Need a time out, since logging events are asynchronous
    Promise.delay(10).then(function () {
      test.equal(self.stub.callCount, 0);
    })
    .then(test.done)
    .catch(test.done);
  },

  "INFO level does not log DEBUG": function (test) {
    var self = this;
    this.logger.debug('foo message');

    // Need a time out, since logging events are asynchronous
    Promise.delay(10).then(function () {
      test.equal(self.stub.callCount, 0);
    })
    .then(test.done)
    .catch(test.done);
  },

  "INFO level will log INFO": function (test) {
    var self = this;
    this.logger.info('foo message');

    // Need a time out, since logging events are asynchronous
    Promise.delay(10).then(function () {
      var rec = JSON.parse(self.stub.getCall(0).args[0]);
      test.equal(rec.level, 30);
      test.equal(rec.msg, 'foo message');
    })
    .then(test.done)
    .catch(test.done);
  },

  "INFO level will log WARN": function (test) {
    var self = this;
    this.logger.warn('foo message');

    // Need a time out, since logging events are asynchronous
    Promise.delay(10).then(function () {
      var rec = JSON.parse(self.stub.getCall(0).args[0]);
      test.equal(rec.level, 40);
      test.equal(rec.msg, 'foo message');
    })
    .then(test.done)
    .catch(test.done);
  },

  "INFO level will log ERROR": function (test) {
    var self = this;
    this.logger.error('foo message');

    // Need a time out, since logging events are asynchronous
    Promise.delay(10).then(function () {
    var rec = JSON.parse(self.stub.getCall(0).args[0]);
      test.equal(rec.level, 50);
      test.equal(rec.msg, 'foo message');
    })
    .then(test.done)
    .catch(test.done);
  },

  "INFO level will log FATAL": function (test) {
    var self = this;
    this.logger.fatal('foo message');

    // Need a time out, since logging events are asynchronous
    Promise.delay(10).then(function () {
      var rec = JSON.parse(self.stub.getCall(0).args[0]);
      test.equal(rec.level, 60);
      test.equal(rec.msg, 'foo message');
    })
    .then(test.done)
    .catch(test.done);
  },

  "has record.name": function (test) {
    var self = this;
    this.logger.info('foo message');

    // Need a time out, since logging events are asynchronous
    Promise.delay(10).then(function () {
      var rec = JSON.parse(self.stub.getCall(0).args[0]);
      test.equal(rec.name, 'foo-app');
    })
    .then(test.done)
    .catch(test.done);
  },

  "has record.sub": function (test) {
    var self = this;
    this.logger.info('foo message');

    // Need a time out, since logging events are asynchronous
    Promise.delay(10).then(function () {
      var rec = JSON.parse(self.stub.getCall(0).args[0]);
      test.equal(rec.sub, 'test-logger');
    })
    .then(test.done)
    .catch(test.done);
  }
};


exports["with user defined stream at WARN level"] = {

  setUp: function (done) {
    var app = application.create({
      name: 'foo-app'
    });

    this.stdoutHandler = sinon.stub(process.stdout, 'write');
    this.handleAll = sinon.spy();
    this.handleError = sinon.spy();

    app.logger.configure({
      level: 'WARN',
      useDefaultStream: false
    });
    app.logger.channel.observe({role: 'logging'}, this.handleAll);
    app.logger.channel.observe({role: 'logging', level: 'ERROR'}, this.handleError);

    this.logger = app.logger.create({
      sub: 'test-logger'
    });

    done();
  },

  tearDown: function (done) {
    this.stdoutHandler.restore();
    done();
  },

  "WARN level does not log TRACE": function (test) {
    var self = this;
    this.logger.trace('foo message');

    // Need a time out, since logging events are asynchronous
    Promise.delay(10).then(function () {
      test.equal(self.stdoutHandler.callCount, 0);
      test.equal(self.handleAll.callCount, 0);
      test.equal(self.handleError.callCount, 0);
    })
    .then(test.done)
    .catch(test.done);
  },

  "WARN level does not log DEBUG": function (test) {
    var self = this;
    this.logger.debug('foo message');

    // Need a time out, since logging events are asynchronous
    Promise.delay(10).then(function () {
      test.equal(self.stdoutHandler.callCount, 0);
      test.equal(self.handleAll.callCount, 0);
      test.equal(self.handleError.callCount, 0);
    })
    .then(test.done)
    .catch(test.done);
  },

  "WARN level does not log INFO": function (test) {
    var self = this;
    this.logger.info('foo message');

    // Need a time out, since logging events are asynchronous
    Promise.delay(10).then(function () {
      test.equal(self.stdoutHandler.callCount, 0);
      test.equal(self.handleAll.callCount, 0);
      test.equal(self.handleError.callCount, 0);
    })
    .then(test.done)
    .catch(test.done);
  },

  // TODO: Need to fix Oddcast and pattern matching before this
  //       test will pass.
  //
  // "WARN level will log WARN": function (test) {
  //   var self = this;
  //   this.logger.warn('foo message');
  //
  //   // Need a time out, since logging events are asynchronous
  //   Promise.delay(10).then(function () {
  //     test.equal(self.stdoutHandler.callCount, 0);
  //     test.equal(self.handleError.callCount, 0);
  //     test.equal(self.handleAll.callCount, 1);
  //     var rec = self.handleAll.getCall(0).args[0];
  //     test.equal(rec.level, 40);
  //     test.equal(rec.msg, 'foo message');
  //   })
  //   .then(test.done)
  //   .catch(test.done);
  // }
};
