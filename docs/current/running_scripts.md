Running Your Own Scripts
========================
You can easily write and run your own scripts with the Enginemill environment
preloaded into them!

CoffeeScript is the preferred language for Enginemill programming. So, using
CoffeeScript, just compose a script file with the following structure:

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

`exports.usage` gives a usage summary of your script.

`exports.options` defines the options your script accepts. Notice how you can
create descriptive help text for each option with `description`, indicate
required options with `required`, force the parser to keep the value as a
string with `forceString`, and indicate boolean options with `boolean`.

`exports.help` should give a longer explanation of how to use the script.

And, of course, `exports.main` is the function that Enginemill will call when
your script is executed.
