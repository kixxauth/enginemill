'use strict';

const API = require('./lib/api');


const getCreator = K.curry(function getCreator(provided, key) {
	if (provided && provided[key] && typeof provided[key].create === 'function') {
		return provided[key];
	}
	return null;
});

const getFunction = K.curry(function getFunction(provided, key) {
	return provided && typeof provided[key] === 'function' ? provided[key] : null;
});

exports.API = API;
exports.RequestResponse = RequestResponse;

exports.initializeApi = K.initializeApi;

exports.handleWebRequest = K.curry(function handleWebRequest(RequestResponse, api, request, response) {
	return api.router.route(RequestResponse.create(api, request, response));
});

exports.startWebServer = K.curry(function startWebServer(api, handler) {
	return api.webServer.startWith(handler);
});

exports.startApplication = K.curry(function startApplication(deps, components, main) {
	const seedApi = deps.API.create(dependencies.seed);

	return deps
		.initializeApi(components, main, seedApi)
		.chain((api) => {
			const handler = deps.handleWebRequest(deps.RequestResponse, api);
			return deps.startWebServer(api, handler).map((server) => {
				return api.addServer(main, server);
			});
		});
});

function dependencies(defaults, provided) {
	const getC = getCreator(provided);
	const getF = getFunction(provided);

	return Object.freeze({
		API: getC('API') || defaults.API,
		RequestResponse: getC('RequestResponse') || defaults.RequestResponse,
		initializeApi: getF('initializeApi') || defaults.initializeApi,
		handleWebRequest: getF('handleWebRequest') || defaults.handleWebRequest,
		startWebServer: getF('startWebServer') || defaults.startWebServer,
		seed: provided.seed || defaults.seed
	});
}
exports.dependencies = K.curry(dependencies);

exports.seed = Object.freeze({});

function startApplicationWithDefaults(components, main, provided = {}) {
	const deps = dependencies(exports, provided);
	return exports.startApplication(deps, components, main);
}
exports.startApplicationWithDefaults = startApplicationWithDefaults;

