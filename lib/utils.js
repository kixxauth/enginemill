'use strict';

const yaml = require('yaml');

exports.parseYaml = function (text) {
	return yaml.parse(text);
};
