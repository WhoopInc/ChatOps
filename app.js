require('dotenv').config({silent: true});
const WebSocket = require('ws');
const _ = require('lodash');

const core = require('./core.js');
const mb = require('./messagebroker.js');
const ds = require('./datastore.js');

const plugins = require('./plugins/index.js');


var msgBroker;

var whitelistChannels = ['C1DNMQSCD', // #botdev
                         'C1BBWJ7PF' // #bottest
];

// when socket opens, notify channel
function onOpen (soc, channelIDs) {

    msgBroker = new mb.MessageBroker(soc);

    msgBroker.init();

    dataStore = new ds.DataStore();

    channelIDs.forEach(function(id) {
        if (_.includes(whitelistChannels, id)) {
            msgBroker.push({
                "id": 1,
                "type": "message",
                "channel": id,
                "text": "WhoopBot " + process.env.VERSION +
                    " connected to WebSocket"
            });
        }
    });
}


// process incoming messages, return object with text, channel, user id
function onEvent (event, soc) {
    if (soc.readyState === WebSocket.OPEN) {
        console.log(event);

        var ev = JSON.parse(event);

        // if event is a message NOT from self, package relevant info
        if (!core.ignoreEvent(ev)) {

            plugins.handlePlugins(ev.channel, function (res) {
                msgBroker.push(res);
            }, ev.text, ev.user);
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
