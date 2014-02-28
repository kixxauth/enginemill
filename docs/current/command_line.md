Enginemill Command Line
=======================

Enginemill Console
------------------
The simplest Enginemill command is

	em

This will run the Enginemill console, with the Enginemill environment loaded
for you to experiment and interact with your applications and scripts. See
[Enginemill environment](./enginemill_environment) for more details.

Enginemill Help
---------------
To get help from Enginemill for command line usage, simply enter

	em --help

or

	em -h

Both commands are the same thing -- `em -h` is an alias for `em --help`.

Enginemill Commands
-------------------
You can get a list of Enginemill commands by entering `em --help` on the
command line.

### *help* Command
`em help <command>` will print out a help message for the specified Enginemill command. Example:

	em help run

prints out the help text for the `run` command.

### *run* Command
`em run <torun>` will run a specially formated script with the
Enginemill environment already loaded into it. Example:

	em run path/to/script.coffee

runs the `script.coffee` CoffeeScript file.
See [running scripts](./running_scripts) for more details.
