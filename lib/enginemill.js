'use strict';

const { NotFoundError } = require('kixx-server-errors');
const LinksDB = require('./links-db');
const ResourcesDB = require('./resources-db');
const TemplateEngine = require('./template-engine');


class Enginemill {
	constructor() {
		this.linksDB = null;
		this.resourcesDB = null;
		this.publicDirectory = null;
		this.templateEngine = null;
	}

	initialize({ baseDirectory }) {
		const dbDirectory = baseDirectory.append('enginemill');

		const templateEngine = TemplateEngine.create({
			rootDirectory: baseDirectory.append('templates')
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
		return this.linksDB.getLinkByURI()
			.then((link) => {
				if (!link) {
					throw new NotFoundError(`No link found for URI ${uri}`);
				}

				return this.resourceDB.fetchResource(link.resourceID);
			})
			.then((resource) => {
				if (!resource) {
					throw new NotFoundError(`No resource found for URI ${uri}`);
				}

				return resource.build({
					rootDirectory: this.publicDirectory,
					uri
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
					return resource.build({
						link,
						rootDirectory: this.publicDirectory,
						templateEngine: this.templateEngine
					});
				});
			});

			return Promise.all(promises);
		});
	}

	validateResources() {
		return this.resourcesDB.validateResources();
	}

	static create() {
		return new Enginemill();
	}
}

module.exports = Enginemill;
