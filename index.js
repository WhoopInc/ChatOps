console.log('PRE-CONFIG');

const config = require('./configenv.js');
const app = require('./app.js');
const core = require('./core.js');


// contents of HTTPS server request
var options = {
    url: 'slack.com/api/rtm.start?token=' + config.env.SLACK_API_TOKEN
};

core.makeRequest(options, app.initializeWebSocket);


module.exports = {
    options: options
};
