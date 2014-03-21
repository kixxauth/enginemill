# HTTP Requests
```
LIB.http
```

## Making requests
There are several methods you can use to make HTTP requests, each corresponding
to an HTTP request method, and one generic method you can use for any HTTP
request type.

Each request method returns a Request instance (see Request instances below):
```
req = LIB.http.get('http://www.example.com')
```

And each Request instance has a promise attached to it:
```
promise = LIB.http.get('http://wwww.example.com').promise
```

Promises come in really handy for chaining asynchronous operations. Checkout
the [Making HTTP Requests](../making_http_requests) tutorial for mor info.

### LIB.http.get(uri, opts)
Send a request using the HTTP 'GET' method.

To send URL query parameters, you can just append them on the URL String like
this:
```
LIB.http.get('http://localhost:8080/pathname?foo=bar')
```

Or, you can add the parameters using an Object hash in the options:
```
LIB.http.get('http://localhost:8080/pathname', {qs: {foo: 'bar'})
```

### LIB.http.post(uri, opts)
Send a request using the HTTP 'POST' method.

You can send a buffer or string in the options:
```
LIB.http.post('http://localhost:8080/pathname', {body: 'hi'})
```

Or send form data:
```
LIB.http.post('http://localhost:8080/pathname', {form: {foo: 'bar'}})
```
Encodes the form Object as a URL encoded query String and sets the Content-Type
header to `application/x-www-form-urlencoded`.

If no options are passed into .post(), it will return a FormData instance (see
FormData below).

Or send JSON:
```
LIB.http.post('http://localhost:8080/pathname', {json: {foo: 'bar'}})
```
The Content-Type header will be set to `application/json` and the response body
will be parsed as JSON.


### LIB.http.put(uri, opts)
Send a request using the HTTP 'PUT' method.

See the LIB.http.post() docs above.

### LIB.http.del(uri, opts)
Send a request using the HTTP 'DELETE' method.

### LIB.http.patch(uri, opts)
Send a request using the HTTP 'PATCH' method.

### LIB.http.request(uri, opts)
A generic method for sending a request using any HTTP method.

### Options

### Request
You get a Request instance when you call an HTTP method:

```CoffeeScript
# Request instance:
req = LIB.http.get("www.example.com")

# Promise instance:
promise = req.promise()
```

### Response

### FormData
Send multipart file data by creating a form object:
```
// No .body, .form, or .json options are required.
form = LIB.http.post('http://localhost:8080/pathname').form()
form.append('foo', 'bar')
form.append('a_file', LIB.Path.create('./my_pic.jpg').newReadStream())
form.append('a_buffer', new Buffer('foobarbaz'))
```

#### Request properties
* __promise__  - A [Promise](./promises) instance for the HTTP Response object.
* __readable__ - Boolean which is true if the Request Stream is still readable.
* __writable__ - Boolean which is true if the Request Stream is still writable.
* __method__   - String like 'GET' indicating the HTTP method.
* __headers__  - An Object dictionary of HTTP headers sent.
* __agent__    - The Node.js HTTP Agent object used.
* __uri__      - A Node.js URL Object structured like this:
	* __uri.href__     - The full URL String, like 'http://www.example.com'.
	* __uri.protocol__ - The protocol String, like 'http' or 'https'.
	* __uri.auth__     - The authorization String, like 'username:password'.
	* __uri.host__     - The full host string, including the port, like 'www.example.com:8080'.
	* __uri.hostname__ - Only the host name, not the port, like 'www.example.com'.
	* __uri.port__     - The port number String of the URI, like '8080'.
	* __uri.path__     - The path String with the query String, like '/customers?id=2'.
	* __uri.pathname__ - Only the path String, like '/customers'.
	* __uri.search__   - Query String including the leading '?'.
	* __uri.query__    - Only the query String, like 'id=2'.
	* __uri.hash__     - The fragment String including the leading '#'.

### Streaming
A Request instance is also a Stream instance, and has all the properties and
methods you would expect a Stream to have.

