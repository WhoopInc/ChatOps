const CronJob = require('cron').CronJob;
const config = require('./configenv.js');
const app = require('./app.js');
const core = require('./core.js');
const mb = require('./messagebroker.js');

// contents of HTTPS server request
var options = {
    url: 'slack.com/api/rtm.start?token=' + config.env.SLACK_API_TOKEN
};

core.makeRequest(options, app.initializeWebSocket);

var job = new CronJob('00 15 12 * * 1-4', function () {
    app.lunchTrain();
}, null, true, 'America/New_York');

module.exports = {
    options: options
};
