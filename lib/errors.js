'use strict';

var
util = require('util');


function ArgumentError(message) {
  Error.call(this);
  this.message = message;
}
util.inherits(ArgumentError, Error);
exports.ArgumentError = ArgumentError;
