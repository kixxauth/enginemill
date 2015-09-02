// Params:
// args.appdir - FilePath representing the base app directory.
//
// Returns a Promise for parsed package.json.
exports.readPackageJSON = function (args) {
  var jsonPath = args.appdir.append('package.json');

  function parseJSON(text) {
    var err, data;
    try {
      data = JSON.parse(text +'');
    } catch (e) {
      err = new Error('JSON SyntaxError: '+ e.message +' in '+ jsonPath);
      return Promise.reject(err);
    }
    return data;
  }

  function setValues(data) {
    return U.extend(Object.create(null) , data || Object.create(null));
  }

  if (jsonPath.exists()) {
    return jsonPath.read()
      .then(parseJSON)
      .then(setValues);
  }

  return Promise.resolve(Object.create(null)).then(setValues);
}
