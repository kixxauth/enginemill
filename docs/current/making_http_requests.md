Making HTTP Requests
====================

You might find Enginemill's approach to making HTTP requests a little different
compared to what you've been accustomed to when using Node.js or Ajax.Enginemill makes use of Promises instead of nested callback functions to handle
asynchronous operations using the built in Promise library.

Here's an example of making a request and either printing out the HTTP headers,
or reporting a failure.
```JS
'use strict';

var enginemill = require('enginemill');

// Enginemill attaches a built in HTTP request library for convenience.
var REQ = enginemill.REQ;

REQ.get('www.example.com').promise
	.then(function (response) {
		console.log(response.headers);
	})
	.catch(function (err) {
		console.error(err.stack);
		process.exit(1);
	})
```

Instead of an immediate response to your request you get a reference to a Promise with `REQ.get("www.example.com").promise`. Since it takes time to fetch the response from www.example.com over the network you can be notified when the request succeeds or fails using the `then()` and `catch()` handlers.

If there are any errors in the process of making the HTTP request, or if any
errors are thrown inside the `printHeaders()` function, they will be caught and
passed to the handler passed into `.catch()`.

The `.then()` and `.catch()` methods of a Promise instance both return another
promise instance, so you can chain them like this:
```JS
'use strict';

var enginemill = require('enginemill');
var REQ = enginemill.REQ;

function printHeaders(response) {
	console.log(response.headers);
	return response;
}

function printBody(response) {
	console.log(response.body);
	return response;
}

function printLineCount(response) {
	var count = respond.body.split('\n').length;
	console.log('Line Count: %s', count);
	return response;
}

function fail(err) {
	console.error(err.stack);
	process.exit(1)
}

REQ.get("www.example.com").promise
	.then(printHeaders)
	.then(printBody)
	.then(printLineCount)
	.catch(fail);

```

To learn more about sending HTTP requests from your Enginemill application, check out the [REQ reference docs](./reference/http.md).
