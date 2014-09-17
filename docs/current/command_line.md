Enginemill Command Line
=======================
Enginemill is a command line application, which means all the core functionality can be run from your command terminal. You can try all of the following examples from your terminal after installing Enginemill.

Enginemill Help
---------------
The Enginemill executable is simply `em`. To get help from Enginemill for command line usage, simply enter

    em --help

or

    em -h

Both commands are the same thing -- `em -h` is an alias for `em --help`.

Enginemill Console
------------------
The simplest Enginemill command is

    em

The `em` command, without any arguments or options, will run the Enginemill console by default, with the Enginemill environment loaded for you. This allows to experiment and interact with your applications and scripts. See
[Enginemill environment](./enginemill_environment.md) for more details.

Enginemill Commands
-------------------
You can get a list of Enginemill commands by entering `em --help` on the command line.

### *help* Command
`em help <command>` will print out a help message for the specified Enginemill command. Example:

    em help run

This prints out the help text for the `run` command. The `em help` command is really the only one you need to memorize :smile:.

### *run* Command
`em run <torun>` will run a specially formated script with the Enginemill environment already loaded into it. Example:

    em run path/to/script.coffee

This will run the `script.coffee` CoffeeScript file in the current working directory.

See [running scripts](./running_scripts.md) for more details about creating your own Enginemill scripts.
