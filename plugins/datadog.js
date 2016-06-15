const _ = require('lodash');
require('dotenv').config({silent: true});

var core = require('../core.js');
const ds = require('../datastore.js');

function isCallable (text) {
    return text.includes('datadog');
}

function executePlugin (channel, callback, text, user) {
    // handle "get datadog" command
    var isGet = text.split("datadog")[0].trim();
    var isClaim = text.split("datadog")[1].trim();
    var outputMessage = '';

    // if text is "get datadog", get all monitor details using API
    if (isGet === "get") {
        var groupStates = 'alert,warn';

        var options = {
            'url': 'app.datadoghq.com/api/v1/monitor?api_key=' +
            process.env.DATADOG_API_KEY + '&application_key=' +
            process.env.DATADOG_APP_KEY //+ '&group_states=' + groupStates
        };

        core.makeRequest (options, function (data, code) {
            data.forEach(function(monitor) {
                // accumulate monitor details in outputMessage
                if (monitor.overall_state && monitor.overall_state !== 'OK') {
                    outputMessage += monitor.name + ' has state ' +
                monitor.overall_state + ' (ID: ' + monitor.id + ')\n';
                }
            });

            callback({
                "id": 6,
                "type": "message",
                "channel": channel,
                "text": outputMessage
            });
        });
    }

    // if not "get datadog", check for "datadog claim" command
    else if (isClaim.includes('claim')) {
        // check for last or ID
        var claimType = isClaim.split('claim')[1].trim();

        // handle "claim last"
        if (claimType === 'last') {
            // get recent history to determine last monitor
            var options = {
                'url': 'slack.com/api/channels.history?token=' +
                process.env.SLACK_API_TOKEN + '&channel=' + channel +
                '&count=' + 1
            };

            core.makeRequest(options, function (data) {
                var linkWithID = data.messages[0].attachments[last].title_link;

                if (linkWithID) {
                    // parse link to get id
                    var monitorExp = new RegExp ('\/monitors#(\d+)');

                    var parsedID = monitorExp.exec(linkWithID);

                    if (parsedID) {
                        parsedID = parsedID[1];

                        // try to get monitor details by ID
                        var monitorOptions = {
                            'url': 'app.datadoghq.com/api/v1/monitor/' +
                            parsedID + '?api_key=' + process.env.DATADOG_API_KEY
                            + '&application_key=' + process.env.DATADOG_APP_KEY
                        }

                        core.makeRequest(monitorOptions, function (monitorData) {
                            if (monitorData.overall_state && monitorData.overall_state !== 'OK') {
                                // add entry to datastore
                                ds.store(parsedID, user);

                                // mute monitor
                                var muteOptions = {
                                    'url': 'app.datadoghq.com/api/v1/monitor/' +
                                    parsedID + '/mute?api_key=' + process.env.DATADOG_API_KEY
                                    + '&application_key=' + process.env.DATADOG_APP_KEY
                                };

                                core.makeRequest(muteOptions, function () {});
                            }
                            else {
                                callback({
                                    "id": 6,
                                    "type": "message",
                                    "channel": channel,
                                    "text": 'The last monitor is not claimable'
                                    + '. Use *get datadog* to get claimable ' +
                                    'monitors by ID and then use *datadog ' +
                                    'claim [ID]* to claim your desired monitor'
                                });
                            }
                        });
                    }

                    // if failed to parse monitor ID, send error message.
                    else {
                        // error message
                    }

                }


                else {
                    console.log('GETTING LINKWITHID FAILED');
                }
            });
        }

        // handle "claim ID"
        else {

        }
    }
}

module.exports = {
    isCallable: isCallable,
    executePlugin: executePlugin
};


