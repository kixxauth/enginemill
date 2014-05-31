# HTTP Requests
The Enginemill HTTP request library:
```CoffeeScript
# Global:
LIB.http
```

## Making requests
There are several methods you can use to make HTTP requests, each corresponding
to an HTTP request method, and one generic method you can use for any HTTP
request type.

Each request method returns a Request instance (see [Request](#request) instances below):
```CoffeeScript
req = LIB.http.get('http://www.example.com')
```

And each Request instance has a promise attached to it:
```CoffeeScript
promise = LIB.http.get('http://wwww.example.com').promise
```

Promises come in really handy for chaining asynchronous operations. Checkout
the [Making HTTP Requests](../making_http_requests) tutorial for more info.


## HTTP Request Methods

### LIB.http.get(uri, opts)
Send a request using the HTTP 'GET' method.

To send URL query parameters, you can just append them on the URL String like
this:
```CoffeeScript
LIB.http.get('http://localhost:8080/pathname?foo=bar')
```

Or, you can add the parameters using an Object hash assigned to `qs` instead
(which is usually a better idea than manipulating the strings yourself):
```CoffeeScript
LIB.http.get('http://localhost:8080/pathname', {qs: {foo: 'bar'})
```

### LIB.http.post(uri, opts)
Send a request using the HTTP 'POST' method.

You can send a buffer or string in the options:
```CoffeeScript
LIB.http.post('http://localhost:8080/pathname', {body: 'hi'})
```

You can send form data with an Object hash:
```CoffeeScript
LIB.http.post('http://localhost:8080/pathname', {form: {foo: 'bar'}})
```
which will encode the form Object as a URL encoded query String and set the Content-Type
header to `application/x-www-form-urlencoded`.

Sending JSON is easy too:
```CoffeeScript
LIB.http.post('http://localhost:8080/pathname', {json: {foo: 'bar'}})
```
The Content-Type header will be set to `application/json` and the response body
will be parsed as JSON.

If no options hash Object is passed into .post(), it will return a FormData
instance (see FormData below).


### LIB.http.put(uri, opts)
Send a request using the HTTP 'PUT' method.

See the LIB.http.post() docs above. The API is the same.

```CoffeeScript
LIB.http.post('http://localhost:8080/pathname', {form: {foo: 'bar'}})
```

### LIB.http.patch(uri, opts)
Send a request using the HTTP 'PATCH' method.

See the LIB.http.post() docs above. The API is the same.

```CoffeeScript
LIB.http.post('http://localhost:8080/pathname', {form: {foo: 'bar'}})
```

### LIB.http.del(uri, opts)
Send a request using the HTTP 'DELETE' method.

```CoffeeScript
LIB.http.del('http://localhost:8080/path/resource')
```

### LIB.http.request(uri, opts)
A generic method for sending a request using any HTTP method.

```CoffeeScript
LIB.http.request('http://localhost:8080/pathname', {method: 'GET'})
```

When using the `.request()` method you need to remember to supply your own HTTP
method assigned as `method` on the options Object hash ('GET' in the example
above).


## HTTP Authentication
Have a look at the Wikipedia article on [Basic Access
Authentication](http://en.wikipedia.org/wiki/Basic_access_authentication) if
this concept is not familiar to you. With that said, the Enginmill `LIB.http`
library includes an easy way of providing HTTP authentication credentials.

```CoffeeScript
# Send a basic authentication header.
auth =
  username: 'john'
  password: 'firesale'

LIB.http.get('http://localhost:8080/pathname', {auth: auth})

# Retry with a basic authentication header, after receiving a 401 response from
# the server.
auth =
  username: 'john'
  password: 'firesale'
  sendImmediately: no

LIB.http.get('http://localhost:8080/pathname', {auth: auth})
```

The `sendImmediately` parameter defaults to `true` (or `yes` or `on`), which
causes the basic authentication header to be sent on the first request, which
is usualy what you want. If you explicitly set `sendImmediately` to `false` (or
`no` or `off`) then the library will retry the request with a proper
authentication header after receiving a 401 response from the server, which
must include a 'WWW-Authenticate' header indicating the required authentication
method.

Digest authentication is supported, but it only works with `sendImmediately`
set to false; otherwise the library will send the basic authentication header
on the initial request, which will probably cause the request to fail if the
server is expected digest authentication.


## Options for HTTP requests
Full list of options which can be passed into request methods.

__qs__ - An Object hash containing querystring values to be appended to the URL
String before the request is sent.
```CoffeeScript
# Send "http://localhost:8080/pathname?foo=bar&baz=true"
LIB.http.get('http://localhost:8080/pathname', {qs: {foo: 'bar', baz: true}})

# Send "http://localhost:8080/pathname?foo[0]=a&foo[1]=b&foo[2]=c&baz="
LIB.http.get('http://localhost:8080/pathname', {qs: {foo: ['a', 'b', 'c'], baz: null}})
```

__method__ - The HTTP method String (default: `"GET"`).
```CoffeeScript
# "Send a custom HTTP method (probably not a good idea in practice).
LIB.http.request('http://localhost:8080/pathname', {method: 'QUACK'})
```

__headers__ - An Object hash defining HTTP headers to send (default: `{}`).
```CoffeeScript
headers =
  'user-agent': 'Enginemill request library :-)'
  cookie: 'foo=bar; baz=true'

LIB.http.get('http://localhost:8080/pathname', {headers: headers})
```
In most POST, PUT, and PATCH requests the "content-length" and "content-type"
headers will be set for you based on your use of `json`, `form`, or `body`.

__body__ - Buffer or String for PATCH, POST and PUT requests.
```CoffeeScript
# Send a Buffer representing a String (defaults to 'utf8' encoding).
LIB.http.post('http://localhost:8080/pathname', {body: new Buffer('Hi server!')})
```
A String or Buffer will cause the 'content-length' header to be set
automatically, but not the 'content-type' header.

__form__ - An Object hash to send PATCH, POST and PUT requests with a URL encoded string.
```CoffeeScript
form =
  email: 'john@example.io'
  available: ['mon', 'wed', 'fri']
  after_hours: false

# Send the URL encoded form data as "email=john%40example.io&available[0]=mon&available[1]=wed&available[2]=fri&after_hours=false".
LIB.http.post('http://localhost:8080/pathname', {form: form})
```
When passed an Object this will add 'content-type:
application/x-www-form-urlencoded; charset=utf-8' and 'content-length' headers.

__json__ - An Object hash to send PATCH, POST and PUT requests with a JSON encoded string.
```CoffeeScript
form =
  email: 'john@example.io'
  available: ['mon', 'wed', 'fri']
  after_hours: false

# Send the URL encoded form data as:
# "{"email":"john@example.io","available":["mon","wed","fri"],"after_hours":false}".
LIB.http.post('http://localhost:8080/pathname', {json: form})
```
When passed an Object this will add 'content-type:
application/json', 'accept: application/json', and 'content-length' headers.

__auth__ - An Object hash containing values `username`, `password`, and
`sendImmediately` fields.  See HTTP Authentication documentation above for more
information on how to use this.

__followRedirect__ - follow HTTP 3xx responses as redirects (default: `false`)

__followAllRedirects__ - follow non-GET HTTP 3xx responses as redirects (default: `false`)

__maxRedirects__ - the maximum number of redirects to follow (default: `10`)

__jar__ - If `true`, remember cookies for future use (or define your custom cookie jar; see examples section)

__strictSSL__ - If `true`, requires SSL certificates be valid. **Note:** to use your own certificate authority, you need to specify an agent that was created with that CA as an option.

__timeout__ - Integer containing the number of milliseconds to wait for a request to respond before aborting the request

__localAddress__ - Local interface to bind for network connections.

__pool__ - A hash object containing the agents for these requests. If omitted, the request will use the global pool (which is set to node's default `maxSockets`)

__pool.maxSockets__ - Integer containing the maximum amount of sockets in the pool.


### Class: Request
You get a Request instance when you call an HTTP method:

```CoffeeScript
# Request instance:
req = LIB.http.get("www.example.com")
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

#### Request methods
* __form()__ - Returns a form object which can be used to send various kinds of HTTP form data. See
[FormData](#formdata) below for more information.

### Response
You get a Response instance passed to the success handler of the promise
returned by the request.

```CoffeeScript
# Request instance:
req = LIB.http.get("www.example.com")

# Response instance:
req.promise.then (res) ->
	print res.headers
```

#### Response properties
* __headers__ - Object hash of HTTP response headers.
* __httpVersion__ - HTTP version String.
trailers
url
method
statusCode
client
httpVersionMajor
httpVersionMinor
upgrade
* __request__ - The original Request instance.
toJSON
body

### FormData
Send multipart file data by creating a form object with the Request#form() method:
```CoffeeScript
// No .body, .form, or .json options are required.
form = LIB.http.post('http://localhost:8080/pathname').form()
form.append('foo', 'bar')
form.append('a_file', LIB.Path.create('./my_pic.jpg').newReadStream())
form.append('a_buffer', new Buffer('foobarbaz'))
```

### Streaming
A Request instance is also a Stream instance, and has all the properties and
methods you would expect a Stream to have.

