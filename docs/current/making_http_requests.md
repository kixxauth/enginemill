Making HTTP Requests
====================

You might find Enginemill's approach to making HTTP requests a little different
compared to what you've been accustomed to when using Node.js or Ajax.
Enginemill makes use of Promises instead of nested callback functions to handle
asynchronous operations using the built in Promise library.

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

`LIB.http` is a reference to the HTTP request library which is built into Enginemill along with everything else in the Enginemill environment.

`LIB.http.get("www.example.com")` does exactly what you think it does: It makes an HTTP 'GET' request to "www.example.com".

However, instead of a response to your request you get a reference to a Promise with `LIB.http.get("www.example.com").promise`. Since it takes time to fetch the response from www.example.com over the network, Enginemill allows your program to do other things while you wait. So, by handing a Promise back to you instead of the actual HTTP response, you can be notified when the request succeeds or fails using the `then()` and `catch()` handlers.

In the example above, the HTTP response object is handed off to our `printHeaders()` function which simply prints out the HTTP headers with `print()`.

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

To learn more about sending HTTP requests from your Enginemill application, check out the [HTTP docs](./reference/http.md).
