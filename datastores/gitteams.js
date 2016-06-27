const config = require('../configenv.js');
const ds = require('../datastore.js');
const core = require('../core.js');

var githubStore = new ds.DataStore();
setInterval(fetch, config.env.REFRESH_DATASTORE_INTERVAL_MILLISECONDS);

function fetch () {

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

                userArray.forEach(function(user) {
                    users.push(user.login);
                });

                githubStore.store([team.id, 'members', users]);
            });

            // for each team, get repos and add them to store
            var teamRepoOptions = {
                url: 'api.github.com/teams/' + team.id + '/repos'
            };

            var repos = [];

            core.paginate(teamRepoOptions, function (repoArray) {

                repoArray.forEach(function(repo) {
                    repos.push({
                        "name": repo.name,
                        "html_url": repo.html_url
                    });
                });

                githubStore.store([team.id, 'repos', repos]);

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
    fetch: fetch,
    getTeamsForUser: getTeamsForUser,
    getTeamRepos: getTeamRepos,
    getTeamMembers: getTeamMembers
};
