var https = require('https');
var u = require('url');

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

    if (options.hostname === 'api.github.com') {
        options.auth = process.env.GITHUB_USERNAME + ':' +
        process.env.GITHUB_API_TOKEN;

        if (!object.headers) {
            options.headers = {'User-Agent': 'WhoopInc'};
        }
        else if (!object.headers['User-Agent']) {
            options.headers['User-Agent'] = 'WhoopInc';
        }
    }

    var req = https.request(options, function(res) {
        //console.log('RESPONSE', res);
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


function ignoreEvent (event) {
    if (event.username && event.username === "slackbot") {
        //console.log("ignore event from slackbot");
        return true;
    }

    if (!(event.type === "message" && event.user !== "U1ASA6B88" &&
        !event.hidden)) {
        //console.log("ignore event", event);
        return true;
    }

    //console.log("don't ignore event", event);
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

            var nextRegEx = new RegExp('<https://(.*)page=(.+)>; rel="last"');

            for (var j = 0; j < links.length; j++) {
                var matches = nextRegEx.exec(links[j]);
                if (matches) {
                    //console.log('WERE MATCHES');

                    var totalPages = matches[2];
                    var constantUrl = matches[1];

                    //console.log('NO. PAGES MATCH: ', totalPages);
                    //console.log('CONSTANT URL MATCH: ', constantUrl);

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
