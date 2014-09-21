# Installing Enginemill Plugins
Enginemill has a plugin system similar to that of other high level programming environments like Ruby on Rails or Wordpress. The plugin system is designed to make installing and using plugins as easy as possible.

## How Plugins are Installed
A plugin begins as a definition in the `package.json` file that defines the program you are working on. Each plugin you would like to use in your program should be listed in the `dependencies: {}` hash. Plugin names need to start with the 'em_' prefix to be recognized as a plugin by Enginemill. So your package.json file might look something like this:

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

For more information about this configuration file, see the docs for [package.json](package_json.md).

Enginemill specifically looks for those packages that start with 'em_' and initializes them for you using special methods. This means that you don't need to require your installed plugins with `require()`. Instead, most plugins are designed to either modify the Enginemill process, perform some task in the background, or provide a public API for you to use in your program. Check out the documentation that comes with your installed plugins, usually in the form of a README file, to see how your specific plugins interact with Enginemill.


