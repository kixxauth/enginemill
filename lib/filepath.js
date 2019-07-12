'use strict';

const path = require('path');
const fs = require('fs-extra');

class Filepath {
	constructor(pathstring) {
		this.path = pathstring;
	}

	append(...parts) {
		parts.unshift(this.path);
		return new Filepath(path.join(...parts));
	}

	isFileSync() {
		const stats = fs.statSync(this.path);
		return stats.isFile();
	}

	isDirectorySync() {
		const stats = fs.statSync(this.path);
		return stats.isDirectory();
	}

	getBasename() {
		return path.basename(this.path);
	}

	getExtensionName() {
		return path.extname(this.path);
	}

	getDirectory() {
		return new Filepath(path.dirname(this.path));
	}

	ensureDirectory() {
		return fs.ensureDir(this.path).then(() => {
			return this;
		});
	}

	ensureFile() {
		return fs.ensureFile(this.path).then(() => {
			return this;
		});
	}

	list() {
		return new Promise((resolve, reject) => {
			return fs.readdir(this.path, (err, entries) => {
				if (err) {
					reject(err);
				} else {
					resolve(entries.map((basename) => {
						return new Filepath(path.join(this.path, basename));
					}));
				}
			});
		});
	}

	readFile(options = {}) {
		if (typeof options.encoding === 'undefined') {
			options.encoding = 'utf8';
		}

		return new Promise((resolve, reject) => {
			fs.readFile(this.path, options, (err, data) => {
				if (err) {
					reject(err);
				} else {
					resolve(data);
				}
			});
		});
	}

	writeFile(data, options = {}) {
		if (typeof options.encoding === 'undefined') {
			options.encoding = 'utf8';
		}

		return new Promise((resolve, reject) => {
			fs.writeFile(this.path, data, options, (err) => {
				if (err) {
					reject(err);
				} else {
					resolve(this);
				}
			});
		});
	}

	toString() {
		return this.path;
	}

	static create(pathstring) {
		return new Filepath(path.resolve(pathstring));
	}
}

module.exports = Filepath;
