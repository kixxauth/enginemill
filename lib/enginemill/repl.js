
exports.startCSRepl = function startCSRepl(context) {
    var replServer = require('coffee-script/repl').start({
        prompt: 'cs> '
      , ignoreUndefined: true
    })
    return replServer;
};
