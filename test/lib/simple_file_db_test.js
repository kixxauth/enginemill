'use strict';

var
TOOLS      = require('../tools/'),
enginemill = require('../../'),

objects      = enginemill.objects,
mixins       = enginemill.mixins,
errors       = enginemill.errors,
path         = enginemill.path,
simpleFileDb = enginemill.engines.simpleFileDb,

factories = Object.create(null);

factories.createCar = objects.factory(mixins.Model, {
  name: 'Car',
  defaults: {
    id    : null,
    make  : null,
    model : null,
    year  : null,
    color : null
  },

  stringName: function () {
    return this.year + ' ' + this.make + ' model ' + this.model;
  }
});

exports["DBConnector#post()"] = {
  setUp: function (done) {
    var
    self = this;

    this.car = factories.createCar({
      make  : 'Ford',
      model : 'T',
      year  : 1925
    });

    this.dir = path.create('/tmp');
    this.engine = simpleFileDb.createEngine({
      dir: this.dir
    });

    this.factories = {
      Car: factories.createCar
    };

    this.db = enginemill.db({
      engine    : this.engine,
      factories : this.factories
    });

    return self.db.post(self.car).then(function (res) {
      self.res = res;
    })
    .then(done)
    .catch(done);
  },

  "it creates a new record with UUID": function (test) {
    test.equal(typeof this.res.id, 'string');
    test.equal(this.res.id.length, 36);
    test.done();
  },

  "it returns a model instance": function (test) {
    test.equal(this.res.make, 'Ford');
    test.equal(this.res.model, 'T');
    test.equal(this.res.year, 1925);
    test.strictEqual(this.res.color, null);
    test.equal(this.res.stringName(), '1925 Ford model T');
    test.done();
  },

  "it persists the record to disk": function (test) {
    test.expect(4);

    var file = this.dir.append(this.res.id + '.json');
    file.read()
      .then(function (text) {
        var data = JSON.parse(text);
        test.equal(data.make, 'Ford');
        test.equal(data.model, 'T');
        test.equal(data.year, 1925);
        test.strictEqual(data.color, null);
      })
      .then(test.done)
      .catch(test.done);
  }
};

exports["DBConnector#post() with a record id"] = {
  setUp: function (done) {
    this.dir = path.create('/tmp');

    this.engine = simpleFileDb.createEngine({
      dir: this.dir
    });
    this.factories = [factories.createCar];

    this.db = enginemill.db({
      engine    : this.engine,
      factories : this.factories
    });

    done();
  },

  "it throws": function (test) {
    test.expect(1);

    var car = factories.createCar({
      id: TOOLS.uuid()
    });

    try {
      this.db.post(car);
    } catch (err) {
      test.equal(err.message, 'SimpleFileDB#post() does not accept a record ID');
    }

    test.done();
  }
};

exports["DBConnector#get() file does not exist"] = {
  setUp: function (done) {
    this.key = TOOLS.uuid();
    this.filename = this.key + '.json';
    this.dir = path.create('/tmp');
    this.filepath = this.dir.append(this.filename);
    this.filepath.remove();

    this.engine = simpleFileDb.createEngine({
      dir: this.dir
    });

    this.factories = {
      Car: factories.createCar
    };

    this.db = enginemill.db({
      engine    : this.engine,
      factories : this.factories
    });

    done();
  },

  "it rejects with a NotFoundError": function (test) {
    test.expect(1);
    var id = this.key;

    this.db.get(this.key).then(function () {
      test.ok(false, 'should not be called');
    })
    .catch(errors.NotFoundError, function (err) {
      test.ok(err.message.indexOf(id) >= 0);
      test.done();
    })
    .catch(test.done);
  }
};

exports["DBConnector#get()"] = {
  setUp: function (done) {
    var self = this;

    this.key = TOOLS.uuid();
    this.filename = this.key + '.json';
    this.dir = path.create('/tmp');
    this.filepath = this.dir.append(this.filename);

    this.data = {
      name  : 'Car',
      id    : this.key,
      make  : 'Tesla',
      model : 'S',
      year  : 2015
    };

    this.engine = simpleFileDb.createEngine({
      dir: this.dir
    });

    this.factories = {
      Car: factories.createCar
    };

    this.db = enginemill.db({
      engine    : this.engine,
      factories : this.factories
    });

    this.filepath.write(JSON.stringify(this.data))
      .then(function () {
        return self.db.get(self.key);
      })
      .then(function (res) {
        self.res = res;
        done();
      })
      .catch(done);
  },

  "it has the expected UUID": function (test) {
    test.equal(typeof this.res.id, 'string');
    test.equal(this.res.id.length, 36);
    test.done();
  },

  "it returns a model instance": function (test) {
    test.equal(this.res.make, 'Tesla');
    test.equal(this.res.model, 'S');
    test.equal(this.res.year, 2015);
    test.strictEqual(this.res.color, null);
    test.equal(this.res.stringName(), '2015 Tesla model S');
    test.done();
  }
};

