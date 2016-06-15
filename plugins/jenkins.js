const _ = require('lodash');
const xml = require('node-xml');
const querystring = require('querystring');

const core = require('../core.js');
const ds = require('../datastore.js');

var jenkinsStore = new ds.DataStore();

/* * Given a job object, makes a build request to object's URL and
   * communicates to user on given channel. Checks for failed builds
   * and notifies user.
   */
function buildJenkinsJob (requestedJobObject, channel, callback, parameters) {

    var urlExp = new RegExp('^https://(jenkins.whoop.com/.*)/$');

    var jobOptions = {
        url: requestedJobObject.url.replace(urlExp, '$1/build'),
        method: 'POST'
    };

    var postData;

    // prepare postData, if parameters passed in
    if (!_.isEmpty(parameters)) {
        var postData = JSON.stringify(parameters);

        jobOptions.headers = {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': postData.length
        };

        jobOptions.url += 'WithParameters';

        // for (key in parameters) {
        //     jobOptions.url += encodeURIComponent(key) + '=' +
        //     encodeURIComponent(parameters[key]) + '&';
        // }

        //postData = querystring.stringify(parameters);
    }

    core.makeRequest(jobOptions, function (data, statusCode) {

        if (statusCode === 201) {
            callback({
                "id": 4,
                "type": "message",
                "channel": channel,
                "text": requestedJobObject.name + ' successfully queued.'
            });
        }

        // parse data for commmon/known/expected errors.
        else if (data && statusCode > 299) {

            // check for missing parameter error
            if (data.includes("Nothing is submitted") && statusCode === 400) {
                callback({
                    "id": 4,
                    "type": "message",
                    "channel": channel,
                    "text": requestedJobObject.name +
                    ' takes parameter(s). Specify parameters with ' +
                    '"-p key=value". Build failed with status code ' +
                    statusCode + '.'
                });
            }
        }

        // uncommon error, notify user
        else {
            callback({
                "id": 4,
                "type": "message",
                "channel": channel,
                "text": 'Request to ' + requestedJobObject.name +
                ' failed with status code ' + statusCode + '.'
            });
        }
    }, function (res) {
        var statusOptions = {
            url: res.headers.location.split('//').pop() + 'api/xml'
        };

        checkJobStatus(statusOptions, callback, channel);
    }, postData);
}

function leftJobInfo (callback, channel, checkUrl) {
    var shortDescription;
    var fullDisplayName;
    var result;
    var duration;

    var outputInfo = {};

    var newOptions = {
        url: checkUrl + 'api/xml'
    };

    core.makeRequest(newOptions, function (data) {

        // catch wanted XML information from data
        var parser = new xml.SaxParser(function(cb) {
            cb.onStartElementNS(function(elem) {
                if (elem === 'result') {
                    cb.onCharacters(function(chars) {
                        result = chars;
                    });
                }

                if (elem === 'fullDisplayName') {
                    cb.onCharacters(function(chars) {
                        fullDisplayName = chars;
                    });
                }

                if (elem === 'shortDescription') {
                    cb.onCharacters(function(chars) {
                        shortDescription = chars;
                    });
                }

                if (elem === 'duration') {
                    cb.onCharacters(function(chars) {
                        duration = chars;
                    });
                }
            });

            cb.onEndElementNS(function(elem) {
                if (elem === 'result') {
                    outputInfo.result = result;
                }

                if (elem === 'fullDisplayName') {
                    outputInfo.fullDisplayName = fullDisplayName;
                }

                if (elem === 'shortDescription') {
                    outputInfo.shortDescription = shortDescription;
                }

                if (elem === 'duration') {
                    outputInfo.duration = duration;
                }
            });
        });

        parser.parseString(data);

        // make appropriate entry in jenkinsStore
        if (outputInfo.fullDisplayName &&
            outputInfo.duration) {

            jenkinsStore.store([outputInfo.fullDisplayName, 'duration',
                outputInfo.duration]);
            jenkinsStore.store([outputInfo.fullDisplayName, 'url', checkUrl]);

            if (outputInfo.result) {
                jenkinsStore.store([outputInfo.fullDisplayName, 'result',
                    outputInfo.result.toString()]);

                if (outputInfo.shortDescription) {
                    callback({
                        "id": 4,
                        "type": "message",
                        "channel": channel,
                        "text": outputInfo.fullDisplayName + ' (' +
                        outputInfo.shortDescription + ') finished with ' +
                        'result ' + outputInfo.result + ' after ' +
                        outputInfo.duration
                    });
                }
            }
            else {
                jenkinsStore.store([outputInfo.fullDisplayName, 'result',
                    'null']);
            }
        }
    }, function (res) {});
}


