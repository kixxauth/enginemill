# Building Enginemill Plugins

Enginemill has a plugin system which is similar to that of other high level programming environments like Ruby on Rails. The plugin system is designed to make creating and using plugins as easy as possible.

# The Lifecycle of a Plugin
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

Enginemill specifically looks for those packages that start with 'em_' and initializes them using a single specially named method 'initialize()'. This means that users don't need to require your plugins with `require()`. Instead, most plugins should be designed to either modify the Enginemill process, perform some task in the background, or provide a public API.



