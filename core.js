var https = require('https');
var u = require('url');
var WebSocket = require('ws');
var mb = require('./messagebroker');

function makeRequest (object, callback, responseCB) {
    var accumulator = '';
    var response = null;

    var parsedUrl = u.parse('//' + object.url, true, true);

    var options = {
        hostname: parsedUrl.hostname,
        port: object.port || 443,
        path: parsedUrl.path,
        method: object.method || 'GET'
    };

    console.log('PATH: ', options.path);

    if (options.hostname === 'api.github.com') {
        options.auth = process.env.GITHUB_USERNAME + ':' + process.env.GITHUB_API_TOKEN;
        if (!object.headers) {
            options.headers = {'User-Agent': 'WhoopInc'};
        }
        else if (!object.headers['User-Agent']) {
            options.headers['User-Agent'] = 'WhoopInc';
        }
    }

    var req = https.request(options, function(res) {
        //console.log('RESPONSE HEADERS: ', res.headers);
        response = res;

        res.on('data', function (data) {
            accumulator = accumulator + data.toString();
        });

        res.on('close', function () {
            callback(JSON.parse(accumulator));

            if (responseCB) {
                responseCB(res);
            }

        });
    });

    req.on('close', function () {
        callback(JSON.parse(accumulator));

        if (responseCB) {
            responseCB(response);
        }

    });

    req.end();
}

function sendMessage(soc, data) {
    //console.log('sendMessage called');
    if (soc.readyState === WebSocket.OPEN && data) {
        //console.log('data exist');
        if (Array.isArray(data)) {
            //console.log('sending array');

            var val = data.pop();
            setInterval(function () {
                soc.send(JSON.stringify(val))
            }, 1000);
            for (var i = 0; i < data.length; i++) {
                setTimeout(function () {
                    soc.send(JSON.stringify(data[i]));
                }, 1000);
            }
        }
        else {
            soc.send(JSON.stringify(data));
            //console.log('sent normal term');
        }
    }
}


function ignoreEvent (event) {
    if (event.username && event.username === "slackbot") {
        return true;
    }

    if (!(event.type === "message" && event.user !== "U1ASA6B88" &&
        !event.hidden)) {
        return true;
    }

    return false;
}



function paginate (options, callback) {
    makeRequest(options, callback, function(response) {
        var linkHeader = response.headers.link;
        //console.log('LINK HEADER: ', linkHeader);

        if (linkHeader) {
            // var totalPages = 0;
            // var constantUrl = '';
            var links = linkHeader.split(',');

            for (var i = 0; i < links.length; i++) {
                console.log('links[', i, ']: ', links[i]);
            }
            var nextRegEx = new RegExp('<https://(.*)page=(.+)>; rel="last"');

            // nothing that matches regexp. fix.
            for (var i = 0; i < links.length; i++) {
                var matches = nextRegEx.exec(links[i]);
                if (matches) {
                    //console.log('WERE MATCHES');

                    var totalPages = matches[2];
                    var constantUrl = matches[1];

                    //console.log('NO. PAGES MATCH: ', totalPages);
                    //console.log('CONSTANT URL MATCH: ', constantUrl);

                    for (var i = 2; i <= totalPages; i++) {
                        var newOptions = {
                            url: constantUrl + 'page=' + i.toString()
                        };

                        makeRequest(newOptions, callback);
                    }

                    break;
                }
            }
        }
    });


}

module.exports = {
    makeRequest: makeRequest,
    sendMessage: sendMessage,
    ignoreEvent: ignoreEvent,
    paginate: paginate
};
