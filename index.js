'use strict';

const initialize = require('./lib/initialize');
const startWebServer = require('./lib/start-web-server');


exports.startWebServer = function () {
	initialize().then((api) => {
		startWebServer(api).then((server) => {
			return true;
		});
	}).catch((err) => {
		/* eslint-disable no-console */
		console.error('startWebServer() initialization Error:');
		console.error(err.stack);
		/* eslint-enable no-console */
		return false;
	});
};
