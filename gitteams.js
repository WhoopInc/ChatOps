require('dotenv').config({silent: true});

const ds = require('./datastore.js');
const core = require('./core.js');

var githubStore = new ds.DataStore();
setInterval(fetchGithub, 24 * 60 * 60 * 1000);

function fetchGithub () {

    // get all whoop teams
    var teamOptions = {
        url: 'api.github.com/orgs/WhoopInc/teams'
    };

    core.paginate(teamOptions, function (teamArray) {
        teamArray.forEach(function(team) {

            // for each team, add team name to store
            githubStore.store([team.id, 'name', team.name]);

            // for each team, get users and add them to store
            var teamUserOptions = {
                url: 'api.github.com/teams/' + team.id + '/members'
            };

            var users = [];

            core.paginate(teamUserOptions, function (userArray) {
                var counter = 0;

                userArray.forEach(function(user) {
                    users.push(user.login);
                    counter++;
                });

                if (counter === userArray.length) {
                    githubStore.store([team.id, 'members', users]);
                }
            });

            // for each team, get repos and add them to store
            var teamRepoOptions = {
                url: 'api.github.com/teams/' + team.id + '/repos'
            };

            var repos = [];

            core.paginate(teamRepoOptions, function (repoArray) {
                var counter = 0;

                repoArray.forEach(function(repo) {
                    repos.push({
                        "name": repo.name,
                        "html_url": repo.html_url
                    });

                    counter++;
                });

                if (counter === repoArray.length) {
                    githubStore.store([team.id, 'repos', repos]);
                }
            });

        });


    });

    console.log(githubStore);
}

function getTeamRepos (teamID) {
    return githubStore.get([teamID, 'repos']);
}

function getTeamMembers (teamID) {
    return githubStore.get([teamID, 'members']);
}

function getTeamsForUser (username) {
    var teams = [];

    var store = githubStore.getAll();

    for (team in store) {
        if (store[team].members.includes(username)) {
            teams.push(team);
        }
    }

    return teams;

}

module.exports = {
    fetchGithub: fetchGithub,
    getTeamsForUser: getTeamsForUser,
    getTeamRepos: getTeamRepos,
    getTeamMembers: getTeamMembers
};
