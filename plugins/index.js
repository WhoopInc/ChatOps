const _ = require('lodash');
const fs = require('fs');
const core = require('../core.js');

var excludeFromPlugins = ['index.js'];
var plugins = {};

// find and require all plugins
var pluginsFound = fs.readdirSync('./plugins');

pluginsFound.forEach(function (plugin) {
    if (!_.includes(excludeFromPlugins, plugin)) {
        plugins[plugin.split('.js')[0]] = require('./' + plugin.toString());
    }
});

var whitelistChannels = ['C1DNMQSCD', // #botdev
                         'C1BBWJ7PF' // #bottest
];

// add im channels

var options = {
    url: 'slack.com/api/im.list?token=' + process.env.SLACK_API_TOKEN
};

core.makeRequest(options, function(data) {
    var imChannels = data.ims;
    imChannels.forEach(function(channel) {
        if (channel.user !== 'USLACKBOT') {
            whitelistChannels.push(channel.id);
        }

    });
});

function handlePlugins (channel, callback, text, user) {

    // for each whitelisted plugin, check if applicable. if true, execute
    if (_.includes(whitelistChannels, channel)) {
        for (key in plugins) {
            if (plugins[key].isCallable(text)) {
                plugins[key].executePlugin(channel, callback, text, user);
            }
        }
    }
}

module.exports = {
    handlePlugins: handlePlugins
};
