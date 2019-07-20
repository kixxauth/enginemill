'use strict';

const { StackedError } = require('kixx-server-errors');
const utils = require('./utils');

const protoToString = Object.prototype.toString;


class Resource {
	constructor({ resourceDB, linksDB, link, type, file }) {
		this.resourceDB = resourceDB;
		this.linksDB = linksDB;
		this.type = type;
		this.link = link;
		this.file = file;
		this.data = null;
		this.metaData = null;
	}

	loadData() {
		let dataPromise;

		switch (this.type) {
			case 'yaml':
				dataPromise = this.loadYamlData();
				break;
			case 'markdown':
				dataPromise = this.loadMarkdownData();
				break;
			default:
				throw new Error(`Unable to load data from resource type "${this.type}"`);
		}

		return dataPromise.then(({ data, metaData }) => {
			this.data = data;

			// Any related relationship on a Link instance MUST be an Array.
			// (Including the "parent").
			const parents = this.link && this.link.related && this.link.parent;

			if (parents) {
				// Resolve each parent resource and mutate the context with the
				// result. This creates a hierarchy of overriding properties to build
				// a context object from the parents of a resource.
				return parents.reduce((promise, parentResourceID) => {
					return promise.then((mData) => {
						// Lookup the resource and the link that references it at the same time.
						const promises = [
							this.resourceDB.fetchResource(parentResourceID),
							this.linksDB.getLinkByResourceID(parentResourceID)
						];

						return Promise.all(promises).then(([ parentResource, parentLink ]) => {
							// Create the parent Resource instance and call loadData() on it.
							const spec = {
								resourceDB: this.resourceDB,
								linksDB: this.linksDB,
								type: parentResource.type,
								link: parentLink,
								file: parentResource.file
							};

							return Resource.create(spec).loadData().then((parentMetaData) => {
								this.metaData = Resource.mergeMetaData(parentMetaData, metaData);
								return this;
							});
						});
					});
				}, Promise.resolve(metaData));
			}

			this.metaData = metaData;

			return this;
		});
	}

	loadYamlData() {
		return this.file.readFile().then((text) => {
			const data = null;
			let metaData;

			try {
				metaData = utils.parseYAML(text);
			} catch (err) {
				throw new StackedError(
					`YAML parsing error in ${this.file}`,
					err
				);
			}

			return { data, metaData };
		});
	}

	loadMarkdownData() {
		return this.file.readFile().then((text) => {
			const lines = text.trim().split('\n').map((line) => line.trimEnd());

			let frontMatter = null;
			let content = null;

			for (let i = 0; i < lines.length; i++) {
				const line = lines[i];

				// Handle the delimeter
				if (!content && line.startsWith('---')) {
					if (frontMatter) {
						content = [];
					} else {
						frontMatter = [];
					}
					continue;
				}

				// Currently parsing the front matter.
				if (frontMatter) {
					frontMatter.push(line);
					continue;
				}

				// Currently parsing the content/data section.
				if (!content) {
					content = [];
				}
				content.push(line);
			}

			const data = content.join('\n');

			let metaData;

			try {
				metaData = utils.parseYAML(text);
			} catch (err) {
				throw new StackedError(
					`YAML parsing error in ${this.file}`,
					err
				);
			}

			return { data, metaData };
		});
	}

	static mergeMetaData(...objects) {
		let hasObject = false;
		let target;

		for (let i = 0; i < objects.length; i++) {
			const source = objects[i];

			if (Array.isArray(source)) {
				if (hasObject) continue;
				target = source.map(clone);
				continue;
			}

			if (typeof source !== 'object' || source === null) {
				if (hasObject) continue;
				target = source;
				continue;
			}

			if (!hasObject) {
				target = {};
				hasObject = true;
			}

			target = mergeObject(target, source);
		}

		return target;
	}

	static create(spec) {
		return new Resource(spec);
	}
}


module.exports = Resource;


function mergeObject(target, source) {
	const keys = Object.keys(source);

	for (let i = 0; i < keys.length; i++) {
		const key = keys[i];
		const v = source[key];
		const t = target[key];

		if (typeof v !== 'object' || v === null) {
			target[key] = v;
			continue;
		}
		if (Array.isArray(v)) {
			if (Array.isArray(t)) {
				target[key] = t.concat(v);
			} else {
				target[key] = v.map(clone);
			}
			continue;
		}
		if (typeof t !== 'object' || t === null) {
			target[key] = clone(v);
			continue;
		}

		target[key] = mergeObject(t, v);
	}

	return target;
}


function clone(obj) {
	const type = typeof obj;

	if (obj === null || type !== 'object') return obj;

	if (Array.isArray(obj)) return obj.map(clone);

	if (protoToString.call(obj) === '[object Date]') {
		return new Date(obj.toString());
	}

	const keys = Object.keys(obj);
	const newObj = {};

	for (let i = 0; i < keys.length; i++) {
		const k = keys[i];
		newObj[k] = clone(obj[k]);
	}

	return newObj;
}
