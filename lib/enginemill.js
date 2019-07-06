'use strict';

const { NotFoundError } = require('kixx-server-errors');
const LinksDB = require('./links-db');
const ResourcesDB = require('./resources-db');


class Enginemill {
	constructor() {
		this.linksDB = null;
		this.resourcesDB = null;
		this.publicDirectory = null;
	}

	initialize({ baseDirectory }) {
		const dbDirectory = baseDirectory.append('enginemill');

		const promises = [
			dbDirectory.append('links.yaml').ensureDirectory(),
			dbDirectory.append('resources').ensureDirectory(),
			baseDirectory.append('public').ensureDirectory()
		];

		return Promise.all(promises).then((filepaths) => {
			this.linksDB = LinksDB.create({ filepath: filepaths[0] });
			this.resourcesDB = ResourcesDB.create({ dbDirectory: filepaths[1] });
			this.publicDirectory = filepaths[2];
		});
	}

	buildResourceByURI(uri) {
		return this.linksDB.read()
			.then((links) => {
				const link = links.find((item) => item.uri === uri);

				if (!link) {
					throw new NotFoundError(`No link found for URI ${uri}`);
				}

				return this.resourceDB.fetch(link.resourceID);
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
		return this.linksDB.read().then((links) => {

			const promises = links.map((link) => {
				return this.resourceDB.fetch(link.resourceID).then((resource) => {
					if (!resource) {
						throw new NotFoundError(`No resource found for URI ${link.uri}`);
					}

					return resource.build({
						rootDirectory: this.publicDirectory,
						uri: link.uri
					});
				});
			});

			return Promise.all(promises);
		});
	}
}

module.exports = Enginemill;
