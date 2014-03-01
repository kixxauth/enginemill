Making HTTP Requests
====================

If you've used Node.js to make HTTP requests, or have some experience with Ajax
in the web browsers, you mind find Enginemill's approach a little different at
first. That's because Enginemill makes liberal use of Promises to handle
asynchronous operations using the built in [Promise library](./promises).

```CoffeeScript
printHeaders = (response) ->
	console.log(response.headers)
	return

fail = (err) ->
	console.error(err)
	process.exit(1)
	return

LIB.http.get("www.example.com").promise().then(printHeaders).catch(fail)
```

Notice that the response and failure handler functions, `printHeaders()` and
`fail()`, are defined before the actual call to `LIB.http.get()`. That's best
practice when composing asynchronous operations with Enginemill.

The `LIB.http` symbol is a reference to the HTTP request library built into
the Enginemill library (`LIB`), which is automatically injected into your program for you as part
of the [Enginemill environment](./enginemill_environment). `LIB.http.get()` does
exactly what you think it does: Make an HTTP GET request to "www.example.com".

However, the response to your request is not returned right away. Instead,
since it takes time to actually fetch the response from www.example.com,
Enginemill allows your program to go do other things while you wait by handing
a promise back to you. A Promise is just that: a promise to deliver a result
after an operation has completed. Once the operation is complete, and the
result is ready, it is passed to the function you handed to `.then()`.

In this case, the HTTP response object is handed off to our `printHeaders()`
function which simply prints out the headers with `console.log()`.

## API

### Request
You get a Request instance when you call an HTTP method:

```CoffeeScript
# Request instance:
req = LIB.http.get("www.example.com")

# Promise instance:
promise = req.promise()
```

A Request instance is also a Stream instance, and has all the properties and
methods you would expect a Stream to have.

#### Request properties
* readable - Boolean which is true if the Request Stream is still readable.
* writable - Boolean whish is true if the Request Stream is still writable.
* method   - String like 'GET' indicating the HTTP method.
* headers  - An Object dictionary of HTTP headers sent.
* agent    - The Node.js HTTP Agent object used.
* uri      - A Node.js URL Object structured like this:
* uri.href     - The full URL String, like 'http://www.example.com'.
* uri.protocol - The protocol String, like 'http' or 'https'.
* uri.auth     - The authorization String, like 'username:password'.
* uri.host     - The full host string, including the port, like 'www.example.com:8080'.
* uri.hostname - Only the host name, not the port, like 'www.example.com'.
* uri.port     - The port number String of the URI, like '8080'.
* uri.path     - The path String with the query String, like '/customers?id=2'.
* uri.pathname - Only the path String, like '/customers'.
* uri.search   - Query String including the leading '?'.
* uri.query    - Only the query String, like 'id=2'.
* uri.hash     - The fragment String including the leading '#'.

#### Request methods
* promise() - Returns the Promise for the Response.

#### Request events
* error -

