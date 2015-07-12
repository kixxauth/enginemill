"use strict";

var
U,
BRIXX = require('brixx');

module.exports = U = require('lodash');

U.mixin({
  ensure     : BRIXX.ensure,
  deepFreeze : BRIXX.deepFreeze,
  exists     : BRIXX.exists,
  stringify  : BRIXX.stringify
});
