require('dotenv').config({silent: true});
var WebSocket = require('ws');
var httpcat = require('./httpcat.js');
var github = require('./github.js');
var core = require('./core.js');
var mb = require('./messagebroker.js');
var jenkins = require('./jenkins.js');

var msgBroker;

// when socket opens, notify channel
function onOpen (soc, channelIDs) {

    msgBroker = new mb.MessageBroker(soc);

    msgBroker.init();

    channelIDs.forEach(function(id) {
        msgBroker.push({
            "id": 1,
            "type": "message",
            "channel": id,
            "text": "WhoopBot " + process.env.VERSION +
                " connected to WebSocket"
        });
    });
}


// process incoming messages, return object with text, channel, user id
function onEvent (event, soc) {
    if (soc.readyState === WebSocket.OPEN) {
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
                github.getRepos(ev.channel, function (res) {
                    msgBroker.push(res);
                });
            }

            if (ev.text.includes("jenkins")) {
                jenkins.processCommand(ev.text.split("jenkins ").pop().trim(), ev.channel, function (res) {
                    msgBroker.push(res);
                })
            }


            // prepare to handle http messages
            var cat = httpcat.handleHTTP(output);

            if (cat) {
                msgBroker.push(cat);
            }
        }
    }
}

// when HTTPS request finished, initialize WebSocket and handle events
function initializeWebSocket(data) {

    var socket = new WebSocket(data.url);

    var memberChannels = [];

    data.channels.forEach(function(channel) {
        if (channel.is_member) {
            memberChannels.push(channel.id);
        }
    });

    // handle socket opening
    socket.on('open', function() {
        onOpen(socket, memberChannels);
    });

    // handle incoming messages
    socket.on('message', function(event) {
        onEvent(event, socket);

    });

    socket.on('close', function close() {
        //console.log('disconnected');
        memberChannels.forEach(function (channelID) {
            msgBroker.push({
                "id": 1,
                "type": "message",
                "channel": channelID,
                "text": "WhoopBot " + process.env.VERSION +
                    " disconnected from WebSocket."
            });
        });
    });

    process.once('SIGTERM', function () {
        memberChannels.forEach(function (channelID) {
            msgBroker.push({
                "id": 1,
                "type": "message",
                "channel": channelID,
                "text": "WhoopBot " + process.env.VERSION +
                    " disconnected, received SIGTERM."
            });
        });
    });

}


module.exports = {
    initializeWebSocket: initializeWebSocket
};