exports["DBConnector#put() without a record id"] = {
  setUp: function (done) {
    this.dir = path.create('/tmp');

    this.engine = simpleFileDb.createEngine({
      dir: this.dir
    });
    this.factories = [factories.createCar];

    this.db = enginemill.db({
      engine    : this.engine,
      factories : this.factories
    });

    done();
  },

  "it throws": function (test) {
    test.expect(1);

    var car = factories.createCar({});

    try {
      this.db.put(car);
    } catch (err) {
      test.equal(err.message, 'SimpleFileDB#put() requires a record with an ID');
    }

    test.done();
  }
};

exports["DBConnector#put() when record does not exist"] = {
  setUp: function (done) {
    this.key = TOOLS.uuid();
    this.filename = this.key + '.json';
    this.dir = path.create('/tmp');
    this.filepath = this.dir.append(this.filename);
    this.filepath.remove();

    this.car = factories.createCar({
      id    : this.key,
      make  : 'Ford',
      model : 'T',
      year  : 1925,
      color : 'black'
    });

    this.engine = simpleFileDb.createEngine({
      dir: this.dir
    });

    this.factories = {
      Car: factories.createCar
    };

    this.db = enginemill.db({
      engine    : this.engine,
      factories : this.factories
    });

    done();
  },

  "it rejects with a NotFoundError": function (test) {
    var
    self = this;

    test.expect(1);

    this.db.put(this.car).then(function () {
      test.ok(false, 'should not be called');
    })
    .catch(errors.NotFoundError, function (err) {
      test.ok(err.message.indexOf(self.key) >= 0);
      test.done();
    })
    .catch(test.done);
  }
};

exports["DBConnector#put()"] = {
  setUp: function (done) {
    var
    self = this;

    this.key = TOOLS.uuid();
    this.filename = this.key + '.json';
    this.dir = path.create('/tmp');
    this.filepath = this.dir.append(this.filename);

    this.car = factories.createCar({
      id    : this.key,
      make  : 'Ford',
      model : 'T',
      year  : 1925,
      color : 'black'
    });

    this.engine = simpleFileDb.createEngine({
      dir: this.dir
    });

    this.factories = {
      Car: factories.createCar
    };

    this.db = enginemill.db({
      engine    : this.engine,
      factories : this.factories
    });

    // Write the fixture as plain JSON data.
    this.filepath.write(JSON.stringify({
      id    : this.key,
      make  : 'Ford',
      model : 'T',
      year  : 1925,
      color : null
    }))
    .then(function () {
      // PUT the update
      return self.db.put(self.car);
    })
    .then(function (res) {
      self.res = res;
    })
    .then(done)
    .catch(done);
  },

  "it returns a model instance": function (test) {
    test.equal(this.res.make, 'Ford');
    test.equal(this.res.model, 'T');
    test.equal(this.res.year, 1925);
    test.strictEqual(this.res.color, 'black');
    test.equal(this.res.stringName(), '1925 Ford model T');
    test.done();
  },

  "it persists the record to disk": function (test) {
    test.expect(4);

    this.filepath.read()
      .then(function (text) {
        var data = JSON.parse(text);
        test.equal(data.make, 'Ford');
        test.equal(data.model, 'T');
        test.equal(data.year, 1925);
        test.strictEqual(data.color, 'black');
      })
      .then(test.done)
      .catch(test.done);
  }
};

exports["DBConnector#remove()"] = {
  setUp: function (done) {
    var
    self = this;

    this.key = TOOLS.uuid();
    this.filename = this.key + '.json';
    this.dir = path.create('/tmp');
    this.filepath = this.dir.append(this.filename);

    this.engine = simpleFileDb.createEngine({
      dir: this.dir
    });

    this.factories = {
      Car: factories.createCar
    };

    this.db = enginemill.db({
      engine    : this.engine,
      factories : this.factories
    });

    // Write the fixture as plain JSON data.
    this.filepath.write(JSON.stringify({
      id: this.key
    }))
    .then(function () {
      return self.db.remove(self.key);
    })
    .then(function (res) {
      self.res = res;
    })
    .then(done)
    .catch(done);
  },

  "it removes the record record from disk": function (test) {
    test.strictEqual(this.filepath.exists(), false, 'file exists');
    test.done();
  }
};

exports["DBConnector#remove()"] = {
  setUp: function (done) {
    this.key = TOOLS.uuid();
    this.filename = this.key + '.json';
    this.dir = path.create('/tmp');
    this.filepath = this.dir.append(this.filename);
    this.filepath.remove();

    this.engine = simpleFileDb.createEngine({
      dir: this.dir
    });

    this.factories = {
      Car: factories.createCar
    };

    this.db = enginemill.db({
      engine    : this.engine,
      factories : this.factories
    });

    done();
  },

  "it rejects with a NotFoundError": function (test) {
    var
    self = this;

    test.expect(1);

    this.db.remove(this.key).then(function () {
      test.ok(false, 'should not be called');
    })
    .catch(errors.NotFoundError, function (err) {
      test.ok(err.message.indexOf(self.key) >= 0);
      test.done();
    })
    .catch(test.done);
  }
};
