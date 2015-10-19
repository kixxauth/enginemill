'use strict';


exports.initialize = function (spec) {
  this.engine = spec.engine;
};

exports.get = function (id, options) {
  options = options || Object.create(null);
  var self = this;
  return this.engine.get(id, options).then(function (data) {
    return self.factory(data);
  });
};

exports.post = function (entity, options) {
  options = options || Object.create(null);
  var
  self   = this,
  record = this.serialize(entity);
  return this.engine.post(record, options).then(function (data) {
    return self.factory(data);
  });
};

exports.put = function (entity, options) {
  options = options || Object.create(null);
  var
  self   = this,
  record = this.serialize(entity);
  return this.engine.put(record, options).then(function (data) {
    return self.factory(data);
  });
};

exports.remove = function (id, options) {
  options = options || Object.create(null);
  return this.engine.remove(id, options);
};

exports.factory = function (data) {
  return data;
};

exports.serialize = function (entity) {
  var record  = Object.create(null);
  record.id   = entity.id;
  record.data = entity;

  if (typeof entity.toJSON === 'function') {
    record.data = entity.toJSON();
  } else if (typeof entity.valueOf === 'function') {
    record.data = entity.valueOf();
  }

  if (entity.idAttribute) {
    record.id = entity[entity.idAttribute];
  }

  return record;
};

