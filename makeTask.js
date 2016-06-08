const Mustache = require('mustache');
const fs = require('fs');
const _ = require('lodash');
require('dotenv').config({silent: true});

var options = {
    encoding: 'utf8'
}

var template = fs.readFileSync('./ecs-task-template.mustache', options);

var view = {};

view.env = _.chain(process.env)
.pick(process.env, ['SLACK_API_TOKEN', 'GITHUB_API_TOKEN', 'GITHUB_USERNAME', 'VERSION'])
.reduce(function (acc, value, key) {
    (acc || (acc = [])).push({ "name": key, "value": value });
    return acc;
}, [])
.value();

var output = Mustache.render(template, view);
console.log(output);

