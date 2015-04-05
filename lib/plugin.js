var
Objects = require('./objects');

exports.newPlugin = Objects.factory({

  initialize: function (spec) {
    this.initializer = spec.initialize;
  },

  initPlugin: function (API, configs) {
    return this.initializer.call(null, API, configs);
  }
});
