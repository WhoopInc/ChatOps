const WebSocket = require('ws');
const fs = require('fs');
const _ = require('lodash');

const core = require('./core.js');
const mb = require('./messagebroker.js');
const ds = require('./datastore.js');
const config = require('./configenv.js');

const plugins = require('./plugins/index.js');

var whitelistChannels = ['C1DNMQSCD', // #botdev
                         'C1BBWJ7PF' // #bottest
];

// when socket opens, notify channel
function onOpen (soc, channelIDs) {

    mb.initialize(soc);

    var stores = fs.readdirSync('./datastores');

    stores.forEach(function(store) {
        console.log(store);
        var alias = stores[store.split('.js')[0]]
        alias = require('./datastores/' + store.toString());
        alias.fetch();
    });

    stores.forEach(function(store) {
        console.log(store);
        var alias = stores[store.split('.js')[0]]
        alias = require('./datastores/' + store.toString());

        if (alias !== 'gitteams') {
            alias.fetch();
        }

    });

    channelIDs.forEach(function(id) {
        if (_.includes(whitelistChannels, id)) {
            mb.send({
                "id": 1,
                "type": "message",
                "channel": id,
                "text": "WhoopBot " + config.env.VERSION +
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
                mb.send(res);
            }, ev.text, ev.user);
        }
    }
}


function lunchTrain () {
    if (mb.exists()) {
        mb.send({
            "id": 9,
            "type": "message",
            "channel": "C1DNMQSCD",
            "text": "Lunch?\n:one: Now!\n:two: 10-20 minutes\n:three: Not " +
            "in the foreseeable future"
        });
    }
}

// when HTTPS request finished, initialize WebSocket and handle events
function initializeWebSocket (data) {

    console.log('INITIALIZING WS');
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
        console.log('disconnected (received close)');
        memberChannels.forEach(function (channelID) {
            mb.send({
                "id": 1,
                "type": "message",
                "channel": channelID,
                "text": "WhoopBot " + config.env.VERSION +
                    " disconnected from WebSocket."
            });
            mb.destroy();
        });
    });

    process.once('SIGTERM', function () {
        console.log('disconnected (sigterm)');
        memberChannels.forEach(function (channelID) {
            mb.send({
                "id": 1,
                "type": "message",
                "channel": channelID,
                "text": "WhoopBot " + config.env.VERSION +
                    " disconnected, received SIGTERM."
            });
            mb.destroy();
        });
    });
}


module.exports = {
    initializeWebSocket: initializeWebSocket,
    lunchTrain: lunchTrain
};
