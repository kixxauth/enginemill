"use strict";

var
Objects = require('./objects');

exports.newPlugin = Objects.factory({

  initialize: function (spec) {
    this.initializer = spec.initialize;
  },

  initPlugin: function (API) {
    var
    initializer = this.initializer;
    return function () {
      return initializer.call(null, API);
    };
  }
});
