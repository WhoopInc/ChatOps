const _ = require('lodash');

const core = require('../core.js');
const gitTeams = require('../datastores/gitteams.js');

function isCallable (text) {
    return /get github/i.test(text);
}


function helpDescription () {
    return '_GITHUB_\nSend *get github [your_github_username]* to ' +
    'see open pull requests for your teams ' +
    'or *get github [your_github_username]* to see all open ' +
    'pull requests for Whoop.';
}


function countOpenPR (prArray) {

    var prCounter = 0;

    // for each pull request per repository, count if open
    prArray.forEach(function (pullrequest) {
        if (pullrequest.state === "open") {
            prCounter++;
        }
    });

    return prCounter;
}

function getPRfromRepos (repoArray, channel, callback) {

    var outputMessage = '';
    var repoCounter = 0;

    // traverse array of repos
    repoArray.forEach(function (repo) {

        var urlOption = {url: 'api.github.com/repos/WhoopInc/' +
        repo.name + '/pulls'};

        // get the pull requests for the repository
        core.makeRequest(urlOption, function (prArray) {

            // retrieve number of open pull requests
            var prs = countOpenPR(prArray);

            // only prepare message if PRs exist
            if (prs > 0) {
                outputMessage += prs.toString() +
                " open pull request(s) in " + repo.html_url.toString() +
                "\n";
            }

            repoCounter++;

            // when entire repoArray traversed, call callback
            if (repoCounter === repoArray.length) {
                callback({
                    "id": 3,
                    "type": "message",
                    "channel": channel,
                    "text": outputMessage
                });
            }
        });
    });
}


function executePlugin (channel, callback, text, user) {

    var reqType = /^get github(.*)/i.exec(text);

    // no username given, make request to get all repos
    if (reqType[1].trim() === '') {
        core.paginate({url: 'api.github.com/orgs/WhoopInc/repos'},
            function(repoArray) {
                getPRfromRepos(repoArray, channel, callback);
            });
    }

    // username given, get repos from dataStore
    else {
        var username = reqType[1].trim();

        var teams = gitTeams.getTeamsForUser(username);

        var repoAcc = [];

        teams.forEach(function (team) {
            repoAcc.push(gitTeams.getTeamRepos(team));
        });

        getPRfromRepos(_.flatten(repoAcc), channel, callback);

    }
}



module.exports = {
    isCallable: isCallable,
    executePlugin: executePlugin,
    countOpenPR: countOpenPR,
    helpDescription: helpDescription
};



