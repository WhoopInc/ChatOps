const _ = require('lodash');
require('dotenv').config({silent: true});

const core = require('../core.js');
const ds = require('../datastore.js');
const mb = require('../messagebroker.js');
const users = require('../users.js');

var datadogStore = new ds.DataStore();

setInterval(updateAlerts, 600000);

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

        updateAlerts(function (datadogStore) {
            var dataStore = datadogStore.getAll();

            for (monitorID in dataStore) {
                // accumulate monitor details in outputMessage
                outputMessage += dataStore[monitorID]["name"] + ' has state ' +
                dataStore[monitorID]["state"] + ' (ID: ' + monitorID + '). ';

                if (dataStore[monitorID]["claimed"] && dataStore[monitorID]["claimed"] !== "none") {
                    var alias = users.getSingleUserName(dataStore[monitorID]["claimed"])
                    if (alias) {
                        outputMessage += 'Claimed by ' + users.getSingleUserName(dataStore[monitorID]["claimed"]) + '.\n';
                    }
                    else {
                        outputMessage += 'Claimed by ' + dataStore[monitorID]["claimed"] + '.\n';
                    }

                }
                else {
                    outputMessage += 'Unclaimed.\n'
                }

                outputMessage += dataStore[monitorID]["url"] + '\n';
            };

            callback({
                "id": 6,
                "type": "message",
                "channel": channel,
                "text": outputMessage
            });
        });
    }

    // check for, handle "unclaim" command
    else if (isClaim.includes('unclaim')) {
        // get ID of monitor
        var monitorID = isClaim.split('claim')[1].trim();

        if (datadogStore.get([monitorID])) {
            datadogStore.store([monitorID, 'claimed', 'none']);
        }
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
            if (datadogStore.get([claimType])) {
                datadogStore.store([claimType, "claimed", user]);
            }
        }
    }
}

function updateAlerts (optionalCB) {
    var options = {
        'url': 'app.datadoghq.com/api/v1/monitor?api_key=' +
        process.env.DATADOG_API_KEY + '&application_key=' +
        process.env.DATADOG_APP_KEY
    };

    core.makeRequest (options, function (data, code) {

        data.forEach(function(monitor) {

            if (monitor.overall_state && monitor.overall_state !== 'OK') {

                datadogStore.store([monitor.id, 'state', monitor.overall_state.toString()]);
                datadogStore.store([monitor.id, 'name', monitor.name.toString()]);
                datadogStore.store([monitor.id, 'url', 'https://app.datadoghq.com/monitors#' + monitor.id]);

                if (!datadogStore.get([monitor.id])) {
                    datadogStore.store([monitor.id, 'claimed', 'none']);
                }

            }
        });

        var store = datadogStore.getAll();
        for (monitorID in store) {
            if (store[monitorID]["state"] === 'OK') {
                datadogStore.remove([monitorID]);
            }
        }

        if (optionalCB) {
            optionalCB(datadogStore);
        }
    });
}

function helpDescription () {
    return '_DATADOG_\nSend *get datadog* to see Datadog alerts, warnings, and claimed status.\n' +
    'Send *datadog claim [ID]* to claim a monitor or datadog unclaim [ID] to ' +
    'unclaim a monitor. Use *get datadog* to see monitor IDs.'
}

module.exports = {
    isCallable: isCallable,
    executePlugin: executePlugin,
    helpDescription: helpDescription
};


