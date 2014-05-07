# HTTP Requests
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

### LIB.http.del(uri, opts)
Send a request using the HTTP 'DELETE' method.

```CoffeeScript
LIB.http.del('http://localhost:8080/path/resource')
```

### LIB.http.patch(uri, opts)
Send a request using the HTTP 'PATCH' method.

See the LIB.http.post() docs above. The API is the same.

```CoffeeScript
LIB.http.post('http://localhost:8080/pathname', {form: {foo: 'bar'}})
```

### LIB.http.request(uri, opts)
A generic method for sending a request using any HTTP method.

```CoffeeScript
LIB.http.request('http://localhost:8080/pathname', {method: 'GET'})
```

When using the `.request()` method you need to remember to supply your own HTTP
method assigned as `method` on the options Object hash ('GET' in the example
above).

## Options for HTTP requests
Full list of options which can be passed into request methods.

__qs__ - An Object hash containing querystring values to be appended to the URL
String before the request is sent.
```CoffeeScript
# "Send http://localhost:8080/pathname?foo=bar&baz=true"
LIB.http.get('http://localhost:8080/pathname', {qs: {foo: 'bar', baz: true}})

# "Send http://localhost:8080/pathname?foo[0]=a&foo[1]=b&foo[2]=c&baz="
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
headers will be set for you.

__body__ - entity body for PATCH, POST and PUT requests. Must be a `Buffer` or `String`.

__form__ - when passed an object, this sets `body` to a querystring representation of value, and adds `Content-type: application/x-www-form-urlencoded; charset=utf-8` header.

__json__ - sets `body` but to JSON representation of value and adds `Content-type: application/json` header.  Additionally, parses the response body as JSON.

__encoding__ - Encoding to be used on `setEncoding` of response data. If `null`, the `body` is returned as a `Buffer` (default: `undefined`).

__auth__ - A hash containing values `user` || `username`, `pass` || `password`, and `sendImmediately` (optional).  See documentation above.

__oauth__ - Options for OAuth HMAC-SHA1 signing. See documentation above.

__aws__ - Object containing AWS signing information. Should have the properties `key`, `secret`. Also requires the property `bucket`, unless you’re specifying your `bucket` as part of the path, or the request doesn’t use a bucket (i.e. GET Services)

__httpSignature__ - Options for the [HTTP Signature Scheme](https://github.com/joyent/node-http-signature/blob/master/http_signing.md) using [Joyent's library](https://github.com/joyent/node-http-signature). The `keyId` and `key` properties must be specified. See the docs for other options.

__hawk__ - Options for [Hawk signing](https://github.com/hueniverse/hawk). The `credentials` key must contain the necessary signing info, [see hawk docs for details](https://github.com/hueniverse/hawk#usage-example).

__followRedirect__ - follow HTTP 3xx responses as redirects (default: `false`)

__followAllRedirects__ - follow non-GET HTTP 3xx responses as redirects (default: `false`)

__maxRedirects__ - the maximum number of redirects to follow (default: `10`)

__jar__ - If `true`, remember cookies for future use (or define your custom cookie jar; see examples section)

__strictSSL__ - If `true`, requires SSL certificates be valid. **Note:** to use your own certificate authority, you need to specify an agent that was created with that CA as an option.

__timeout__ - Integer containing the number of milliseconds to wait for a request to respond before aborting the request

__proxy__ - An HTTP proxy to be used. Supports proxy Auth with Basic Auth, identical to support for the `url` parameter (by embedding the auth info in the `uri`)

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

