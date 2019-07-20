'use strict';


module.exports = function writePublicResource(args) {
	const {
		rootDirectory,
		uri,
		encoding,
		data
	} = args;

	const pathParts = uri.split('/');
	const file = rootDirectory.append(...pathParts);
	const options = { encoding };

	return file.ensureFile().then(() => {
		return file.writeFile(data, options);
	});
};
