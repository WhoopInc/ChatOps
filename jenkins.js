var core = require('./core.js');
const _ = require('lodash');

function buildJenkinsJob (requestedJobObject, channel, callback) {

    var jobOptions = {

        url: encodeURI(requestedJobObject.url.split('//').pop()) + 'build',
        method: 'POST'
    };

    core.makeRequest(jobOptions, function () {}, function (response) {
        if (response.statusCode === 201) {
            callback({
                "id": 4,
                "type": "message",
                "channel": channel,
                "text": requestedJobObject.name + ' successfully built.'
            });
        }
    });
}


function getFullJobList (callback) {
    var options = {
        url: 'jenkins.whoop.com/api/json',
        method: 'POST'
    };

    core.makeRequest(options, function (dataObject) {
        callback(dataObject.jobs);
    })
}


function processCommand (text, channel, callback) {

    var outputMessage = '';
    var regexp;

    // get list of all jobs for reference
    getFullJobList(function (jobArray) {

        // LIST KEYWORD
        // "job [keyword] list" should list all jobs (containing keyword)
        var list = /(.*)list$/i.exec(text);

        if (list) {
            var listCounter = 0;



            listQuery = list[1].trim();

            jobArray.forEach(function (job) {
                // include all job names if no listQuery
                if (listQuery === '') {
                    outputMessage += job.name + '\n'
                }
                // if listQuery, include only matching jobs
                else {
                    regexp = new RegExp(listQuery, 'i');

                    if (regexp.test(job.name)) {
                        outputMessage += job.name + '\n';
                    }
                }

                listCounter++;
            });

            // output a message with all jobs listed, one per line. heading: Jenkins Jobs:
            if (listCounter === jobArray.length) {
                callback({
                    "id": 4,
                    "type": "message",
                    "channel": channel,
                    "text": '*Jenkins Jobs:*\n' + outputMessage
                });
            }

        }
        else {
            // if not list, check for strict/fuzzy matches to job names

            regexp = new RegExp(text, 'i');

            // traverse jobArray until strict match found (case-insensitive)
            var exactMatch = _.find(jobArray, function(job) {
                return regexp.test(job.name);
            });

            if (exactMatch) {
                buildJenkinsJob(exactMatch, channel, callback);
            }

            // if no strict match, look for fuzzy match
            // TODO

        }

    });



}

module.exports = {
    buildJenkinsJob: buildJenkinsJob,
    processCommand: processCommand
};
