'use strict';

class API extends K.API {
	// assign(newProps) {
	// 	return new this.constructor(Object.assign(
	// 		Object.create(null),
	// 		this,
	// 		newProps
	// 	));
	// }

	addServer(key, server) {
		return this.assign({
			servers: K.assoc(key, server, this.servers)
		});
	}

	static create(seed) {
		const servers = seed.servers
			? Object.assign(Object.create(null), seed.servers)
			: Object.create(null);

		return new API(Object.assign(Object.create(null), seed, {
			servers
		}));
	}
}

module.exports = API;
