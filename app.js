var WebSocket = require('ws');
require('dotenv').load();
//var https = require('https');
//var u = require('url');
var httpcat = require('./httpcat.js');
var github = require('./github.js');
var core = require('./core.js');
var mb = require('./messagebroker.js');

var msgBroker;

// when socket opens, notify channel
function onOpen (soc) {

    var msg = {
        "id": 1,
        "type": "message",
        "channel": "C1BBWJ7PF",
        "text": "WhoopBot connected to WebSocket"
    };

    msgBroker = new mb.MessageBroker (soc);

    msgBroker.init();

    msgBroker.push(msg);

    github.getRepos(msgBroker.push);

}

function helper (msg) {
    msgBroker.push(msg);
}


// process incoming messages, return object with text, channel, user id
function onEvent (event, soc) {
    console.log(event);

    var ev = JSON.parse(event);
    var output = {};

    // if event is a message NOT from self, package relevant info
    if (!core.ignoreEvent(event)) {

        output = {
            type: ev.type,
            user: ev.user,
            channel: ev.channel,
            text: ev.text
        };

        // if (ev.text === 'get github') {
        //     console.log('called getRepos from app');
        //     github.getRepos();
        // }

        msgBroker.push(httpcat.handleHTTP(output));

    }


}

// when HTTPS request finished, initialize WebSocket and handle events
function initializeWebSocket(data) {

    var socket = new WebSocket(data.url);

    // handle socket opening
    socket.on('open', function() {
        onOpen(socket);
    });

    // handle incoming messages
    socket.on('message', function(event) {
        onEvent(event, socket);

    });

}





module.exports = {
    initializeWebSocket: initializeWebSocket,
    helper: helper
};
