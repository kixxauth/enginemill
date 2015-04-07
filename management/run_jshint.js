"use strict";

var
CP       = require('child_process'),
FilePath = require('filepath').FilePath;

function main() {
  var
  projectDir = FilePath.create(__dirname).dirname();
  spawn({
    jshint: projectDir.append('node_modules', '.bin', 'jshint'),
    target: projectDir
  });
}

function spawn(args) {
  var
  argv = [args.jshint.toString(), args.target.toString()],
  child = CP.spawn('node', argv);
  child.on('error', function (err) {
    console.error('JSHint process error:');
    console.error(err.stack || err.message);
    process.exit(1);
  });
  child.stdout.pipe(process.stdout);
  child.stderr.pipe(process.stderr);
}

main();

