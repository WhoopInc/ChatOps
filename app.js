const WebSocket = require('ws');
require('dotenv').load();

// when socket opens, notify channel
function onOpen (soc) {
    console.log('socket opened');
    var msg = {
        "id": 1,
        "type": "message",
        "channel": "C1BBWJ7PF",
        "text": "WhoopBot connected to WebSocket"
    };
    
    if (soc.readyState == 1) {
        soc.send(JSON.stringify(msg));
    };
};

// log incoming messages
function onMessage (event) {
    var ev = JSON.parse(event);
    var text = ev.text;
    console.log(event);
};


// when HTTPS request finished, initialize WebSocket and handle events
function finishedRequest(data) {
    //console.log('running fin');
    //console.log(data);
    //console.log('ran fin');
    var url = JSON.parse(data).url;
    //var selfId = JSON.parse(data).self.id
    // console.log(url);

    var socket = new WebSocket(url);

    // handle socket opening
    socket.on('open', function() {
        onOpen(socket);
    });

    // handle incoming messages
    socket.on('message', function(event) {
        onMessage(event);
    });

};

module.exports = {
    fin: finishedRequest
};

