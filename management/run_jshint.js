#!/usr/bin/env node
'use strict';

var
CP       = require('child_process'),
FilePath = require('filepath').FilePath,
Promise  = require('bluebird');

exports.main = function () {
  var
  execFile = process.platform === 'win32' ? 'jshint.cmd' : 'jshint';

  console.log(' ### running lint_runner ### ');

  return new Promise(function (resolve, reject) {
    var
    exec = FilePath.create().append('node_modules', '.bin', execFile),
    dir  = FilePath.create(),
    proc = CP.spawn(exec.toString(), [dir.toString()]);
    proc.stdout.pipe(process.stdout);
    proc.stderr.pipe(process.stderr);
    proc.on('close', function (code) {
      if (code === 0) {
        return resolve(0);
      }
      return reject(new Error('Failed Linting'));
    });
  });
};


if (require.main === module) {
  exports.main()
    .then(function () {
      console.log('lint_runner succeeded :)');
    })
    .catch(function (err) {
      console.error('lint_runner run failed:');
      console.error(err.stack || err.message || err);
    });
}
