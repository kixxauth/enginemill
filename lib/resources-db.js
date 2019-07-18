'use strict';

const { StackedError } = require('kixx-server-errors');
const check = require('check-types');
const buildYAML = require('./build-yaml');
const buildMarkdown = require('./build-markdown');
const uuidv1 = require('uuid/v1');
const utils = require('./utils');


class Resource {
	constructor(spec) {
		this.resourceDB = spec.resourceDB;
		this.linksDB = spec.linksDB;
		this.id = spec.id;
		this.type = spec.type;
		this.file = spec.file;
	}

	build({ rootDirectory, templateEngine, link }) {
		switch (this.type) {
			case 'yaml':
				return buildYAML({
					resourceDB: this.resourceDB,
					linksDB: this.linksDB,
					rootDirectory,
					templateEngine,
					link,
					file: this.file
				});
			case 'md':
				return buildMarkdown({
					resourceDB: this.resourceDB,
					linksDB: this.linksDB,
					rootDirectory,
					templateEngine,
					link,
					file: this.file
				});
			default:
				throw new Error(`No build routine for resource type "${this.type}"`);
		}
	}

	static create(spec = {}) {
		if (!check.object(spec.resourceDB)) {
			throw new Error('Resource.create() missing spec.resourceDB');
		}
		if (!check.object(spec.linksDB)) {
			throw new Error('Resource.linksDB() missing spec.linksDB');
		}
		if (!check.nonEmptyString(spec.id)) {
			throw new Error('Resource.create() missing spec.id');
		}
		if (!check.nonEmptyString(spec.type)) {
			throw new Error('Resource.create() missing spec.type');
		}
		if (!check.object(spec.file)) {
			throw new Error('Resource.create() missing spec.file');
		}

		return new Resource(spec);
	}
}

Resource.TYPES = [
	'.yaml',
	'.md'
];


class ResourcesDB {
	constructor({ dbDirectory, linksDB }) {
		this.dbDirectory = dbDirectory;
		this.linksDB = linksDB;
	}

	fetchResource(id) {
		// Recursively read a directory tree, looking for data and metadata files.
		const readDirectory = (directory) => {
			return directory.list().then((items) => {
				const directories = [];
				let metaFile;
				let dataFile;

				// Filter: Looking for dataFile, metaFile, or more directories.
				for (let i = 0; i < items.length; i++) {
					const file = items[i];

					if (file.isFileSync()) {
						const basename = file.getBasename();
						if (basename === 'meta.yaml') {
							metaFile = file;
						} else if (basename.startsWith('data.')) {
							dataFile = file;
						}
					} else if (file.isDirectorySync()) {
						directories.push(file);
					}
				}

				// If we have a dataFile, assume we are dealing with a resource record at this
				// level in the directory tree.
				//
				// But, just because we have a data file does not always mean the meta file will
				// be present. If not, it is constructed using the type derived from the data
				// file basename extension.
				if (dataFile) {
					return this.createResource(metaFile, dataFile).then((resource) => {
						if (resource.id === id) {
							// We've found our resource.
							return resource;
						}

						// The resource is not here, hopefully it is somewhere else. Keep recursively
						// walking the directory tree.
						if (directories.length > 0) {
							return directories.reduce((promise, dir) => {
								return promise.then((res) => {
									if (res) return res;
									return readDirectory(dir);
								});
							}, Promise.resolve(null));
						}

						// Give up.
						return null;
					});
				}

				// No data file, but if there are any directories present at this level in the
				// directory tree then recursively walk those too.
				if (directories.length > 0) {
					return Promise.all(directories.map(readDirectory));
				}

				// Give up.
				return null;
			});
		};

		return readDirectory(this.dbDirectory);
	}

	validateResources() {
		const readDirectory = (directory, results) => {
			return directory.list().then((items) => {
				const directories = [];
				let metaFile;
				let dataFile;

				// Filter: Looking for dataFile, metaFile, or more directories.
				for (let i = 0; i < items.length; i++) {
					const file = items[i];

					if (file.isFileSync()) {
						const basename = file.getBasename();
						if (basename === 'meta.yaml') {
							metaFile = file;
						} else if (basename.startsWith('data.')) {
							dataFile = file;
						}
					} else if (file.isDirectorySync()) {
						directories.push(file);
					}
				}

				// If we have a dataFile, assume we are dealing with a resource record at this
				// level in the directory tree.
				//
				// But, just because we have a data file does not always mean the meta file will
				// be present. If not, it is constructed using the type derived from the data
				// file basename extension.
				if (dataFile) {
					return this.createResource(metaFile, dataFile)
						.then((resource) => {
							// Nothing to report for this resource.
							return results.push(null);
						})
						.catch((err) => {
							return results.push(new StackedError(
								`Error in resource at ${dataFile}`,
								err
							));
						})
						.then(() => {
							// Recursively walk any subdirectories if there are any.
							// Flatten the results by return the mutated results Array when the Promise.all() resolves.
							if (directories.length > 0) {
								return Promise.all(directories.map((dir) => {
									return readDirectory(dir, results);
								})).then(() => results);
							}

							// Otherwise, we're done here.
							return results;
						});
				}

				// No data file, but if there are any directories present at this level in the
				// directory tree then recursively walk those too.
				// Flatten the results by return the mutated results Array when the Promise.all() resolves.
				if (directories.length > 0) {
					return Promise.all(directories.map((dir) => {
						return readDirectory(dir, results);
					})).then(() => results);
				}

				// Done.
				return results;
			});
		};

		return readDirectory(this.dbDirectory, []);
	}

	createResource(metaFile, dataFile) {
		let metaFilePromise;

		// Read the meta file if it exists, or create it if it does not.
		if (metaFile) {
			metaFilePromise = ResourcesDB.readMetaFile(metaFile);
		} else {
			metaFilePromise = ResourcesDB.createMetaFile({
				directory: dataFile.getDirectory(),
				type: dataFile.getExtensionName()
			});
		}

		return metaFilePromise.then((metaData) => {
			// Once we have the meta data we can return the Resource instance.
			return Resource.create({
				resourceDB: this,
				linksDB: this.linksDB,
				id: metaData.id,
				type: metaData.type.replace(/^./, ''),
				file: dataFile
			});
		});
	}

	static createMetaFile({ directory, type }) {
		if (!Resource.TYPES.includes(type)) {
			throw new Error(`Resource type "${type}" is not recognized`);
		}

		const id = uuidv1();

		const data = {
			id,
			type
		};

		const text = utils.serializeAsYAML(data);

		return directory.append('meta.yaml').writeFile(text).then(() => {
			return data;
		});
	}

	static readMetaFile(metaFile) {
		return metaFile.readFile().then((text) => {
			try {
				return utils.parseYAML(text);
			} catch (err) {
				throw new StackedError(
					`Error while parsing YAML in ${metaFile}`,
					err
				);
			}
		});
	}

	static create(config) {
		return new ResourcesDB(config);
	}
}

ResourcesDB.Resource = Resource;

module.exports = ResourcesDB;
