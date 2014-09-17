Running Your Own Scripts
========================
You can easily write and run your own scripts with the Enginemill environment
preloaded into them, which makes your scripting tasks easier than ever.

CoffeeScript is the preferred language for Enginemill programming, and it is assumed that all your scripts will be written in [CoffeeScript](http://coffeescript.org/).

To create an Enginemill script just compose a CoffeeScript file with the following structure:

```CoffeeScript
exports.usage = "myscript.coffee --first_name <First Name> --age <Age> --print_date"

exports.options =
	first_name:
		description: "Your first name"
		required: yes
		forceString: yes
	age:
		description: "Your age"
	print_date:
		description: "Output the date"
		boolean: true

exports.help = """
Print out your name and, optionally, your age.
"""

# The exports.main function will be called by Enginemill with the command line
# arguments and options parsed for you.
exports.main = (opts) ->
	out = "Hi #{opts.first_name} "

	# age is optional, so we check to see if it is there:
	if opts.age
		out += "it must be good to be #{opts.age} years old! "

	console.log(out)
	console.log(new Date()) if opts.print_date
	return
```

Here's what is going on in that script:
* `exports.usage` provides a usage summary of your script which you would see if you ran `em run ./myscript.coffee --help`.
* `exports.options` defines the options your script accepts. Notice how you can create descriptive help text for each option with `description`, indicate
required options with `required`, indicate boolean options with `boolean`, and force the parser to keep the value as a string with `forceString`.
* `exports.help` should give a longer explanation of how to use the script which you would see if you ran `em run ./myscript.coffee --help`.
* `exports.main` is the function that Enginemill will call when your script is
 executed, passing it the parse command line options.

## Running The Script
Running your scripts is easy with the Enginemill command `em run`. This is how
you might run the example above:

    em run /path/to/my/script --first_name kristoffer --print_date false

To print the usage and help strings from your script run it with the `--help` switch like this:

    em run /path/to/my/script --help

