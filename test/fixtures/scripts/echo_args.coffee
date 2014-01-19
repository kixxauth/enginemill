exports.usage = "echo_args.coffee --filter <filtername> --source <filepath>"

exports.options =
  filter:
    description: "The filter to use"
    required: yes
    forceString: yes
  source:
    description: "The path to the source CSV file."
    required: yes
    forceString: yes

exports.help = """
Filters:

  debits     - Keeps only the debit transaction from the raw bank file.
  accounting - Formats a manually edited debit file to a format for accounting software.
"""


exports.main = (opts) ->
  console.log("filter:", opts.filter)
  console.log("source:", opts.source)
  return
