const _ = require('lodash');
const fs = require('fs');
const core = require('../core');

var excludeFromPlugins = ['index.js', 'help.js'];
var plugins = {};

// find and require all plugins
var pluginsFound = fs.readdirSync('./plugins');

pluginsFound.forEach(function (plugin) {
    if (!_.includes(excludeFromPlugins, plugin)) {
        plugins[plugin.split('.js')[0]] = require('./' + plugin.toString());
    }
});


function isCallable (text) {
    return /^chatops.*help/i.test(text);
}

function executePlugin (channel, callback, text, user) {
    var query = /^chatops(.*)help/i.exec(text);
    if (query) {
        var helpQuery = query[1];

        var outputMessage = '';
        var outputChannel;

        // get or open channel to DM user
        var options = {
            url: 'slack.com/api/im.open?token=' + process.env.SLACK_API_TOKEN +
            '&user=' + user
        }

        core.makeRequest(options, function (data, code) {
            console.log(data, code);
            if (data.ok) {
                outputChannel = data.channel.id;

                console.log('TRIMMED HELP QUERY: ', helpQuery.trim());

                if (helpQuery.trim() === '') {
                    for (key in plugins) {
                        outputMessage += plugins[key].helpDescription() + '\n';
                    }
                }
                else {
                    for (key in plugins) {
                        var keyterm = new RegExp(key, 'i');

                        console.log(keyterm);

                        if (keyterm.test(helpQuery)) {
                            outputMessage += plugins[key].helpDescription() +
                            '\n';
                        }
                    }
                }

                if (outputMessage !== '' && outputChannel) {
                    callback({
                        "id": 5,
                        "type": "message",
                        "channel": outputChannel,
                        "text": outputMessage
                    });
                }

            }
            else {
                console.log('FAILED W CODE ', code);
            }

        });


    }
}

module.exports = {
    isCallable: isCallable,
    executePlugin: executePlugin
};
