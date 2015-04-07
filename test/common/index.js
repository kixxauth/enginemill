var
FilePath = require('filepath').FilePath;


exports.fixtures = function () {
  var
  path = FilePath.create(__dirname).dirname().append('fixtures');
  if (arguments.length) {
    return path.append.apply(path, arguments);
  }
  return path;
};