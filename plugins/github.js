var core = require('../core.js');

// get repositories, output string of repo data
function executePlugin (channel, callback) {

    var options = {
        url: 'api.github.com/orgs/WhoopInc/repos'
    };

    core.paginate(options, function (repoArray) {

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
    });
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

function isCallable (text) {
    return text.trim() === 'get github';
}

module.exports = {
    isCallable: isCallable,
    executePlugin: executePlugin,
    countOpenPR: countOpenPR
};
