const _ = require('lodash');
const fs = require('fs');

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
                         'C1BBWJ7PF', // #bottest
                         'D1F7NU1C1' // @janetchen DM
];

function handlePlugins (channel, callback, text, user) {

    // for each whitelisted plugin, check if applicable. if true, execute
    if (_.includes(whitelistChannels, channel)) {
        for (key in plugins) {
            if (plugins[key].isCallable(text)) {
                plugins[key].executePlugin(channel, callback, text, user);
                break;
            }
        }
    }
}

module.exports = {
    handlePlugins: handlePlugins
};
