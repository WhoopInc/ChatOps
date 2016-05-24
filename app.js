const WebSocket = require('ws');
require('dotenv').load();
var exp = require('./index.js');



module.exports = {
    onOpen: onOpen,
    onMessage: onMessage
};