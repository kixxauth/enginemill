var LIB = require('../library/')

function Application(spec) {
  spec = spec || {};

  Object.defineProperties(this, {
    name: {
      enumerable: true
    , value: spec.settings.application.name
    },
    root: {
      enumerable: true
    , value: spec.root
    },
    settings: {
      enumerable: true
    , value: spec.settings
    }
  });
}

LIB.extend(Application.prototype, {

  define: function (key, val) {
    Object.defineProperty(this, key, {
      enumerable: true
    , value: val
    });
  }
});

Application.create = function (values) {
  if (!(values instanceof LIB.Crystal)) {
    if (values && typeof values === 'object') {
      values = LIB.Crystal.create(values);
    } else {
      values = LIB.Crystal.create();
    }
  }

  var spec = {
    root: values.root
  , settings: values.settings
  }

  return LIB.Promise.cast(new Application(spec));
};


exports.Application = Application;
