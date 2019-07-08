'use strict';

const Filepath = require('./lib/filepath');
const Enginemill = require('./lib/enginemill');


exports.buildAllResources = function () {
	const eng = Enginemill.create();

	const options = {
		baseDirectory: Filepath.create(process.cwd())
	};

	/* eslint-disable no-console */
	eng.initialize(options).buildAllResources().then((res) => {
		console.log('DONE:');
		console.log(res);
	}).catch((err) => {
		console.log('Runtime ERROR:');
		console.log(err.stack || err);
	});
	/* eslint-enable no-console */
};
