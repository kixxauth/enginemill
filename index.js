'use strict';

const { Logger, createLogger } = require('kixx-logger');


exports.Logger = Logger;
exports.createLogger = createLogger;

function startServer() {
	return Promise.reject(new Error('Not implemented'));
}

exports.startServer = startServer;
