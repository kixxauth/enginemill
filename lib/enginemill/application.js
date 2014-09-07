
function Application(spec) {
  spec = spec || {};

  Object.defineProperties(this, {
    root: {
      enumerable: true,
      value: spec.root
    },
    settings: {
      enumerable: true,
      value: spec.settings
    }
  });
}

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

  return Promise.cast(new Application(spec));
};


exports.Application = Application;
