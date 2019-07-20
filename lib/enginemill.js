'use strict';

const { NotFoundError } = require('kixx-server-errors');
const Resource = require('./resource');
const LinksDB = require('./links-db');
const ResourcesDB = require('./resources-db');
const TemplateEngine = require('./template-engine');
const writePublicResource = require('./write-public-resource');


class Enginemill {
	constructor() {
		this.linksDB = null;
		this.resourcesDB = null;
		this.publicDirectory = null;
		this.templateEngine = null;
	}

	initialize({ baseDirectory }) {
		const dbDirectory = baseDirectory.append('enginemill');
		const templateDirectory = baseDirectory.append('templates');

		const templateEngine = TemplateEngine.create({
			rootDirectory: templateDirectory,
			helpers: this.loadTemplateHelpers(templateDirectory.append('helpers.js'))
		});

		const promises = [
			dbDirectory.append('links.yaml').ensureFile(),
			dbDirectory.append('resources').ensureDirectory(),
			baseDirectory.append('public').ensureDirectory(),
			templateEngine.reloadPartials()
		];

		return Promise.all(promises).then((filepaths) => {
			this.linksDB = LinksDB.create({ filepath: filepaths[0] });

			this.resourcesDB = ResourcesDB.create({
				dbDirectory: filepaths[1],
				linksDB: this.linksDB
			});

			this.publicDirectory = filepaths[2];

			this.templateEngine = templateEngine;
		});
	}

	buildResourceByURI(uri) {
		let link;

		return this.linksDB.getLinkByURI().then((result) => {
			if (!result) {
				throw new NotFoundError(`No link found for URI ${uri}`);
			}

			link = result;

			return this.resourceDB.fetchResource(link.resourceID).then((resource) => {
				if (!resource) {
					throw new NotFoundError(`No resource found for URI ${uri}`);
				}

				return this.buildResource(link, resource);
			});
		});
	}

	buildAllResources() {
		return this.linksDB.scan().then((links) => {

			const promises = links.map((link) => {
				return this.resourcesDB.fetchResource(link.resourceID).then((resource) => {
					if (!resource) {
						throw new NotFoundError(`No resource found for URI ${link.uri}`);
					}

					return this.buildResource(link, resource);
				});
			});

			return Promise.all(promises);
		});
	}

	buildResource(link, { type, file }) {
		const resource = Resource.create({
			resourceDB: this.resourceDB,
			linksDB: this.linksDB,
			templateEngine: this.templateEngine,
			type,
			link,
			file
		});

		return resource.loadData()
			.then(() => {
				return resource.loadTemplate(resource.metaData, resource.data);
			})
			.then((text) => {
				if (text) {
					return writePublicResource({
						rootDirectory: this.publicDirectory,
						uri: link.uri,
						encoding: 'utf8',
						data: text
					});
				}

				return null;
			});
	}

	validateResources() {
		return this.resourcesDB.validateResources();
	}

	loadTemplateHelpers(file) {
		if (!file.isFileSync()) {
			return {};
		}

		const factories = require(file.path);

		return Object.entries(factories).reduce((helpers, [ key, factory ]) => {
			helpers[key] = factory(this);
			return helpers;
		}, {});
	}

	static create() {
		return new Enginemill();
	}
}

module.exports = Enginemill;
