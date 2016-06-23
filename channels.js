require('dotenv').config({silent: true});

const ds = require('./datastore.js');
const core = require('./core.js');

var channelStore = new ds.DataStore();
setInterval(fetchChannels, 24 * 60 * 60 * 1000);


function fetchChannels () {
    var options = {
        url: 'slack.com/api/channels.list?token=' + process.env.SLACK_API_TOKEN
    };

    core.makeRequest(options, function(data) {
        var channels = data.channels;

        channels.forEach(function(channel) {
            channelStore.store([channel.id, 'name', channel.name]);
        });
    });

    var openDMOptions = {
        url: 'slack.com/api/users.list?token=' + process.env.SLACK_API_TOKEN
    };
}

function getSingleChannelName (id) {
    return channelStore.get([id, 'name']);
}

function getAllChannels () {
    return channelStore;
}

module.exports = {
    fetchChannels: fetchChannels,
    getSingleChannelName: getSingleChannelName,
    getAllChannels, getAllChannels
};