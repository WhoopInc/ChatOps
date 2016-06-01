var core = require('./core.js');


// get repositories, output string of repo data
function getRepos (soc) {

    var outputMessage = new Array();
    var options = {
        url: 'api.github.com/orgs/WhoopInc/repos'
    };

    core.paginate(options, function (repoArray) {
        // initialize counter
        var traversedRepos = 0;

        // traverse array of repos
        repoArray.forEach(function (repo, index) {

            var urlOption = {url: 'api.github.com/repos/WhoopInc/' +
            repo.name + '/pulls'};

            // get the pull requests for the repository
            core.paginate(urlOption, function (prArray) {

                // increment counter inside asynchronous fun
                traversedRepos++;

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
                    outputMessage.push({
                        "id": 3,
                        "type": "message",
                        "channel": "C1BBWJ7PF",
                        "text": prequests + " open pull request(s) in " + repo.name
                    });
                }

                //console.log('OUTPUT MESSAGE: ', outputMessage);

                if (traversedRepos === repoArray.length) {
                    console.log('TRAVERSEDREPOS: ', traversedRepos, ' TRUE');
                    // if (outputMessage.length === 0) {
                    //     outputMessage.push({
                    //         "id": 3,
                    //         "type": "message",
                    //         "channel": "C1BBWJ7PF",
                    //         "text": "No open pull requests."
                    //     });
                    // }
                    //console.log('FINAL MESSAGE: ', outputMessage);
                    core.sendMessage(soc, outputMessage);
                }

            });
        });
    });

    // core.makeRequest(options, function (repoArray) {
    //     // initialize counter
    //     var traversedRepos = 0;

    //     // traverse array of repos
    //     repoArray.forEach(function (repo, index) {

    //         var urlOption = {url: 'api.github.com/repos/WhoopInc/' +
    //         repo.name + '/pulls'};

    //         // get the pull requests for the repository
    //         core.makeRequest(urlOption, function (prArray) {

    //             // increment counter inside asynchronous fun
    //             traversedRepos++;

    //             // for each pull request per repository, delete if not open
    //             prArray.forEach(function (pullrequest) {
    //                 if (pullrequest.state !== "open") {
    //                     prArray.pop(pullrequest);
    //                 }
    //             });

    //             // get number of pull requests in repo
    //             var prequests = prArray.length;

    //             // only send messages for repos with 1+ pull requests
    //             if (prequests !== 0) {
    //                 //console.log('REPOARRAY[' + index + ']: ', repo);
    //                 outputMessage.push({
    //                     "id": 3,
    //                     "type": "message",
    //                     "channel": "C1BBWJ7PF",
    //                     "text": prequests + " open pull request(s) in " + repo.name
    //                 });
    //             }

    //             //console.log('OUTPUT MESSAGE: ', outputMessage);

    //             if (traversedRepos === repoArray.length) {
    //                 console.log('TRAVERSEDREPOS: ', traversedRepos, ' TRUE');
    //                 // if (outputMessage.length === 0) {
    //                 //     outputMessage.push({
    //                 //         "id": 3,
    //                 //         "type": "message",
    //                 //         "channel": "C1BBWJ7PF",
    //                 //         "text": "No open pull requests."
    //                 //     });
    //                 // }
    //                 //console.log('FINAL MESSAGE: ', outputMessage);
    //                 core.sendMessage(soc, outputMessage);
    //             }

    //         });
    //     });
    // });
}

module.exports = {
    getRepos: getRepos
};

// // given an array of objects, modifies array to be array of option objects.
// function arrayManip (repoArray) {
//     repoArray.foreach(item) {
//         item = {
//             url: 'api.github.com/repos/WhoopInc/' + item.name + '/pulls'
//         };
//     };

// }

// /* * takes string of repo data,
//    * creates array of repositories,
//    * retrieves pull requests from each repo
//    * */

// function getGitHubPR (repoData) {
//     // turn string of repoData into array of repo objects
//     var repoArr = JSON.parse(repoData);

//     // modify array to contain only repo name and # PR's
//     repoArr.foreach(function (item) {
//         item = {
//             Repo: item.name,
//             PRs: 0
//         };
//     });

//     // for each repo, check for PR's, record #.
//     repoArr.foreach(function (item) {
//         var gitPRData = '';
//         var options = {
//             hostname: 'api.github.com',
//             port: 443,
//             path: '/repos/WhoopInc/' + item + '/pulls',
//             method: 'GET',
//             headers: {
//                 'User-Agent': 'WhoopInc'
//               }
//         };
//     })


// }
