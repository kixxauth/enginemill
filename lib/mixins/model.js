'use strict';

var
immutable = require('immutable');

module.exports = {
  idAttribute: 'id',

  initialize: function (spec) {
    var map,
    self     = this,
    defaults = this.defaults,
    name     = this.name || defaults.name,
    keys     = Object.keys(defaults);

    if (keys.indexOf(this.idAttribute) < 0) {
      throw new Error(name + ' defaults must contain idAttribute "' + this.idAttribute + '"');
    }

    if (spec instanceof immutable.Map) {
      map = spec;
    } else {
      map = immutable.Map(keys.reduce(function (values, k) {
        values[k] = Object.prototype.hasOwnProperty.call(spec, k) ?
                    spec[k] : defaults[k];
        return values;
      }, Object.create(null)));
    }


    Object.defineProperties(this, {
      name: {
        enumerable: true,
        value: this.name || defaults.name
      },
      keys: {
        value: keys
      },
      size: {
        value: keys.length
      },
      map: {
        value: map
      }
    });

    keys.forEach(function (key) {
      Object.defineProperty(self, key, {
        enumerable: true,
        get: function () {
          return this.map.get(key);
        },
        set: function () {
          throw new Error('Cannot set by reference on an immutable record.');
        }
      });
    });
  },

  toString: function () {
    var
    self = this,
    keyString = this.keys.map(function (k) {
      var val = self[k];
      return k + ': ' + (typeof val === 'string' ? ('"' + val + '"') : val);
    }).join(', ');
    return this.name + ' { ' + keyString + ' }';
  },

  has: function (key) {
    return this.keys.indexOf(key) >= 0;
  },

  hasId: function () {
    var id = this.map.get(this.idAttribute);
    return !!(id || typeof id === 'number');
  },

  set: function (values) {
    var i, keys, newModel;
    if (!values || typeof values !== 'object') {
      throw new Error('Model.set() must be called with an Object');
    }
    keys = Object.keys(values);
    for (i = 0; i < keys.length; i += 1) {
      if (!this.has(keys[i])) {
        throw new Error('Cannot set undefined key "' + keys[i] + '" on ' + this.name);
      }
    }
    newModel = Object.create(this);
    newModel.initialize(this.map.merge(values));
    return newModel;
  },

  diff: function (other) {
    if (this === other) {
      return null;
    }

    var
    self = this,
    diff = [];

    this.keys.forEach(function (k) {
      if (self[k] !== other[k]) {
        diff.push([k, self[k], other[k]]);
      }
    });

    if (!diff.length) {
      return null;
    }
    return diff;
  }
};
