'use strict';

const { StackedError } = require('kixx-server-errors');
const { mergeDeep } = require('kixx-lib-es6');
const check = require('check-types');
const writePublicResource = require('./write-public-resource');
const utils = require('./utils');


module.exports = function buildYAML(args) {
	const {
		resourceDB,
		linksDB,
		rootDirectory,
		templateEngine,
		link,
		file
	} = args;

	let fileText;
	let context;

	return file.readFile()
		.then((res) => {
			fileText = res;

			try {
				context = utils.parseYAML(fileText);
			} catch (err) {
				throw new StackedError(
					`YAML parsing error in ${file}`,
					err
				);
			}

			return context;
		})
		.then(() => {
			// Any related relationship on a Link instance MUST be an Array.
			// (Including the "parent").
			if (link && link.related && link.related.parent) {
				// Resolve each parent resource and mutate the context with the
				// result. This creates a hierarchy of overriding properties to build
				// a context object from the parents of a resource.
				//
				// However, we pay a cost for this. Each resource will be built and written to the
				// public directory as many times at is is referenced by other resources.
				return link.related.parent.reduce((promise, parentResourceID) => {
					return promise.then((ctx) => {
						// Lookup the resource and the link that references it at the same time.
						const promises = [
							resourceDB.fetchResource(parentResourceID),
							linksDB.getLinkByResourceID(parentResourceID)
						];

						return Promise.all(promises).then(([ parentResource, parentLink ]) => {
							const params = {
								rootDirectory,
								templateEngine,
								link: parentLink
							};

							// TODO: Instead of calling resource.build(), perhaps we should find a way of
							// getting the context separately?? resource.build() is returning the public file
							// object anyway.
							return parentResource.build(params).then((newContext) => {
								context = mergeDeep(ctx, newContext);
								return context;
							});
						});
					});
				}, Promise.resolve(context));
			}

			return context;
		})
		.then(() => {
			if (!check.nonEmptyString(context.template)) {
				throw new Error(`A YAML resource must have a template (URI: ${link.uri})`);
			}

			return templateEngine.hydrateTemplate(context.template, context);
		})
		.then((text) => {
			return writePublicResource({
				rootDirectory,
				uri: link.uri,
				encoding: 'utf8',
				data: text
			});
		})
		.then((publicFile) => publicFile);
};
