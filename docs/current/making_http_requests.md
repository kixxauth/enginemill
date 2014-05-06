Making HTTP Requests
====================

You might find Enginemill's approach to making HTTP requests a little different
compared to what you've been accustomed to when using Node.js or Ajax.
Enginemill makes use of Promises instead of nested callback functions to handle
asynchronous operations using the built in [Promise library](./promises).

Here's an example of making a request and either printing out the HTTP headers,
or reporting a failure.
```CoffeeScript
# Define a function to print the HTTP headers.
printHeaders = (response) ->
	print(response.headers)
	return

# Define a function to print an error and exit.
fail = (err) ->
	print(err)
	process.exit(1)
	return

LIB.http.get("www.example.com").promise.then(printHeaders).catch(fail)
```

Notice that the response and failure handler functions (`printHeaders()` and
`fail()`) are defined before the actual call to `LIB.http.get()`. That's best
practice when composing asynchronous operations, and you'll commonly see
that in Enginemill applications.

`LIB.http` is a reference to the HTTP request library which is built
into Enginemill and automatically injected into your program along with
everything else in the [Enginemill environment](./enginemill_environment).
That means you don't have to explicitly `reauire()` it.

`LIB.http.get()` does exactly what you think it does: It makes an HTTP 'GET'
request to "www.example.com".

However, the response to your request is not returned right away. Instead,
since it takes time to actually fetch the response from www.example.com,
Enginemill allows your program to do other things while you wait. By handing a
promise back to you instead of the actual HTTP response, you can simply be
notified when the request succeeds or fails.

A Promise is just that -- A promise to deliver a result to you after an
operation has completed. Once the operation is complete, and the result is
ready, it is passed to the function you handed to `.then()`.

In this case, the HTTP response object is handed off to our `printHeaders()`
function which simply prints out the HTTP headers with `print()`.

If there are any errors in the process of making the HTTP request, or if any
errors are thrown inside the `printHeaders()` function, they will be caught and
passed to the `fail()` function which you passed into `.catch()`.

The `.then()` and `.catch()` methods of a Promise instance both return another
promise instance, so you can chain them like this:
```CoffeeScript

printHeaders = (response) ->
	console.log(response.headers)
	return response

printBody = (response) ->
	console.log(response.body)
	return response

printLineCount = (response) ->
	count = respond.body.split('\n').length
	console.log("Line Count:", count)
	return response

fail = (err) ->
	console.error(err)
	process.exit(1)
	return

LIB.http.get("www.example.com").promise
	.then(printHeaders)
	.then(printBody)
	.then(printLineCount)
	.catch(fail)

```
To learn more about promises and how you can use them to make asynchronous
operations much easier to understand, check out the [Promises
documentation](./promises).
