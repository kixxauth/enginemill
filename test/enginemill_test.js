var
execCache = require('./common/process').execCache;


exports["em (no arguments)"] = {

  setUp : execCache('bin/em.js'),

  "it declares the enginemill lib it is running": function (test) {
    test.ok(/Running Enginemill from/.test(this.stdout), this.stdout.trim());
    return test.done();
  },

  "it messages a user about required commands": function (test) {
    test.equal(this.lines[0], "An enginemill command is required.");
    return test.done();
  },

  "it displays the help text": function (test) {
    test.ok(this.lines.length > 2, "stderr lines length");
    return test.done();
  }
};