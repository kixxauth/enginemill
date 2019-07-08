'use strict';

const path = require('path');

class Filepath {
	constructor(pathstring) {
		this.path = pathstring;
	}

	append(...parts) {
		parts.unshift(this.path);
		return new Filepath(path.join(...parts));
	}

	static create(pathstring) {
		return new Filepath(path.resolve(pathstring));
	}
}

module.exports = Filepath;
