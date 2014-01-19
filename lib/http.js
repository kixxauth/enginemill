var REQ = require('request')
  , IOU = require('iou')

exports.newRequest = function newRequest(method, uri) {
    var self = Object.create(null)

    self.send = function send() {
        var d = IOU.newDefer()
          , opts = {
                uri: uri
              , method: method
              , followRedirect: false
              , jar: false
            }

        REQ(opts, function (err, res, body) {
            if (err) return d.fail(err);
            return d.keep(wrapResponse(res, body));
        });

        return d.promise;
    };

    return self;
};

function wrapResponse(response, body) {
    var res = Object.create(null)

    res.headers    = Object.freeze(response.headers);
    res.statusCode = response.statusCode;
    res.body       = body;

    res.request = Object.freeze({
        method:  response.request.method
      , uri:     Object.freeze(response.request.uri)
      , headers: Object.freeze(response.request.headers)
    });

    return Object.freeze(res);
}
