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


exports["em foo (invalid command)"] = {

  setUp : execCache('bin/em.js foo'),

  "it messages the user about invalid command": function (test) {
    test.equal(this.lines[0], "'foo' is not a valid enginemill command.");
    return test.done();
  },

  "it shows valid commands": function (test) {
    test.equal(this.lines[1], "Valid commands are: help, run");
    return test.done();
  },

  "it displays the help text": function (test) {
    test.ok(this.lines.length > 3, "stderr lines length");
    return test.done();
  }
};


exports["em help (general help)"] = {

  setUp : execCache('bin/em.js help'),

  "it shows help and exits": function (test) {
    test.equal(this.lines[0], "Usage:");
    test.ok(this.lines.length > 3, "stderr lines length");
    return test.done();
  }
};

