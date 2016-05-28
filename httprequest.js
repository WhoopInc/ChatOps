var https = require('https');
var u = require('url');

function makeRequest (object, callback) {
    var accumulator = '';

    var parsedUrl = u.parse('//' + object.url, true, true);

    var options = {
        hostname: parsedUrl.hostname,
        port: object.port || 443,
        path: parsedUrl.path,
        method: object.method || 'GET'
    };

    //console.log('OPTIONS1: ', options);

    if (options.hostname === 'api.github.com') {
        if (!object.headers) {
            options.headers = {'User-Agent': 'WhoopInc'};
        }
        else if (!object.headers['User-Agent']) {
            options.headers['User-Agent'] = 'WhoopInc';
        }
    }

    //console.log('OPTIONS2: ', options);

    var req = https.request(options, function(res) {

        res.on('data', function (data) {
            accumulator = accumulator + data.toString();
            //console.log('ACC: ', accumulator);
        });

        res.on('close', function () {
            callback(JSON.parse(accumulator));
        });
    });

    req.on('close', function () {
        callback(JSON.parse(accumulator));
    });

    req.end();
}

module.exports = {
    makeRequest: makeRequest
};
