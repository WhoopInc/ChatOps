const ds = require('../datastore.js');
const core = require('../core.js');
const config = require('../configenv.js');

var channelStore = new ds.DataStore();
setInterval(fetch, config.env.REFRESH_DATASTORE_INTERVAL_MILLISECONDS);

function fetch () {
    var options = {
        url: 'slack.com/api/channels.list?token=' + config.env.SLACK_API_TOKEN
    };

    core.makeRequest(options, function(data) {
        var channels = data.channels;

        channels.forEach(function(channel) {
            channelStore.store([channel.id, 'name', channel.name]);
        });
    });

    var openDMOptions = {
        url: 'slack.com/api/users.list?token=' + config.env.SLACK_API_TOKEN
    };
}

function getSingleChannelName (id) {
    return channelStore.get([id, 'name']);
}

function getAllChannels () {
    return channelStore;
}

module.exports = {
    fetch: fetch,
    getSingleChannelName: getSingleChannelName,
    getAllChannels, getAllChannels
};
