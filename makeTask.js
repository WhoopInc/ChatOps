const Mustache = require('mustache');
const fs = require('fs');
const _ = require('lodash');

const config = require('./configenv.js');

var options = {
    encoding: 'utf8'
}

var template = fs.readFileSync('./ecs-task-template.mustache', options);

var view = {};

view.env = _.chain(process.env)
.pick(config.env, ['SLACK_API_TOKEN', 'GITHUB_API_TOKEN', 'GITHUB_USERNAME',
    'DATADOG_API_KEY', 'DATADOG_APP_KEY'])
.reduce(function (acc, value, key) {
    (acc || (acc = [])).push({ "name": key, "value": value, "comma": true });
    return acc;
}, [])
.value();

var version = _.chain(process.env)
.pick(config.env, ['VERSION'])
.reduce(function (acc, value, key) {
    acc.push({ "name": key, "value": value, "comma": false });
    return acc;
}, view.env)
.value();

var output = Mustache.render(template, view);
console.log(output);

