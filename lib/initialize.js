'use strict';

const { StackedError } = require('kixx-server-errors');
const { createAPI } = require('./api');

const {
	isFunction,
	isPromise,
	union
} = require('./lib');


const BASE_COMPONENT_MODULE_PATH = '../components';


module.exports = function (applicationComponent, overrides = {}) {
	const API = createAPI();
	const loadedComponents = new Map();

	function getComponent(id) {
		const component1 = overrides[id] || null;

		try {
			const component2 = require(`${BASE_COMPONENT_MODULE_PATH}/${id}`);
			return [ component1, component2 ];
		} catch (err) {
			if (!component1) {
				return Promise.reject(new StackedError(
					`Module loading error for component ${JSON.stringify(id)}`,
					err
				));
			}

			return [ component1, null ];
		}
	}

	function loadComponent(api, id) {
		if (loadedComponents.has(id)) {
			return Promise.resolve(api);
		}

		const [ component1, component2 ] = getComponent(id);

		let dependencies;
		let initialize;

		if (component1 && component2) {
			const deps1 = Array.isArray(component1.dependencies) ? component1.dependencies : [];
			const deps2 = Array.isArray(component2.dependencies) ? component2.dependencies : [];
			dependencies = union(deps1, deps2);

			const init1 = component1.initialize;
			const init2 = component2.initialize;

			if (!isFunction(init1)) {
				return Promise.reject(new Error(
					`component override ${JSON.stringify(id)} did not provide an initialize function`
				));
			}

			if (!isFunction(init2)) {
				return Promise.reject(new Error(
					`component ${JSON.stringify(id)} did not export an initialize function`
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
					throw new Error(`component '${id}' did not return the api from initialize()`);
				}

				return init1(res);
			};
		} else if (component1) {
			dependencies = Array.isArray(component1.dependencies) ? component1.dependencies : [];
			initialize = component1.initialize;

			if (!isFunction(initialize)) {
				return Promise.reject(new Error(
					`component ${JSON.stringify(id)} did not provide an initialize function`
				));
			}
		} else if (component2) {
			dependencies = Array.isArray(component2.dependencies) ? component2.dependencies : [];
			initialize = component2.initialize;

			if (!isFunction(initialize)) {
				return Promise.reject(new Error(
					`component ${JSON.stringify(id)} did not export an initialize function`
				));
			}
		}

		const withDependencies = dependencies.reduce((promise, dependencyId) => {
			return promise.then((newApi) => loadComponent(newApi, dependencyId));
		}, Promise.resolve(api));

		return withDependencies.then((newApi) => {
			const res = initialize(newApi);

			if (isPromise(res)) {
				return res.then((mutatedApi) => {
					if (!mutatedApi) {
						throw new Error(`component '${id}' did not return the api from initialize()`);
					}
					return mutatedApi;
				});
			}

			if (!res) {
				throw new Error(`component '${id}' did not return the api from initialize()`);
			}

			return res;
		}).then((newApi) => {
			loadedComponents.set(id, newApi);
			return newApi;
		});
	}

	return loadComponent(API, applicationComponent);
};
