'use strict';

const { StackedError } = require('kixx-server-errors');
const Handlebars = require('handlebars');


class TemplateEngine {
	constructor(spec) {
		this.rootDirectory = spec.rootDirectory;
		this.handlebars = Handlebars.create();

		this.handlebars.registerHelper(spec.helpers);

		this.partials = [];
	}

	// Walk the template partials directory tree, read the files and create the named partials.
	reloadPartials() {
		// Unregister old partials if there are any.
		for (let i = 0; i < this.partials.length; i++) {
			this.unregisterPartial(this.partials[i]);
		}

		this.partials = [];

		const readDirectory = (prefix, directory) => {
			return directory.readDirectory().then((entries) => {
				const directories = [];
				const files = [];

				for (let i = 0; i < entries.length; i++) {
					const fp = entries[i];

					if (fp.isFileSync()) {
						files.push(fp);
					} else if (fp.isDirectorySync()) {
						directories.push(fp);
					}
				}

				// Register partials for all files in the directory.
				const filePromises = files.map((file) => {
					return file.readFile().then((text) => {
						const name = file.getBasename().split('.')[0];
						const fullName = prefix ? `${prefix}/${name}` : name;

						this.handlebars.registerPartial(fullName, text);
						this.partials.push(fullName);
					});
				});

				// Walk any subdirectories that exist.
				Promise.all(filePromises).then(() => {
					return Promise.all(directories.map((dir) => {
						const newPrefix = prefix ? `${prefix}/${dir.getBasename()}` : dir.getBasename();
						return readDirectory(newPrefix, dir);
					}));
				});
			});
		};

		const dir = this.rootDirectory.append('partials');

		if (dir.isDirectorySync()) {
			return readDirectory('', dir).then(() => true);
		}

		return Promise.resolve(false);
	}

	hydrateTemplate(template, context) {
		const templateFile = this.getTemplateFile(template);

		if (!templateFile.isFileSync()) {
			throw new Error(`Template file is not a file (${templateFile})`);
		}

		return templateFile.readFile().then((source) => {
			let tmpl;

			try {
				tmpl = this.handlebars.compile(source);
			} catch (err) {
				throw StackedError(
					`Template compile error in ${templateFile}`,
					err
				);
			}

			try {
				return tmpl(context);
			} catch (err) {
				throw new StackedError(
					`Template hydration error in ${template}`,
					err
				);
			}
		});
	}

	getTemplateFile(template) {
		const parts = template.split('/');
		const basename = parts.pop();
		parts.push(`${basename}.hbs`);
		return this.rootDirectory.append(...parts);
	}

	static create(spec = {}) {
		if (!spec.rootDirectory || !spec.rootDirectory.isDirectorySync()) {
			throw new Error('TemplateEngine.create() expects rootDirectory to be a directory');
		}

		if (!spec.helpers) {
			spec.helpers = {};
		}

		return new TemplateEngine(spec);
	}
}

module.exports = TemplateEngine;
