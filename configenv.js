require('dotenv').config({silent: true});

var env = {};

for (term in process.env) {
    env[term] = process.env[term];
}

// essential env vars
if (!env.SLACK_API_TOKEN || !env.GITHUB_API_TOKEN ||
    !env.GITHUB_USERNAME || !env.DATADOG_API_KEY ||
    !env.DATADOG_APP_KEY) {
    process.exit(2);
}

// REFRESH_DATASTORE_INTERVAL_HOURS has simple default
if (!env.REFRESH_DATASTORE_INTERVAL_HOURS) {
    env.REFRESH_DATASTORE_INTERVAL_MILLISECONDS = 24 * 60 * 60 * 1000;
}
// convert REFRESH_DATASTORE_INTERVAL_HOURS from string to int
else {
    var intHours = Number.parseInt(env.REFRESH_DATASTORE_INTERVAL_HOURS);
    env.REFRESH_DATASTORE_INTERVAL_MILLISECONDS = intHours * 60 * 60 * 1000;
}

module.exports = {
    env: env
};

