'use strict';

class Resource {
	static create(spec) {
		return new Resource(spec);
	}
}

class ResourcesDB {
	constructor({ dbDirectory }) {
		this.dbDirectory = dbDirectory;
	}

	fetchResource(id) {
	}

	static create(config) {
		return new ResourcesDB(config);
	}
}

ResourcesDB.Resource = Resource;

module.exports = ResourcesDB;
