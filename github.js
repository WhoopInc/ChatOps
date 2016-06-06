var core = require('./core.js');


// get repositories, output string of repo data
// function getRepos (channel, callback) {

//     var finalMessage = '';

//     //var outputMessage = [];
//     var options = {
//         url: 'api.github.com/orgs/WhoopInc/repos'
//     };

//     core.paginate(options, function (repoArray) {

//         // traverse array of repos
//         repoArray.forEach(function (repo) {

//             //console.log('REPO INFO: ', JSON.stringify(repo));

//             var urlOption = {url: 'api.github.com/repos/WhoopInc/' +
//             repo.name + '/pulls'};

//             // get the pull requests for the repository
//             core.makeRequest(urlOption, function (prArray) {

//                 // for each pull request per repository, delete if not open
//                 prArray.forEach(function (pullrequest) {
//                     if (pullrequest.state !== "open") {
//                         prArray.pop(pullrequest);
//                     }
//                 });

//                 // get number of pull requests in repo
//                 var prequests = prArray.length;

//                 // only send messages for repos with 1+ pull requests
//                 if (prequests !== 0) {
//                     // callback({
//                     //     "id": 3,
//                     //     "type": "message",
//                     //     "channel": channel,
//                     //     "text": prequests + " open pull request(s) in " +
//                     //     repo.name + ' ' + repo.html_url
//                     // });

//                     finalMessage += prequests.toString() + ' open pull request(s) in ' +
//                     repo.name + ' ' + repo.html_url + '\n';

//                     // attachments.push({
//                     //         "fallback": prequests + " open pull request(s) in " + repo.name,
//                     //         "color": "#36a64f",
//                     //         "pretext": prequests + " open pull request(s) in " + repo.name,
//                     //         "title": repo.name,
//                     //         "title_link": repo.html_url
//                     // });
//                 }
//             });
//         });

//         if (finalMessage !== '') {
//             callback({
//                 "id": 3,
//                 "type": "message",
//                 "channel": channel,
//                 "text": finalMessage
//             });

//             finalMessage = ''
//         }


//     });
// }

function getRepos (channel, callback) {

    var finalMessage = '';

    //var outputMessage = [];
    var options = {
        url: 'api.github.com/orgs/WhoopInc/repos'
    };

    core.paginate(options, function handleArray (repoArray) {

        // traverse array of repos
        repoArray.forEach(function (repo) {
            doRepo(repo, callback, channel );
        });

        // console.log('FINAL FINAL MESSAGE: ', finalMessage);

        // if (finalMessage !== '') {
        //     callback({
        //         "id": 3,
        //         "type": "message",
        //         "channel": channel,
        //         "text": finalMessage
        //     });

        //     finalMessage = ''
        // }


    });
}

function doRepo (repo, callback, channel) {

            var urlOption = {url: 'api.github.com/repos/WhoopInc/' +
            repo.name + '/pulls'};

            // get the pull requests for the repository
            core.makeRequest(urlOption, function (prArray) {
                doPR(prArray, callback, channel, repo);
            });
}

function doPR (prArray, callback, channel, repo) {

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
                    callback({
                        "id": 3,
                        "type": "message",
                        "channel": channel,
                        "text": prequests + " open pull request(s) in " +
                        repo.name + ' ' + repo.html_url
                    });

                    // finalMessage += prequests.toString() + ' open pull request(s) in ' +
                    // repo.name + ' ' + repo.html_url + '\n';

                    // attachments.push({
                    //         "fallback": prequests + " open pull request(s) in " + repo.name,
                    //         "color": "#36a64f",
                    //         "pretext": prequests + " open pull request(s) in " + repo.name,
                    //         "title": repo.name,
                    //         "title_link": repo.html_url
                    // });
                }
}

module.exports = {
    getRepos: getRepos
};
