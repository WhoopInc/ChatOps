const https = require('https');
const WebSocket = require('ws');
require('dotenv').load();   // loads variables from .env to ENV


// contents of HTTPS server request
var options = {
    hostname: 'slack.com',
    port: 443,
    path: '/api/rtm.start?token=' + process.env.SLACK_API_TOKEN,
    method: 'GET'
};

// when request finished, open WebSocket and handle events
var finishedRequest = function () {
    var url = JSON.parse(alldata).url;
    // var selfId = JSON.parse(alldata).self.id
    // console.log(url);

    var socket = new WebSocket(url);

    // when socket opened, send message
    var onOpen = socket.on('open', function() {
        console.log('socket opened');
        var msg = {
            "id": 1,
            "type": "message",
            "channel": "C1BBWJ7PF",
            "text": "WhoopBot connected to WebSocket"
            // "id": selfId

        };
        socket.send(JSON.stringify(msg));

    });

    var onMessage = socket.on('message', function(event) {
        ev = JSON.parse(event);
        console.log(ev);
    });

};

var alldata = '';
var req = https.request(options, function(res) {
        // console.log('statusCode: ', res.statusCode);
        // console.log('headers: ', res.headers);

        res.on('data', function (data) {
            alldata = alldata + data.toString();
            // console.log('end data callback');
        });

        res.on('close', finishedRequest);
        // console.log('end response callback');

    });
req.on('close',finishedRequest);

req.end();

