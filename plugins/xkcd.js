var http = require('http');

var DOMAIN = 'http://xkcd.com/';
var PATH = 'info.0.json';

function isCallable (text) {
    return /xkcd/i.test(text);
}

function executePlugin (channel, callback) {
    var message;
    current(function (data, err) {
        if (err) {
            message = 'Error fetching from xkcd.'
        } else {
            message = data.img;

            callback({
                "id": 8,
                "type": "message",
                "channel": channel,
                "text": message
            });
        }
    });
}

function helpDescription () {
    return '_XKCD_\nSend *xkcd* to fetch the latest comic.';
}

// Gets the current xkcd.
// @param id [String|Number] The id of the xkcd. Blank for current xkcd.
// @param cb [Function] The callback that passes (`err`, `data`)
// @example current(2, function(err, data){ console.log(data); });
function current (callback) {
  var url = DOMAIN + PATH;

  http.get(url, function(res) {
    var body = '';

    res.on('data', function(chunk) {
      body += chunk;
    });

    res.on('end', function() {
      var data = JSON.parse(body);
      callback(data, undefined);
    });
  }).on('error', function(err) {
    callback(undefined, err);
  });
}


module.exports = {
    executePlugin: executePlugin,
    isCallable: isCallable,
    helpDescription: helpDescription
};


