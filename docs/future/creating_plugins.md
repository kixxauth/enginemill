# Building Enginemill Plugins

Enginemill has a plugin system which is similar to that of other high level programming environments like Ruby on Rails. The plugin system is designed to make creating and using plugins as easy as possible.

## The Lifecycle of a Plugin
A plugin begins as a definition in the `dependencies: {}` hash of the `package.json` file just like all other dependencies. Plugins are identified to Enginemill by using the 'em_' prefix. So a package.json file might look something like this:

```JSON
{
    "name": "my_program_name",
    "dependencies": {
        "amodule": "0.4.2",
        "em_aplugin": "1.3.4",
        "em_another_plugin": "2.4.5"
    }
}
```

For more information see the docs for [package.json](package_json.md).

Enginemill specifically looks for those packages that start with 'em_' and initializes them using a specially named method 'initialize()'. This means users will not be using `require()` to get a handle on your plugin. Instead, most plugins should be designed to either modify the Enginemill process or perform some task in the background. If you'd like to simply export a public API, you should probably create a Node.js module instead.

It's worth noting that when Enginemill is required by another program as a library, the plugin system will not be intialized. The full Enginemill stack is only initialized when the `em` command is invoked on the command line, or through some other execution mechanism.

### Initialize
After your plugin is discovered in the dependencies list, Enginemill will look for an `initialize()` method exported from the index.coffee file in the root directory of your plugin. If this method is not found where it is expected to be, an error will be thrown.

So, at this point, your plugin should have a package.json file and an index.coffee file, where index.coffee exports an `initialize()` method:

```CoffeeScript
# index.coffee

exports.initialize = (plugin) ->
    console.log('My plugin is initialized!');

```

If the `initialize()` method is found, Enginemill will call it with a special Plugin object passed in as the only parameter.

### The Plugin Object
The plugin API object passed into `initialize()` is an event emitter which your plugin can attach listeners to take action on certain events as well as some methods to you can use to hook into Enginemill.

These events include 'beforeload', 'loaded', and 'running'.

* 'beforeload' - Fires just before Enginemill loads. No arguments are passed into handlers for `beforeload`.
* 'loaded' - Fires after Enginemill has loaded and just before a command is run. The Enginemill Application object is passed into 'loaded' event handlers as the single parameter.
* 'running' - Fires after Enginemill has run a command. The Enginemill Application object is passed into 'running' event handlers as the single parameter.

The plugin object also has a `registerCommand()` method that allows you to create and register your own Enginemill commands (see below).

## Register Commands
Your plugin can register commands into the Enginemill command runner. For example, if you were to register a command named 'mycommand', when the user enters `em mycommand` on the command line, your command will be executed.

You register a command with Enginemill by calling the `registerCommand()` method on the Plugin object passed into `initialize()` with a special command definition object.

Your command object should have 3 properties and 1 method:

* commandName - The name of your command.
* usageString - The usage string for your command like 'mycommand <firstarg>'.
* helpString - The help string for your command like "A little plugin command I wrote.".
* run - The run method will be called by enginemill when your program is invoked. It is passed the parsed command line arguments and options as the single argument.

Your command name should only contain numbers letters, underscores, or hyphens. Spaces, in particular, will cause unexpected behavior. Enginemill checks your command name when you register it and will throw an error if your command name will not work on the command line.

Your `.run(args)` method will be passed an args object which contains the arguments parsed from the command line.

So the full command registration would look like this:
```CoffeeScript
# Inside your plugin's `index.coffee` file.

runCommand = (args) ->
  name = args._[1] or 'World'
  print "Hello #{name}!"

commandSpec =
  commandName: 'hello'
  usageString: 'hello [name]\tEcho "Hello [name]!"'
  helpString: """
  Arguments:
    [name] The name to say hello to (default = "World")
  """
  run: runCommand

exports.initialize = (plugin) ->
  plugin.registerCommand(commandSpec)
```

