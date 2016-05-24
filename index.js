const https = require('https');
const WebSocket = require('ws');

var options = {
    hostname: 'slack.com',
    port: 443,
    path: '/api/rtm.start?token=xoxb-44894215280-8MGiBbRWEdHI1UdXa097vwtv',
    method: 'GET'
};

var finishedRequest = () => {
    var url = JSON.parse(alldata).url;
    var selfId = JSON.parse(alldata).self.id
    // console.log(url);

    var socket = new WebSocket(url);

    socket.on('open', () => {
        console.log('socket opened');
        var msg = {
            type: "message",
            text: "WhoopBot connected to WebSocket",
            id: selfId,
            date: Date.now()
        };
        socket.send(JSON.stringify(msg));
    });
};

var alldata = '';
var req = https.request(options, (res) => {
        // console.log('statusCode: ', res.statusCode);
        // console.log('headers: ', res.headers);

        res.on('data', (data) => {
            alldata = alldata + data.toString();
            // console.log('end data callback');
        });

        res.on('close', finishedRequest);
        // console.log('end response callback');

    });
req.on('close',finishedRequest);

req.end();