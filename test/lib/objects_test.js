var

Objects = require('../../lib/objects'),
U       = require('../../lib/u');


exports["Objects.factory()"] = {

  "with no arguments": {

    setUp: function (done) {
      var
      res = factoryWithNoArguments();
      this.returns = res.returns;
      return done();
    },

    "it returns a function that returns a blank Object": function (test) {
      var
      keys,
      res = this.returns();

      test.ok(res);
      test.equal(typeof res, 'object');
      keys = Object.keys(res);
      test.equal(keys.length, 0);

      return test.done();
    }
  },

  "with no dependencies": {

    setUp: function (done) {
      var
      res = factoryWithNoDependencies();
      this.updates = res.updates;
      this.extension = res.extension;
      this.instancePropNames = res.instancePropNames;
      this.returns = res.returns;
      return done();
    },

    "it has all properties of the extension": function (test) {
      test.expect(6);
      var
      n,
      extension = this.extension,
      instance = this.returns();

      for (n in extension) {
        if (n === 'initialize') {
          test.equal(typeof instance.initialize, 'function');
          test.notEqual(instance.initialize, extension.initialize);
        } else {
          test.ok(instance[n]);
          test.strictEqual(instance[n], extension[n]);
        }
      }
      return test.done();
    },

    "it calls initialize() with a valid Object": function (test) {
      var
      instance = this.returns(),
      updates = this.updates;

      test.ok(updates.spec);
      test.equal(typeof updates.spec, 'object');

      return test.done();
    },

    "it calls initialize() with value passed into factory": function (test) {
      var
      specVal = {},
      updates = this.updates;

      this.returns(specVal);

      test.equal(updates.spec, specVal);

      return test.done();
    },

    "`this` value in initialize() is the instance itself": function (test) {
      var
      instance = this.returns(),
      updates = this.updates;

      test.equal(updates.initializeContext, instance);

      return test.done();
    },

    "instance properties are present, but are not assigned to prototype": function (test) {
      test.expect(4);

      var
      extension = this.extension,
      setVal = {},
      instance = this.returns();

      instance.protoMethod(setVal);
      updates = this.updates;

      test.equal(instance.instanceProp, updates.instanceProp);
      test.equal(instance.userDefinedProp, setVal);

      this.instancePropNames.forEach(function (name) {
        test.ok(!(name in extension), name);
      });

      return test.done();
    },

    "changes on the prototype have no effect on future instances": function (test) {
      var
      instance1, instance2,
      extension = this.extension,
      originalMethod = extension.protoMethod;

      instance1 = this.returns();
      extension.protoMethod = function () {};
      instance2 = this.returns();

      test.equal(instance1.protoMethod, originalMethod);
      test.equal(instance2.protoMethod, originalMethod);
      test.notEqual(extension.protoMethod, originalMethod);

      return test.done();
    }
  },

  "with dependency chain": {

    setUp: function (done) {
      var
      res = factoryWithDependencies();
      this.updates = res.updates;
      this.initSequence = res.initSequence;
      this.extension = res.extension;
      this.parent1 = res.parent1;
      this.parent2 = res.parent2;
      this.returns = res.returns;
      return done();
    },

    "it has all properties of all parents": function (test) {
      test.expect(15);
      var
      n,
      chain = U.extend(Object.create(null), this.parent1, this.parent2, this.extension),
      instance = this.returns();

      for (n in chain) {
        if (n === 'initialize') {
          test.equal(typeof instance.initialize, 'function');
        } else {
          test.ok(instance[n], n);
          test.strictEqual(instance[n], chain[n], n);
        }
      }

      return test.done();
    },

    "it calls all initialize()rs with a valid Object": function (test) {
      var
      instance = this.returns(),
      updates = this.updates;

      test.ok(updates.spec1);
      test.equal(typeof updates.spec1, 'object');
      test.ok(updates.spec2);
      test.equal(typeof updates.spec2, 'object');
      test.ok(updates.spec3);
      test.equal(typeof updates.spec3, 'object');

      return test.done();
    },

    "it calls all initialize()rs with value passed into factory": function (test) {
      var
      specVal = {},
      updates = this.updates;

      this.returns(specVal);

      test.equal(updates.spec1, specVal);
      test.equal(updates.spec2, specVal);
      test.equal(updates.spec3, specVal);

      return test.done();
    },

    "`this` value in all initialize()rs is the instance itself": function (test) {
      var
      instance = this.returns(),
      updates = this.updates;

      test.equal(updates.initializeContext1, instance);
      test.equal(updates.initializeContext2, instance);
      test.equal(updates.initializeContext3, instance);

      return test.done();
    },

    "all initialize()rs are called in inheritance sequence": function (test) {
      var
      initSequence = this.initSequence;

      this.returns();

      test.equal(initSequence[0], this.parent1);
      test.equal(initSequence[1], this.parent2);
      test.equal(initSequence[2], this.extension);

      return test.done();
    }
  }
};


var factoryWithNoArguments = function () {
  var
  res = Object.create(null);

  res.returns = Objects.factory();
  return res;
};

var factoryWithNoDependencies = function () {
  var
  res = Object.create(null);
  res.updates = Object.create(null);
  res.extension = {
    initialize: function (spec) {
      res.updates.spec = spec;
      res.updates.initializeContext = this;
      res.updates.instanceProp = {};
      this.instanceProp = res.updates.instanceProp;
    },
    protoProp: 1,
    protoMethod: function (val) {
      this.userDefinedProp = val;
    }
  };

  res.instancePropNames = ['instanceProp', 'userDefinedProp']
  res.returns = Objects.factory(res.extension);
  return res;
};

var factoryWithDependencies = function () {
  var
  res = Object.create(null);
  res.updates = Object.create(null);
  res.initSequence = [];

  res.parent1 = {
    initialize: function (spec) {
      res.updates.spec1 = spec;
      res.updates.initializeContext1 = this;
      res.initSequence.push(res.parent1);
    },
    protoMethod1: function () {},
    override1and2: function () {},
    override1: function () {},
    override2_1: function () {}
  };

  res.parent2 = {
    initialize: function (spec) {
      res.updates.spec2 = spec;
      res.updates.initializeContext2 = this;
      res.initSequence.push(res.parent2);
    },
    protoMethod2: function () {},
    override1and2: function () {},
    override2: function () {},
    override2_1: function () {}
  };

  res.extension = {
    initialize: function (spec) {
      res.updates.spec3 = spec;
      res.updates.initializeContext3 = this;
      res.initSequence.push(res.extension);
    },
    protoMethod3: function () {},
    override1and2: function () {},
    override1: function () {},
    override2: function () {}
  };

  res.returns = Objects.factory([res.parent1, res.parent2], res.extension);
  return res;
};
