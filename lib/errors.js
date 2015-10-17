'use strict';

var
util = require('util');


function NotImplementedError(message) {
  Error.call(this);
  Error.captureStackTrace(this, this.constructor);
  this.name = this.constructor.name;
  this.message = message;
}
util.inherits(NotImplementedError, Error);
exports.NotImplementedError = NotImplementedError;


function ArgumentError(message) {
  Error.call(this);
  Error.captureStackTrace(this, this.constructor);
  this.name = this.constructor.name;
  this.message = message;
}
util.inherits(ArgumentError, Error);
exports.ArgumentError = ArgumentError;


function NotFoundError(message) {
  Error.call(this);
  Error.captureStackTrace(this, this.constructor);
  this.name = this.constructor.name;
  this.message = message;
}
util.inherits(NotFoundError, Error);
exports.NotFoundError = NotFoundError;


function JSONReadError(message) {
  Error.call(this);
  Error.captureStackTrace(this, this.constructor);
  this.name = this.constructor.name;
  this.message = message;
}
util.inherits(JSONReadError, Error);
exports.JSONReadError = JSONReadError;
