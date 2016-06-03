var core = require('./core.js');


// get repositories, output string of repo data
function getRepos (channel, callback) {

    //var outputMessage = [];
    var options = {
        url: 'api.github.com/orgs/WhoopInc/repos'
    };

    //console.log('point1');

    core.paginate(options, function (repoArray) {

        // traverse array of repos
        repoArray.forEach(function (repo) {

            var urlOption = {url: 'api.github.com/repos/WhoopInc/' +
            repo.name + '/pulls'};

            // get the pull requests for the repository
            core.makeRequest(urlOption, function (prArray) {

                // for each pull request per repository, delete if not open
                prArray.forEach(function (pullrequest) {
                    if (pullrequest.state !== "open") {
                        prArray.pop(pullrequest);
                    }
                });

                // get number of pull requests in repo
                var prequests = prArray.length;

                // only send messages for repos with 1+ pull requests
                if (prequests !== 0) {
                    //console.log('REPOARRAY[' + index + ']: ', repo);
                    callback({
                        "id": 3,
                        "type": "message",
                        "channel": channel,
                        "text": prequests + " open pull request(s) in " +
                        repo.name
                    });
                }

                //console.log('OUTPUT MESSAGE: ', outputMessage);
            });
        });
    });
}

module.exports = {
    getRepos: getRepos
};
