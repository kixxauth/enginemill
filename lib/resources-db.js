'use strict';

const { StackedError } = require('kixx-server-errors');
const uuidv1 = require('uuid/v1');
const utils = require('./utils');


class Resource {
	static create(spec) {
		return new Resource(spec);
	}
}

Resource.TYPES = [];


class ResourcesDB {
	constructor({ dbDirectory }) {
		this.dbDirectory = dbDirectory;
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
							return Promise.all(directories.map(readDirectory));
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
				id: metaData.id,
				type: metaData.type,
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
