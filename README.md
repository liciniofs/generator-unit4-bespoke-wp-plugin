# Plugin Boilerplate Generator #

## What it is ##

It will generate a base WordPress Plugin project with Gulp tasks.

## Instalation ##

Please read [Yeoman docs](http://yeoman.io) for Yeoman installation.  

*THIS IS NOT WORKING YET* 

Run `generator-unit4-bespoke-wp-plugin` from `npm`:  
`npm install -g generator-unit4-bespoke-wp-plugin`

## Bootstrap ##
`yo unit4-bespoke-wp-plugin` will generate a `package.json` and a `composer.php` with the specified dependencies, an `.editorconfig`, a `.gitignore`, a `phpunit.xml` and a `{plugin_name}.php`, and will create the following directories and files:

* languages/
* lib/
    * `Utils`
        * `Scripts.php`
	* `Activator.php`
	* `Deactivator.php`
	* `I18n.php`
	* `index.php`
	* `Plugin.php`
* src/
	* scripts/
	* styles/
* templates/
* test/
	* phpunit/
		* `sample.test.php`


## Sub-Generators:
Aditional sub-generators to generate/update files to enhance your plugin.
### Taxonomy
`yo unit4-bespoke-wp-plugin:taxonomy` will generate inside the plugin's `lib` folder the following files and directories:

* lib/
    * `Taxonomy.php`
    * Taxonomy/
        * `{taxonomy_class}.php`
* test/
    * phpunit/
        * `{taxonomy_test_name}.test.php`

It will be displayed the necessary code-block to be added in the Plugin to the correct taxonomy registry.

### Custom Post Type
`yo unit4-bespoke-wp-plugin:cpt` will generate inside the plugin's `lib` folder the following files and directories:

* lib/
    * `PostType.php`
    * PostType/
        * `{post_type_class}.php`
* test/
    * phpunit/
        * `{post_type_test_name}.test.php`

It will be displayed the necessary code-block to be added in the Plugin to the correct post type registry.

## Where can I report bugs? ##
[Git issues](https://github.com/liciniofs/generator-unit4-bespoke-wp-plugin/issues)

## Changelog ##
* 1.0.0
	* Initial release;
    * Bootstrap of plugins structure;
	* Sub-generator for `Taxonomy`.
* 1.1.0
	* Sub-generator for `Custom Post Type`.

## Contribute: ##

* clone this repo;
* create a new branch;
* add you contribution as a Pull Request;
* test using `npm link` ([learn more](http://yeoman.io/authoring/)).

### ROADMAP ###
* Sub-generator for `Frontend` type files
* Sub-generator for `Widget`
* Sub-generator for `WP-API EndPoint`
* App prompting refactor and field validation
* Suport for agnostic git URLs
* Option to add Gulp task for tests (validate if plugin is standalone)

## Contributors: ##
* log.OSCON <engenharia@log.pt>
* [Edygar de Lima](https://github.com/edygar)
* [Ricardo Castelhano](https://github.com/RicCastelhano)
* [Rui Barbosa](https://github.com/narayon)
* [Licínio Sousa](https://github.com/liciniofs)

## License: ##
[GPL-2.0 or later](http://www.gnu.org/licenses/gpl-2.0.html)
