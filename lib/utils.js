'use strict';

const yaml = require('yaml');

exports.parseYAML = function (text) {
	return yaml.parse(text);
};

exports.serializeAsYAML = function (object) {
	return yaml.stringify(object);
};
