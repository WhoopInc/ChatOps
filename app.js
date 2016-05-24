var RtmClient = require('@slack/client').RtmClient;

var token = process.env.SLACK_API_TOKEN || '';

var rtm = new RtmClient(token, {logLevel: 'debug'});
rtm.start();

var CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;


var slackClient = new SlackClient("xoxb-45145213361-x918zkl1sGFNlbIBaS5h2FA8")

var bot;

slackClient.on('loggedIn',function(user,team) {
    bot = user;
    consold.log("Logged in as " + user.name + " of " +
    team.name + ", but not yet connected");
});

slackClient.on('open', function() {
    console.log('Connected');
});

slackClient.on('message', function(message) {
    if (message.user == bot.id) return;

    var channel = slackClient.getChannelGroupOrDMByID(message.channel);
    channel.send('Hello world!');
});