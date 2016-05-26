var WebSocket = require('ws');
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

    sendMessage(soc, msg);
}

function ignoreEvent (event) {
    if (event.username && event.username === "slackbot") {
        return true;
    }
    if (!(event.type === "message" && event.user !== "U1ASA6B88" && !event.hidden)) {
        return true;
    }
    return false;
}


// process incoming messages, return object with text, channel, user id
function onEvent (event, soc) {
    console.log(event);

    var ev = JSON.parse(event);
    var output;

    // if event is a message NOT from self, package relevant info

    if (!ignoreEvent(ev)){
        output = {
            type: ev.type,
            user: ev.user,
            channel: ev.channel,
            text: ev.text
        };

        sendMessage(soc, handleHTTP (output));
    }
    
    //var text = ev.text;
    
}



function handleHTTP (data) {
    console.log('start http, ', data);
    var codes = ['100', '101', /* '102', */
                '200', '201', '202', /* 203, */ '204', '205', '206', '207', /* '208', */ '226',
                '300', '301', '302', '303', '304', '305', /* '306', */ '307', /* '308', */
                '400', '401', '402', '403', '404', '405', '406', /* '407', */ '408', '409',
                '410', '411', '412', '413', '414', '415', '416', '417', '418',
                /* '421', */ '422', '423', '424', '425', '426', /* '428', */ '429',
                '431', '444', '450', '451', /* '499', */
                '500', /* '501', */ '502', '503', /* '504', '505', */ '506', '507', '508', '509', 
                /* '510', '511',  */ '599'];

    var contextClues = ['what', 'what\'s', '?', 'mean'];


    var foundCodes = [];

    codes.forEach(function (item) {
        if (data.text.includes(item)) {
            foundCodes.push(item);
        }
    });

    for (var i = 0; i < contextClues.length; i++) {
        if (data.text.includes(contextClues[i]) && foundCodes.length !== 0) {
            var outgoing = {
                "id": 2,
                "type": "message",
                "channel": data.channel,
                "text": "https://http.cat/" + foundCodes[0]
            }
            console.log('outgoing: ', outgoing);
            return outgoing;
            // break;
        }
    };
}

function sendMessage(soc, data) {
    if (soc.readyState === WebSocket.OPEN && data) {
        soc.send(JSON.stringify(data));
        console.log('message sent');
    }
}

// function genId () {

// }


// when HTTPS request finished, initialize WebSocket and handle events
function initializeWebSocket(data) {
    //console.log('running init');
    //console.log(data);
    //console.log('ran init');
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
        onEvent(event, socket);
    });

}

module.exports = {
    initializeWebSocket: initializeWebSocket
};

