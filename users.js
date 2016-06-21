require('dotenv').config({silent: true});

const ds = require('./datastore.js');
const core = require('./core.js');

var userStore = new ds.DataStore();
setInterval(getUsers, 10000);
//setInterval(getUsers, 86400000);

function getUsers () {
    var options = {
        url: 'slack.com/api/users.list?token=' + process.env.SLACK_API_TOKEN
    };

    core.makeRequest(options, function(data) {
        var members = data.members;

        members.forEach(function(member) {
            userStore.store([member.id, 'name', member.profile.real_name]);
        });
    });
}

function getContents () {
    userStore.getAll();
}

function getSingleUserName (id) {
    console.log('RES: ', userStore.get([id, 'name']));
    return userStore.get([id, 'name']);
}

module.exports = {
    getUsers: getUsers,
    getContents: getContents,
    getSingleUserName: getSingleUserName
};





