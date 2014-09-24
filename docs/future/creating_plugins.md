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

Enginemill specifically looks for those packages that start with 'em_' and initializes them using a specially named method 'initialize()'. This means users will not be using `require()` to get a handle on your plugin. Instead, most plugins should be designed to either modify the Enginemill process, perform some task in the background. If you'd like to simply export a public API, you should probably create a Node.js module instead.

### Initialize
After your plugin is discovered in the dependencies list, Enginemill will look for an `initialize()` method exported from the index.coffee file in the root directory of your plugin. If this method is not found where it is expected to be, an error will be thrown.

So, at this point, your plugin should have a package.json file and an index.coffee file, where index.coffee exports an `initialize()` method:

```CoffeeScript
# index.coffee

exports.initialize = ->
    console.log('My plugin is initialized!');

```

If the `initialize()` method is found, Enginemill will call it with a special Plugin object passed in as the only parameter.

### The Plugin Object