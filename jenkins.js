var core = require('./core.js');
const _ = require('lodash');

/* * Given a job object, makes a build request to object's URL and
   * communicates to user on given channel.
   */
function buildJenkinsJob (requestedJobObject, channel, callback) {

    var sentMessage = false;

    var jobOptions = {

        url: encodeURI(requestedJobObject.url.split('//').pop()) + 'build',
        method: 'POST'
    };

    core.makeRequest(jobOptions, function () {}, function (response) {
        if (response.statusCode === 201) {
            if (!sentMessage) {
                callback({
                    "id": 4,
                    "type": "message",
                    "channel": channel,
                    "text": requestedJobObject.name + ' successfully queued.'
                });
                sentMessage = true;
            }
        }
    });
}

/* * Retrieves list of all jenkins jobs, prepares to manipulate list.
   * In future iterations this function should be replaced by a cache
   * or other within-app memory.
   */
function getFullJobList (callback) {
    var options = {
        url: 'jenkins.whoop.com/api/json',
        method: 'POST'
    };

    core.makeRequest(options, function (dataObject) {
        callback(dataObject.jobs);
    })
}


/* * Given a keyword, finds matching entries in collection.
   * While iterating through collection, performs optional additional
   * functions. This eliminates need for multiple traversals of
   * collections.
   */
function findMatches (keyword, collection, additionalFun) {
    var regexp = new RegExp(keyword, 'i');
    var foundMatches = [];
    var counter = 0;

    collection.forEach(function (item) {
        if (regexp !== '' && regexp.test(item.name)) {
            foundMatches.push(item);
        }

        if (additionalFun) {
            additionalFun(item);
        }

        counter++;
    });

    if (counter === collection.length) {
        return foundMatches
    }
}


/* * Given text given by the user, determines which operation to run.
   * Commands with the "list" keyword list Jenkins jobs. Commands without
   * keywords attempt to execute a jenkins job.
   */
function processCommand (text, channel, callback) {

    var outputMessage = '';
    var regexp;

    // get list of all jobs for reference
    getFullJobList(function (jobArray) {

        // determine if list keyword present
        var list = /(.*)list$/i.exec(text);

        // LIST KEYWORD: bot should list all jobs [containing keyword]
        if (list) {

            // get prefix of list
            listQuery = list[1].trim();

            // if listQuery, acculumate matches to prefix.
            var keywordMatches = findMatches(listQuery, jobArray, function (item) {
                // if no listQuery, accumulate all entries.
                if (listQuery === '') {
                    outputMessage += item.name + '\n';
                }
            });

            if (keywordMatches !== []) {
                keywordMatches.forEach(function (match) {
                    outputMessage += match.name + '\n';
                });

                callback({
                    "id": 4,
                    "type": "message",
                    "channel": channel,
                    "text": '*Jenkins Jobs:*\n' + outputMessage
                });
            }
            else {
                callback({
                    "id": 4,
                    "type": "message",
                    "channel": channel,
                    "text": 'I could not find any jobs matching ' + listQuery +
                        '. Type "jenkins list" to see all jobs.'
                });
            }




        }

        // NO LIST KEYWORD: attempt to execute a job.
        else {

            regexp = new RegExp('^' + text + '$', 'i');

            // look for case-insensitive strict match
            var exactMatch = _.find(jobArray, function(job) {
                return regexp.test(job.name);
            });

            if (exactMatch) {
                buildJenkinsJob(exactMatch, channel, callback);
            }

            // if no strict match, look for fuzzy match
            else {
                var inputs = text.split(" ");

                // fold over matches for each keyword until found entries
                // that match all keywords
                var finalMatches = _.reduce(inputs, function (acc, input) {
                    return findMatches(input, acc);
                }, jobArray);

                // if only one match found at end, execute the job
                if (finalMatches.length === 1) {
                    buildJenkinsJob(finalMatches[0], channel, callback);
                }
                // if more than one final match, ask user if they
                // meant one of the matches
                else if (finalMatches.length > 1) {
                    finalMatches.forEach(function (match) {
                        outputMessage += match.name + '\n';
                    });

                    callback({
                        "id": 4,
                        "type": "message",
                        "channel": channel,
                        "text": '*Did you mean*\n' + outputMessage
                    });
                }
                // if no matches, notify user
                else {
                    callback({
                        "id": 4,
                        "type": "message",
                        "channel": channel,
                        "text": 'I could not find that job. Type "jenkins list" to see all jobs.'
                    });
                }
            }
        }
    });
}

module.exports = {
    buildJenkinsJob: buildJenkinsJob,
    processCommand: processCommand,
    findMatches: findMatches
};
