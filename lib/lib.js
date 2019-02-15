'use strict';

const Ramda = require('ramda');
const KixxAssert = require('kixx-assert');
const KixxLib = require('kixx-lib-es6');

Object.assign(exports, Ramda);
Object.assign(exports, KixxAssert.helpers);
Object.assign(exports, KixxLib);

function getSafe(fn) {
	try {
		return fn();
	} catch (err) {
		return;
	}
}
exports.getSafe = getSafe;

function entries(x) {
	return Object.keys(x).map((key) => [ key, x[key] ]);
}
exports.entries = entries;

function isPromise(x) {
	return x && typeof x.then === 'function' && typeof x.catch === 'function';
}
exports.isPromise = isPromise;
