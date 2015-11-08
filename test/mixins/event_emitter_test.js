'use strict';

var
sinon = require('sinon'),

enginemill = require('../../'),
U          = enginemill.U,
Mixins     = enginemill.Mixins;

exports["with EventEmitter.init"] = {
  setUp: function (done) {
    this.listener = function () {};
    this.emitter = U.factory(Mixins.EventEmitter)();
    this.emitter.on('data', this.listener);
    done();
  },

  "has correct properties": function (test) {
    test.ok(this.emitter.hasOwnProperty('domain'));
    test.ok(this.emitter.hasOwnProperty('_maxListeners'));
    test.equal(typeof this.emitter._maxListeners, 'undefined');
    test.ok(this.emitter.hasOwnProperty('_events'));
    test.equal(this.emitter._events.data, this.listener);
    test.done();
  }
};

exports["with added listener"] = {
  setUp: function (done) {
    this.listener = sinon.spy();
    this.emitter = U.factory(Mixins.EventEmitter)();
    this.emitter.on('data', this.listener);
    this.payload = {};
    this.emitter.emit('data', this.payload);
    done();
  },

  "calls the listener": function (test) {
    test.equal(this.listener.callCount, 1);
    test.ok(this.listener.calledWithExactly(this.payload));
    test.done();
  }
};

exports["with removed listener"] = {
  setUp: function (done) {
    this.listener = sinon.spy();
    this.emitter = U.factory(Mixins.EventEmitter)();
    this.emitter.on('data', this.listener);
    this.payload = {};
    this.emitter.emit('data', this.payload);
    this.emitter.removeListener('data', this.listener);
    this.emitter.emit('data', this.payload);
    done();
  },

  "calls the listener once": function (test) {
    test.equal(this.listener.callCount, 1);
    test.ok(this.listener.calledWithExactly(this.payload));
    test.done();
  }
};

exports["with destroyed listener"] = {
  setUp: function (done) {
    this.listener = sinon.spy();
    this.emitter = U.factory(Mixins.EventEmitter)();
    this.emitter.on('data', this.listener);
    this.payload = {};
    this.emitter.emit('data', this.payload);
    this.emitter.destroy();
    this.emitter.emit('data', this.payload);
    done();
  },

  "calls the listener once": function (test) {
    test.equal(this.listener.callCount, 1);
    test.ok(this.listener.calledWithExactly(this.payload));
    test.done();
  }
};
