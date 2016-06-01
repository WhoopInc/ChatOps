var WebSocket = require('ws');
require('dotenv').load();
//var https = require('https');
//var u = require('url');
var httpcat = require('./httpcat.js');
var github = require('./github.js');
var core = require('./core.js');

// when socket opens, notify channel
function onOpen (soc) {
    // console.log('socket opened');
    var msg = {
        "id": 1,
        "type": "message",
        "channel": "C1BBWJ7PF",
        "text": "WhoopBot connected to WebSocket"
    };

    core.sendMessage(soc, msg);

}


// process incoming messages, return object with text, channel, user id
function onEvent (event, soc) {
    console.log(event);

    var ev = JSON.parse(event);
    var output = {};

    // if event is a message NOT from self, package relevant info

    if (!core.ignoreEvent(ev)) {
        output = {
            type: ev.type,
            user: ev.user,
            channel: ev.channel,
            text: ev.text
        };

        if (ev.text === 'get github') {
            github.getRepos(soc);
        }

        core.sendMessage(soc, httpcat.handleHTTP(output));

    }
}


// when HTTPS request finished, initialize WebSocket and handle events
function initializeWebSocket(data) {
    //console.log('running init');
    //console.log(data);
    //console.log('ran init');
    //var selfId = JSON.parse(data).self.id

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
    initializeWebSocket: initializeWebSocket
};
