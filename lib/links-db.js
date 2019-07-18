'use strict';

const { StackedError } = require('kixx-server-errors');
const check = require('check-types');
const utils = require('./utils');


class Link {
	constructor(spec) {
		this.uri = spec.uri;
		this.resourceID = spec.resource;
		this.related = spec.related;
	}

	static create(spec) {
		if (check.not.nonEmptyString(spec.uri)) {
			throw new Error('link uri must be defined');
		}
		if (check.not.nonEmptyString(spec.resource)) {
			throw new Error('link resource must be defined');
		}
		return new Link(spec);
	}
}

class LinksDB {
	constructor({ filepath }) {
		this.filepath = filepath;
		this._fileExistsPromise = null;
	}

	scan() {
		return this.ensureFileExists()
			.then(() => {
				return this.filepath.readFile();
			})
			.then((text) => {
				if (!text) {
					throw new Error(`LinksDB file contains no data ${this.filepath}`);
				}
				return this.parseFile(text);
			})
			.then((data) => {
				return data.map((spec, i) => {
					try {
						return Link.create(spec);
					} catch (err) {
						throw new StackedError(`LinkDB entry error at index ${i}`, err);
					}
				});
			});
	}

	getLinkByURI(uri) {
		return this.ensureFileExists()
			.then(() => {
				return this.filepath.readFile();
			})
			.then((text) => {
				if (!text) {
					throw new Error(`LinksDB file contains no data ${this.filepath}`);
				}
				return this.parseFile(text);
			})
			.then((data) => {
				for (let i = 0; i < data.length; i++) {
					if (data[i].uri === uri) {
						return Link.create(data[i]);
					}
				}
				return null;
			});
	}

	getLinkByResourceID(resourceID) {
		return this.ensureFileExists()
			.then(() => {
				return this.filepath.readFile();
			})
			.then((text) => {
				if (!text) {
					throw new Error(`LinksDB file contains no data ${this.filepath}`);
				}
				return this.parseFile(text);
			})
			.then((data) => {
				for (let i = 0; i < data.length; i++) {
					if (data[i].resource === resourceID) {
						return Link.create(data[i]);
					}
				}
				return null;
			});
	}

	ensureFileExists() {
		if (this._fileExistsPromise) {
			return this._fileExistsPromise;
		}

		this._fileExistsPromise = this.filepath.ensureFile();

		return this._fileExistsPromise;
	}

	parseFile(text) {
		let data;

		try {
			data = utils.parseYAML(text);
		} catch (err) {
			throw new StackedError(
				`Error while parsing YAML in ${this.filepath}`,
				err
			);
		}

		if (!Array.isArray(data)) {
			throw new Error(`LinksDB data must be an Array from ${this.filepath}`);
		}

		return data;
	}

	static create(config) {
		return new LinksDB(config);
	}
}

LinksDB.Link = Link;

module.exports = LinksDB;
