"use strict";

var
U,
BRIXX = require('brixx');

module.exports = U = require('lodash');

U.mixin({
  deepFreeze: BRIXX.deepFreeze
});
