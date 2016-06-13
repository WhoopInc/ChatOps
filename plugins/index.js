const github = require('./github.js');
const httpcat = require('./httpcat.js');
const jenkins = require('./jenkins.js');

const _ = require('lodash');

var whitelistChannels = [];

function handlePlugins (channel, text, user, callback) {
    if (!_.includes(whitelistChannels, channel)) {

        if (text === "get github") {
            github.getRepos(channel, callback)
        }

        if (text.includes("jenkins")) {
            jenkins.processCommand(text.split("jenkins ").pop().trim(),
                channel, callback);
        }

        // prepare to handle http messages
        var cat = httpcat.handleHTTP(text, channel, callback);

    }
}

module.exports = {
    handlePlugins: handlePlugins
};
