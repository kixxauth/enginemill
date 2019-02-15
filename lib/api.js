'use strict';

const path = require('path');
const { createLogger } = require('./logger');
const { createConfig } = require('./config');

const {
	isNonEmptyString
} = require('./lib');


const DEFAULT_NAME = 'application-management-server';
const DEFAULT_CONFIG_PATH = path.join(path.dirname(__dirname), 'default-config.json');


function createAPI(props = {}) {
	const api = Object.assign(Object.create(null), props);

	if (isNonEmptyString(api.name)) api.name = DEFAULT_NAME;

	if (!api.logger) api.logger = createLogger({ name: api.name });

	if (!api.config) api.config = createConfig({ path: DEFAULT_CONFIG_PATH });

	api.merge = (newProps) => {
		return createAPI(Object.assign(Object.create(null), api, newProps));
	};

	return Object.freeze(api);
}

exports.createAPI = createAPI;
