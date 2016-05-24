const WebSocket = require('ws');
require('dotenv').load();
var exp = require('./index.js');

var two = 2;

module.exports = {
    onOpen: onOpen,
    onMessage: onMessage
};