function checkJobStatus (options, callback, channel, checkUrl) {
    var outputInfo = {};

    // while <waitingItem>
    if (!checkUrl) {
        var name;
        var shortDescription;

        core.makeRequest(options, function (data) {

            var parser = new xml.SaxParser(function(cb) {
                cb.onStartElementNS(function(elem) {
                    if (elem === 'name') {
                        cb.onCharacters(function(chars) {
                            name = chars;
                        });
                    }

                    if (elem === 'shortDescription') {
                        cb.onCharacters(function(chars) {
                            shortDescription = chars;
                        });
                    }

                    if (elem === 'executable') {
                        cb.onStartElementNS(function(eleme) {
                            if (eleme === 'url') {
                                cb.onCharacters(function(chars) {
                                    var urlExp = new RegExp
                                    ('^https://(jenkins.whoop.com/.*)$');

                                    checkUrl = chars.replace(urlExp, '$1');

                                    outputInfo.checkUrl = checkUrl;
                                });
                            }
                        });
                    }
                });

                cb.onEndElementNS(function (elem) {
                    if (elem === 'name') {
                        outputInfo.name = name;
                    }

                    if (elem === 'shortDescription') {
                        outputInfo.shortDescription = shortDescription;
                    }
                });
            });

            parser.parseString(data);

            if (outputInfo.name && outputInfo.shortDescription &&
                outputInfo.checkUrl) {
                callback({
                    "id": 4,
                    "type": "message",
                    "channel": channel,
                    "text": outputInfo.name + ' (' +
                    outputInfo.shortDescription + ') left the queue.'
                });

                checkJobStatus(options, callback, channel, outputInfo.checkUrl);
            }

            if (!checkUrl) {
                checkJobStatus(options, callback, channel);
            }

        }, function (res) {});
    }

    // called once after item leaves queue
    else {
        leftJobInfo(callback, channel, checkUrl);
    }
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
    });
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
        return foundMatches;
    }
}

/* * Lists jenkins jobs that include keyword listQuery, if specified.
   * If none found, notify user.
   */
function handleListKeyword (listQuery, jobArray, outputMessage, callback,
    channel) {
    // if listQuery, acculumate matches to prefix.
    var keywordMatches = findMatches(listQuery, jobArray,
        function (item) {
            // if no listQuery, accumulate all entries.
            if (listQuery === '') {
                outputMessage += item.name + '\n';
                console.log('OUTPUT MESSAGE: ', outputMessage);
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


function handleParameters (parametersObj, keyEqualsVal) {
    var keyVal = keyEqualsVal.split("=");
    var key = keyVal[0].trim();

    parametersObj[key] = keyVal[1].trim();
    return parametersObj;

}


function isCallable (text) {
    return text.includes('jenkins');
}


function helpDescription () {
    return '_JENKINS_\nSend *jenkins [keyword] list* to list jenkins' +
    ' jobs with specified keyword in name.\n' +
    'Send *jenkins [job name]* to build a jenkins job. If the job name is ' +
    'not exactly correct, bot will attempt to fuzzy match it to the ' +
    'correct job.\n Send *jenkins [job name] -p KEY=value* to build a job ' +
    'with parameters';
}


/* * Given text given by the user, determines which operation to run.
   * Commands without
   * keywords attempt to execute a jenkins job.
   */

function executePlugin (channel, callback, text) {

    /*var jobOptions = {
        url: 'jenkins.whoop.com/job/JanetTestJobParameterNeeded/build',
        method: 'POST'
    };

    core.makeRequest(jobOptions, function (data, statusCode) { console.log ('DATA: ', data); }, function () {});*/

    var outputMessage = '';
    var regexp;

    var query = text.split("jenkins ")[1].trim();

    // get list of all jobs for reference
    getFullJobList(function (jobArray) {

        // determine if list keyword present
        var list = /(.*) list$/i.exec(query);

        // LIST KEYWORD: bot should list all jobs [containing keyword]
        if (list) {
            // get prefix of list
            var listQuery = list[1].trim();
            handleListKeyword(listQuery, jobArray, outputMessage, callback,
                channel);
        }

        // NO LIST KEYWORD: look for flags, then attempt to execute a job.
        else {
            // first check for flags
            var splitText = query.split(" -");
            var command = splitText[0].trim();

            var flagExpression = new RegExp('^([A-Za-z]) +(.*)$');
            var parameters = {};

            // traverse non-command terms of array
            for (var i = 1; i < splitText.length; i++) {
                var found = flagExpression.exec(splitText[i].trim());

                if (found) {

                    // will need to change this IF implementing tags with
                    // no parameters
                    var tag = found[1];
                    var info = found[2];

                    if (tag === 'p') {
                        parameters = handleParameters(parameters, info);
                    }
                }
            }

            // once flags finished, parse command
            regexp = new RegExp('^' + command + '$', 'i');

            // look for case-insensitive strict match
            var exactMatch = _.find(jobArray, function(job) {
                return regexp.test(job.name);
            });

            if (exactMatch) {
                console.log('PARAMETERS: ', parameters);
                buildJenkinsJob(exactMatch, channel, callback, parameters);
            }

            // if no strict match, look for fuzzy match
            else {
                var inputs = command.split(" ");

                // fold over matches for each keyword until found entries
                // that match all keywords
                var finalMatches = _.reduce(inputs, function (acc, input) {
                    return findMatches(input, acc);
                }, jobArray);

                // if only one match found at end, execute the job
                if (finalMatches.length === 1) {
                    buildJenkinsJob(finalMatches[0], channel, callback,
                        parameters);
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
                        "text": 'I could not find that job.' +
                        ' Type "jenkins list" to see all jobs.'
                    });
                }
            }
        }
    });
}

function updateNulls (msgCB) {
    var nullResults = [];

    // retrieve builds with null results from jenkinsStore
    _.forEach(this.dataStore, function (value, key) {
        if (value[result] !== 'SUCCESS' && value[result] !== 'FAILURE') {
            nullResults.push({
                "name": key,
                "url": value[url]});
        }
    });

    if (nullResults.length > 0) {
        nullResults.forEach(function(build) {
            core.makeRequest({url: build.url + 'api/xml'},
                function (data) {

                });
        });
    }
}

module.exports = {
    isCallable: isCallable,
    executePlugin: executePlugin,
    buildJenkinsJob: buildJenkinsJob,
    findMatches: findMatches,
    helpDescription: helpDescription
};
