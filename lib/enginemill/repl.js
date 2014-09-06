
exports.startJSRepl = function startJSRepl(context) {
    var replServer = require('repl').start({
        prompt: 'js> '
      , ignoreUndefined: true
    })
    return replServer;
};


exports.startCSRepl = function startCSRepl(context) {
    var replServer = require('coffee-script/lib/coffee-script/repl').start({
        prompt: 'cs> '
      , ignoreUndefined: true
      , historyFile: false
    })
    return replServer;
};
