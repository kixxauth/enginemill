var NPATH = require('path')
  , NODEUNIT = require('nodeunit')
  , testPath = NPATH.relative(process.cwd(), process.argv[2])

NODEUNIT.reporters.default.run([NPATH.join(testPath, 'globals_test.js')]);