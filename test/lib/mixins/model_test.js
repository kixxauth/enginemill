'use strict';

// Require enginemill objects
var enginemill = require('../../../');
var objects = enginemill.objects;
var Model = enginemill.mixins.Model;

exports["with defined defaults"] = {
  setUp: function (done) {
    this.createWidget = objects.factory(Model, {
      name: 'Widget',
      idAttribute: '_id',

      defaults: {
        _id    : null,
        width  : 5,
        height : 2
      },

      area: function () {
        return this.width * this.height;
      }
    });

    done();
  },

  "has name": function (test) {
    var widget = this.createWidget();
    test.equal(widget.name, 'Widget');
    test.equal(widget.toString(), 'Widget { _id: null, width: 5, height: 2 }');
    return test.done();
  },

  "does not have an id by default": function (test) {
    var widget = this.createWidget();
    test.equal(widget._id, null);
    test.strictEqual(widget.hasId(), false);
    return test.done();
  },

  "can set id": function (test) {
    var widget = this.createWidget({
      _id: '123'
    });
    test.equal(widget._id, '123');
    test.strictEqual(widget.hasId(), true);
    test.equal();
    return test.done();
  },

  "has default properties": function (test) {
    var widget = this.createWidget();
    test.strictEqual(widget.width, 5);
    test.strictEqual(widget.height, 2);
    return test.done();
  },

  "can define properties on initialization": function (test) {
    var widget = this.createWidget({
      width: 4,
      height: 4,
      depth: 4
    });

    test.equal(widget.width, 4);
    test.equal(widget.height, 4);

    // Undefined properties are ignored
    test.equal(widget.depth, undefined);

    // After setting a new value
    widget = widget.set({height: 8});
    test.equal(widget.width, 4);
    test.equal(widget.height, 8);

    return test.done();
  },

  "is immutable": function (test) {
    var widget1 = this.createWidget();
    test.equal(widget1.width, 5);
    var widget2 = widget1.set({width: 2});
    test.equal(widget1.width, 5);
    test.notStrictEqual(widget1, widget2);
    return test.done();
  },

  "cannot set defined properties by reference": function (test) {
    var widget = this.createWidget();
    try {
      widget.height = 10;
      test.ok(false, 'should throw');
    } catch (err1) {
      test.equal(err1.message, 'Cannot set by reference on an immutable record.');
    }
    return test.done();
  },

  "can set properties with setter": function (test) {
    var widget = this.createWidget();
    test.equal(widget.width, 5);
    test.equal(widget.set({width: 2}).width, 2);
    return test.done();
  },

  "cannot set undefined property keys": function (test) {
    var widget = this.createWidget();
    try {
      widget.set({area: 45});
      test.ok(false, 'should throw');
    } catch (err) {
      test.equal(err.message, 'Cannot set undefined key "area" on Widget');
    }
    return test.done();
  },

  "can get a diff": function (test) {
    var widget1 = this.createWidget();
    var widget2 = widget1.set({height: 10});
    var widget3 = this.createWidget({
      width: 16,
      depth: 2
    });

    test.strictEqual(widget1.diff(widget1), null);
    test.strictEqual(widget1.diff({_id: null, width: 5, height: 2}), null);

    var diff1 = widget1.diff(widget2);
    test.equal(diff1.length, 1);
    test.equal(diff1[0][0], 'height');
    test.equal(diff1[0][1], 2);
    test.equal(diff1[0][2], 10);

    var diff2 = widget1.diff(widget3);
    test.equal(diff2.length, 1);
    test.equal(diff2[0][0], 'width');
    test.equal(diff2[0][1], 5);
    test.equal(diff2[0][2], 16);

    return test.done();
  },

  "has defined methods": function (test) {
    var widget = this.createWidget();
    test.equal(widget.area(), 10);
    widget = widget.set({height: 10});
    test.equal(widget.area(), 50);
    return test.done();
  },

  "can be used as POJO": function (test) {
    var widget = this.createWidget({
      width: 4,
      height: 4,
      depth: 4
    });
    widget = widget.set({height: 6});
    var keys = Object.keys(widget);
    test.strictEqual(widget.width, 4);
    test.strictEqual(widget.height, 6);
    test.strictEqual(widget.depth, undefined);
    test.equal(keys.length, 4);
    test.ok(keys.indexOf('name') >= 0);
    test.ok(keys.indexOf('_id') >= 0);
    test.ok(keys.indexOf('width') >= 0);
    test.ok(keys.indexOf('height') >= 0);
    test.ok(widget.hasOwnProperty('name'));
    test.ok(widget.hasOwnProperty('_id'));
    test.ok(widget.hasOwnProperty('width'));
    test.ok(widget.hasOwnProperty('height'));
    test.equal(JSON.stringify(widget), '{"name":"Widget","_id":null,"width":4,"height":6}');
    return test.done();
  }
};
