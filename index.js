require('dotenv').config({silent: true});   // loads variables from .env to ENV
var app = require('./app.js');
var core = require('./core.js');


// contents of HTTPS server request
var options = {
    url: 'slack.com/api/rtm.start?token=' + process.env.SLACK_API_TOKEN
};

core.makeRequest(options, app.initializeWebSocket);


module.exports = {
    options: options
};
