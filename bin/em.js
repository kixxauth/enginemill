#!/usr/bin/env node
process.title = 'em';

var NPATH = require('path')
  , NFS   = require('fs')

  , cwd  = NPATH.join(process.cwd(), 'node_modules', 'enginemill')

  , dir  = NFS.existsSync(cwd) ? cwd :
         NPATH.dirname(NPATH.dirname(NFS.realpathSync(__filename)))

require(dir).main();
