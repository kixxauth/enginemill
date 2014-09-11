exports.usage = "echo_args.coffee --a_string <A String> --a_number <A Number> --a_boolean"

exports.options =
  a_string:
    description: "Expected to be a String"
    required: yes
    forceString: yes
  a_number:
    description: "Expected to be a Number."
    required: yes
  a_bool:
    description: "Expected to be a Boolean."
    boolean: yes

exports.help = """
Check argument type parsing and echo args.
"""


exports.main = (opts) ->
  if typeof opts.help isnt 'boolean'
    exitWith('`help` is not a Boolean')
  else if typeof opts.a_string isnt 'string'
    exitWith('`a_string` is not a String')
  else if typeof opts.a_number isnt 'number'
    exitWith('`a_number` is not a Number')
  else if typeof opts.a_boolean isnt 'boolean'
    exitWith('`a_boolean` is not a Boolean')

  # Test arguments
  console.log('a_string', opts.a_string)
  console.log('a_number', opts.a_number)
  console.log('a_boolean', opts.a_boolean)

  # Test expected globals
  console.log('LIB', LIB is require('../../../lib/library/'))
  console.log('fail', fail is LIB.fail)
  console.log('print', print is LIB.print)
  console.log('Promise', Promise is LIB.Promise)
  console.log('application', application instanceof require('../../../lib/enginemill/application').Application)
  return

exitWith = (message) ->
  console.log(message)
  process.exit(1)
