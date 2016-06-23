require('dotenv').config({silent: true});

const ds = require('../datastore.js');
const core = require('../core.js');

var userStore = new ds.DataStore();
setInterval(fetch, Number.parseInt(process.env.REFRESH_DATASTORE_INTERVAL_HOURS) * 60 * 60 * 1000);

function fetch () {
    var options = {
        url: 'slack.com/api/users.list?token=' + process.env.SLACK_API_TOKEN
    };

    core.makeRequest(options, function(data) {
        var members = data.members;

        members.forEach(function(member) {
            userStore.store([member.id, 'name', member.profile.real_name]);
        });
    });

    var openDMOptions = {
        url: 'slack.com/api/users.list?token=' + process.env.SLACK_API_TOKEN
    };
}

function getContents () {
    userStore.getAll();
}

function getSingleUserName (id) {
    return userStore.get([id, 'name']);
}

module.exports = {
    fetch: fetch,
    getContents: getContents,
    getSingleUserName: getSingleUserName
};
