'use strict';

const { StackedError } = require('kixx-server-errors');
const utils = require('./utils');


class Link {
	constructor(spec) {
		this.uri = spec.uri;
		this.resourceID = spec.resource;
	}

	static create(spec) {
		return new Link(spec);
	}
}

class LinksDB {
	constructor({ filepath }) {
		this.filepath = filepath;
		this._fileExistsPromise = null;
	}

	read() {
		return this.ensureFileExists()
			.then(() => {
				return this.readFile();
			})
			.then((text) => {
				return this.parseFile();
			});
	}

	ensureFileExists() {
		if (this._fileExistsPromise) {
			return this._fileExistsPromise;
		}

		this._fileExistsPromise = this.filepath
			.isFileAsync()
			.then((isFile) => {
				if (isFile) return true;
				return this.filepath.ensurePath();
			});

		return this._fileExistsPromise;
	}

	parseFile(text) {
		let data;

		try {
			data = utils.parseYaml(text);
		} catch (err) {
			throw new StackedError(
				`Error while parsing YAML in ${this.filepath}`,
				err
			);
		}

		if (!Array.isArray(data)) {
			throw new Error(`LinksDB data must be an Array from ${this.filepath}`);
		}

		return data.map(LinksDB.Link.create);
	}

	static create(spec) {
		return new LinksDB(spec);
	}
}

LinksDB.Link = Link;

module.exports = LinksDB;
