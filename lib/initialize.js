'use strict';

const { StackedError } = require('kixx-server-errors');
const { createAPI } = require('./api');

const {
	isFunction,
	isPromise,
	union
} = require('./lib');


const BASE_PLUGIN_MODULE_PATH = '../plugins';


module.exports = function (applicationPlugin, overrides = {}) {
	const API = createAPI();
	const loadedPlugins = new Map();

	function getPlugin(id) {
		const plugin1 = overrides[id] || null;

		try {
			const plugin2 = require(`${BASE_PLUGIN_MODULE_PATH}/${id}`);
			return [ plugin1, plugin2 ];
		} catch (err) {
			if (!plugin1) {
				return Promise.reject(new StackedError(
					`Module loading error for plugin ${JSON.stringify(id)}`,
					err
				));
			}

			return [ plugin1, null ];
		}
	}

	function loadPlugin(api, id) {
		if (loadedPlugins.has(id)) {
			return Promise.resolve(api);
		}

		const [ plugin1, plugin2 ] = getPlugin(id);

		let dependencies;
		let initialize;

		if (plugin1 && plugin2) {
			const deps1 = Array.isArray(plugin1.dependencies) ? plugin1.dependencies : [];
			const deps2 = Array.isArray(plugin2.dependencies) ? plugin2.dependencies : [];
			dependencies = union(deps1, deps2);

			const init1 = plugin1.initialize;
			const init2 = plugin2.initialize;

			if (!isFunction(init1)) {
				return Promise.reject(new Error(
					`Plugin override ${JSON.stringify(id)} did not provide an initialize function`
				));
			}

			if (!isFunction(init2)) {
				return Promise.reject(new Error(
					`Plugin ${JSON.stringify(id)} did not export an initialize function`
				));
			}

			initialize = function (newApi) {
				const res = init2(newApi);

				if (isPromise(res)) {
					return res.then((latestApi) => {
						return init1(latestApi);
					});
				}

				if (!res) {
					throw new Error(`Plugin '${id}' did not return the api from initialize()`);
				}

				return init1(res);
			};
		} else if (plugin1) {
			dependencies = Array.isArray(plugin1.dependencies) ? plugin1.dependencies : [];
			initialize = plugin1.initialize;

			if (!isFunction(initialize)) {
				return Promise.reject(new Error(
					`Plugin ${JSON.stringify(id)} did not provide an initialize function`
				));
			}
		} else if (plugin2) {
			dependencies = Array.isArray(plugin2.dependencies) ? plugin2.dependencies : [];
			initialize = plugin2.initialize;

			if (!isFunction(initialize)) {
				return Promise.reject(new Error(
					`Plugin ${JSON.stringify(id)} did not export an initialize function`
				));
			}
		}

		const withDependencies = dependencies.reduce((promise, dependencyId) => {
			return promise.then((newApi) => loadPlugin(newApi, dependencyId));
		}, Promise.resolve(api));

		return withDependencies.then((newApi) => {
			const res = initialize(newApi);

			if (isPromise(res)) {
				return res.then((mutatedApi) => {
					if (!mutatedApi) {
						throw new Error(`Plugin '${id}' did not return the api from initialize()`);
					}
					return mutatedApi;
				});
			}

			if (!res) {
				throw new Error(`Plugin '${id}' did not return the api from initialize()`);
			}

			return res;
		}).then((newApi) => {
			loadedPlugins.set(id, newApi);
			return newApi;
		});
	}

	return loadPlugin(API, applicationPlugin);
};
