var https = require('https');
var u = require('url');

function getAuthByHost (hostname) {
    if (hostname === 'jenkins.whoop.com' || hostname === 'api.github.com') {
        return process.env.GITHUB_USERNAME + ':' +
        process.env.GITHUB_API_TOKEN;
    }
}

function makeRequest (object, callback, responseCB, postData) {
    var accumulator = '';

    var parsedUrl = u.parse('//' + object.url, true, true);

    var options = {
        hostname: parsedUrl.hostname,
        port: object.port || 443,
        path: parsedUrl.path,
        method: object.method || 'GET',
        auth: getAuthByHost(parsedUrl.hostname)
    };

    if (object.headers) {
        options.headers = object.headers;
    }

    if (options.hostname === 'api.github.com') {

        if (!object.headers) {
            options.headers = {'User-Agent': 'WhoopInc'};
        }
        else if (!object.headers['User-Agent']) {
            options.headers['User-Agent'] = 'WhoopInc';
        }
    }

    console.log('OPTIONS: ', options);

    var response = null;
    var req = https.request(options, function(res) {
        response = res;

        res.on('data', function (data) {
            accumulator = accumulator + data.toString();
            res.resume();
        });

        res.on('close', function () {
            // first assume accumulator is JSON object
            var responseContent;
            try {
                responseContent = JSON.parse(accumulator);
            }
            catch (err) {
                responseContent = accumulator;
            }

            callback(responseContent, response.statusCode);


            if (responseCB) {
                responseCB(res);
            }

        });
    });

    req.on('close', function () {
        console.log('RESPONSE CODE: ', response.statusCode);
        //console.log('ACCUMULATOR: ', accumulator);

        // first assume accumulator is JSON object
        var responseContent;
        try {
            responseContent = JSON.parse(accumulator);
        }
        catch (err) {
            responseContent = accumulator;
        }

        callback(responseContent, response.statusCode);

        if (responseCB) {
            responseCB(response);
        }

    });

    if (postData) {
        req.write(postData);
    }

    req.end();
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

        if (linkHeader) {

            var links = linkHeader.split(',');

            var nextRegEx = new RegExp('<https://(.*)page=(.+)>; rel="last"');

            for (var j = 0; j < links.length; j++) {
                var matches = nextRegEx.exec(links[j]);
                if (matches) {

                    var totalPages = matches[2];
                    var constantUrl = matches[1];

                    for (var k = 2; k <= totalPages; k++) {
                        var newOptions = {
                            url: constantUrl + 'page=' + k.toString()
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
    ignoreEvent: ignoreEvent,
    paginate: paginate
};
