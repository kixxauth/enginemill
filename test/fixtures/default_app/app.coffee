exports.usage = "foobar --foo -b"

exports.options =
  foo:
    alias    : 'f'
    describe : 'The foo switch'
    boolean  : yes

exports.main = (API) ->
  output =
    API : API

  process.stdout.write(JSON.stringify(output))
  return
