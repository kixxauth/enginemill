exports.usage = "foobar --foo -b"

exports.options =
  foo:
    alias    : 'f'
    describe : 'The foo switch'
    boolean  : yes

exports.main = (API) ->
  API.set('API_SETVAL', 'this value was set');

  output =
    API:
      configs       : API.configs
      Promise       : API.Promise is require('../../../lib/promise')
      print         : API.print is console.log
      U             : API.U is require('../../../lib/u')
      factory       : API.factory is require('../../../lib/objects').factory
      path          : API.path is require('filepath').FilePath.create
      initializer   : API.initializer is require('../../../lib/initializer')
      action        : API.action is require('../../../lib/action').create
      appdir        : typeof API.appdir is 'function'
      sysconfigsdir : typeof API.sysconfigsdir is 'function'
      usrconfigsdir : typeof API.usrconfigsdir is 'function'
      argv          : typeof API.argv is 'object' # includes null
      set           : typeof API.set is 'function'
      get           : typeof API.get is 'function'
    API_SETVAL: API.get('API_SETVAL')

  process.stdout.write(JSON.stringify(output))
  return
