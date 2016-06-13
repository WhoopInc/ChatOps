const _ = require('lodash');
const fs = require('fs');

var excludeFromPlugins = ['index.js', 'help.js'];
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

function handlePlugins (channel, callback, text, user) {
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
