var httprequest = require('./httprequest.js');


// get repositories, output string of repo data
function getRepos () {
    var options = {
        url: 'api.github.com/orgs/WhoopInc/repos',
    };

    httprequest.makeRequest(options, function (repoArray) {
        var outputInfo = [];
        console.log('REPOARRAY: ', repoArray);
        repoArray.forEach(function (item) {
            item = item.name;
            var urlOption = {url: 'api.github.com/repos/WhoopInc/' + item + '/pulls'};

            httprequest.makeRequest(urlOption, function (prArray) {
                var prequests = prArray.length;
                outputInfo.push({repo: item, prs: prequests});
                console.log('OUTPUT INFO: ', outputInfo);
            });
        });

        console.log('FINAL OUTPUT INFO: ', outputInfo);
        return outputInfo;
    });
}

module.exports = {
    getRepos: getRepos
}

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
