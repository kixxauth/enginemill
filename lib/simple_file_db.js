'use strict';

var
filepath = require('filepath'),
nodeUUID = require('node-uuid'),
Promise  = require('./promise'),
errors   = require('./errors');

exports.createEngine = function (args) {
  args = args || Object.create(null);
  if (!args.dir) {
    throw new Error('args.dir is required for SimpleFileDB');
  }

  var
  self   = Object.create(null),
  nodeId = args.nodeId;

  self.dir = filepath.create(args.dir);

  self.get = function (id) {
    if (!id) {
      throw new Error('SimpleFileDB#get() requires an ID argument');
    }
    var file = self.dir.append(id + '.json');
    return Promise.resolve(file.read().then(function (text) {
      var err;
      if (text) {
        return JSON.parse(text);
      }
      err = new errors.NotFoundError('Could not find record with id "' + id + '"');
      return Promise.reject(err);
    }));
  };

  self.post = function (record) {
    if (record.id) {
      throw new Error('SimpleFileDB#post() does not accept a record ID');
    }
    var id = self.uuid();
    record.data.id = id;
    var file = self.dir.append(id + '.json');
    return Promise.resolve(file.write(JSON.stringify(record.data)).then(function () {
      return JSON.parse(JSON.stringify(record.data));
    }));
  };

  self.put = function (record) {
    if (!record.id) {
      throw new Error('SimpleFileDB#put() requires a record with an ID');
    }
    var
    err,
    file = self.dir.append(record.id + '.json'),
    text = JSON.stringify(record.data);

    if (file.isFile()) {
      return Promise.resolve(file.write(text).then(function () {
        return JSON.parse(text);
      }));
    }
    err = new errors.NotFoundError('Could not find record with id "' + record.id + '"');
    return Promise.reject(err);
  };

  self.remove = function (id) {
    if (!id) {
      throw new Error('SimpleFileDB#remove() requires an ID argument');
    }

    var
    err,
    file = self.dir.append(id + '.json');

    if (file.isFile()) {
      file.remove();
      return Promise.resolve(id);
    }

    err = new errors.NotFoundError('Could not find record with id "' + id + '"');
    return Promise.reject(err);
  };

  self.uuid = function () {
    if (nodeId) {
      return nodeUUID.v1({node: nodeId});
    }
    return nodeUUID.v1();
  };

  return self;
};
