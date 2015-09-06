'use strict';

var
util = require('util');


function ArgumentError(message) {
  Error.call(this);
  Error.captureStackTrace(this, this.constructor);
  this.name = this.constructor.name;
  this.message = message;
}
util.inherits(ArgumentError, Error);
exports.ArgumentError = ArgumentError;


function JSONReadError(message) {
  Error.call(this);
  Error.captureStackTrace(this, this.constructor);
  this.name = this.constructor.name;
  this.message = message;
}
util.inherits(JSONReadError, Error);
exports.JSONReadError = JSONReadError;
