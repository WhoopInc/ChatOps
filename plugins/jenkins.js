const _ = require('lodash');

const core = require('../core.js');
const ds = require('../datastore.js');
const config = require('../configenv.js');

var jenkinsStore = new ds.DataStore();

/* *    Flow:
   * executePlugin (determines which operation, parses given parameters) =>
   * checkParams (checks that required params are provided) =>
   * buildJenkinsJob (executes build with parameters, if specified) =>
   * checkJobStatus (makes continual requests until job is dequeued) =>
   * leftJobInfo & updateLeftJobStatus(periodically check status of running jobs)
   *
   *    Helper Functions:
   * handleParameters - parses "KEY=val" strings into parameter objects
   * handleListKeyword - returns list of Jenkins jobs with (optional) keyword
   * findMatches - finds Jenkins jobs that match keyword
   * getFullJobList - returns list of all Jenkins jobs
   */


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


function getFullJobList (callback) {
    var options = {
        url: 'jenkins.whoop.com/api/json',
        method: 'POST'
    };

    core.makeRequest(options, function (dataObject) {
        callback(dataObject.jobs);
    });
}


function findMatches (keyword, collection) {
    var regexp = new RegExp(keyword, 'i');
    var foundMatches = [];

    collection.forEach(function (item) {
        if (regexp.test(item.name)) {
            foundMatches.push(item);
        }
    });

    return foundMatches;
}


function handleListKeyword (listQuery, jobArray, outputMessage, callback, channel) {
    // if no listQuery, accumulate list of all jobs
    if (listQuery.trim() === '') {
        jobArray.forEach(function (job) {
            outputMessage += job.name + '\n';
        });

        callback({
            "id": 4,
            "type": "message",
            "channel": channel,
            "text": '*Jenkins Jobs:*\n' + outputMessage
        });
    }
    // if listQuery, acculumate matches to prefix.
    else {
        var keywordMatches = findMatches(listQuery, jobArray);

        // if there are matches, output them
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
        // if no matches, notify users
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
}


function handleParameters (parametersObj, keyEqualsVal) {
    var keyVal = keyEqualsVal.split("=");
    var key = keyVal[0].trim();

    parametersObj[key] = keyVal[1].trim();
}


function updateLeftJobStatus (jobName, callback, channel) {
    var job = jenkinsStore.get([jobName]);

    if (job.result !== 'SUCCESS' &&
        job.result !== 'FAILURE') {

        leftJobInfo(callback, channel, job.url);
    }
    else {
        clearTimeout(job.timer);
        jenkinsStore.remove([jobName]);
    }
}

function storeLeftJobStatus(jobName, duration, url, result, timeout, callback, channel) {
    jenkinsStore.store([jobName, 'duration', duration]);
    jenkinsStore.store([jobName, 'url', url]);
    jenkinsStore.store([jobName, 'result', null]);

    if (jenkinsStore.get([jobName])['timer']) {
      clearTimeout(jenkinsStore.get([jobName])['timer']);
    }

    var timer = setTimeout(function () {
      updateLeftJobStatus(jobName, callback, channel);
    }, 30 * 1000);

    jenkinsStore.store([jobName, 'timer', timer]);
}

function leftJobInfo (callback, channel, checkUrl) {
    var shortDescription;
    var fullDisplayName;
    var result;
    var duration;

    var outputInfo = {};

    var urlExp = new RegExp('^https://(jenkins.whoop.com/.*)/$');

    var newOptions = {
        "url": checkUrl.replace(urlExp, '$1/api/json')
    };

    core.makeRequest(newOptions, function (data) {

        if (!data.result) {
            // if not finished immediately, store it in jenkinsStore for later
          storeLeftJobStatus(data.fullDisplayName, data.duration, data.url, null, 30*1000, callback, channel);
        }
        else {
            // if finished immediately, don't store details in jenkinsStore

            // notify user of status
            callback({
                "id": 4,
                "type": "message",
                "channel": channel,
                "text": data.fullDisplayName + ' finished with result ' +
                data.result + ' after ' + data.duration
            });
        }

    }, null);
}


function checkJobStatus (options, callback, channel, param, checkUrl) {
    var outputInfo = {};

    // while <waitingItem>
    if (!checkUrl) {
        var name;
        var shortDescription;

        core.makeRequest(options, function (data) {

            if (param) {
                if (!data.inQueue) {
                    callback({
                        "id": 4,
                        "type": "message",
                        "channel": channel,
                        "text": data.name + ' left the queue.'
                    });
                    checkJobStatus(options, callback, channel, true, data.lastBuild.url);
                }
                else {
                    checkJobStatus(options, callback, channel, true);
                }
            }
            else {
                if (data.executable) {
                    callback({
                        "id": 4,
                        "type": "message",
                        "channel": channel,
                        "text": data.task.name + ' left the queue.'
                    });

                    checkJobStatus(options, callback, channel, false, data.executable.url);
                }
                else {
                  checkJobStatus(options, callback, channel, false);
                }

            }


        }, null);
    }

    // called once after item leaves queue
    else {
        leftJobInfo(callback, channel, checkUrl);
    }
}


function buildJenkinsJob (requestedJobObject, channel, callback, parameters) {

    var urlExp = new RegExp('^https://(jenkins.whoop.com/.*)/$');

    var jobOptions = {
        url: requestedJobObject.url.replace(urlExp, '$1/build'),
        method: 'POST'
    };

    var postData;

    // prepare postData, if parameters passed in
    if (!_.isEmpty(parameters)) {

        var paramArr = [];

        for (key in parameters) {
            paramArr.push({
                "name": key,
                "value": parameters[key]
            });
        }

        var parameter = {"parameter": paramArr};

        var jsonParametersString = JSON.stringify(parameter);

        jobOptions.headers = {
            'Content-Type': 'application/x-www-form-urlencoded'
        };

        postData = "json=" + jsonParametersString;

        console.log('PostData= ', postData);
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
        else {

            // check for missing parameter error
            if (data && data.includes("Nothing is submitted") &&
                statusCode === 400) {
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

            // uncommon error, notify user
            else {
                console.log(data);

                callback({
                    "id": 4,
                    "type": "message",
                    "channel": channel,
                    "text": 'Request to ' + requestedJobObject.name +
                    ' failed with status code ' + statusCode + '.'
                });
            }
        }
    }, function (res) {
        var statusOptions = {
            url: res.headers.location.split('//').pop() + 'api/json'
        };

        if (!_.isEmpty(parameters)) {
            checkJobStatus(statusOptions, callback, channel, true);
        }
        else {
            checkJobStatus(statusOptions, callback, channel, false);
        }

    }, postData);
}


function checkParams (requestedJobObject, inputParams, callback1, channel, callback2) {
    var requiredParams = [];
    var missingParams = [];

    var urlExp = new RegExp('^https://(jenkins.whoop.com/.*)/$');

    var options = {
        "url": requestedJobObject.url.replace(urlExp, '$1/api/json')
    };

    // retrieve parameter definitions, filter for required ones
    core.makeRequest(options, function (data) {

        for (var i = 0; i < data.actions.length; i++) {

            var paramDefs = data.actions[i].parameterDefinitions;

            if (paramDefs) {

                for (var j = 0; j < paramDefs.length; j++) {

                    if (paramDefs[j].type === 'StringParameterDefinition'
                        && paramDefs[j].defaultParameterValue.value === '') {

                        requiredParams.push(paramDefs[j]);
                    }

                    if (paramDefs[j].type === 'PT_TAG' ||
                        paramDefs[j].type === 'PT_BRANCH' ||
                        paramDefs[j].type === 'PT_BRANCH_TAG') {

                        if (paramDefs[j].defaultParameterValue === null) {
                            requiredParams.push(paramDefs[j]);
                        }
                    }

                }
            }

            console.log('REQUIRED PARAMS: ', requiredParams);

            break;
        }

        requiredParams.forEach(function (param) {
            var paramName = param.name;

            if (!inputParams[paramName]) {
                missingParams.push(param);
            }
        });

        console.log('MISSING PARAMS: ', missingParams);

        var outputMessage = '';
        if (missingParams.length > 0) {
            outputMessage += 'The parameter(s)\n';
            missingParams.forEach(function (param) {
                outputMessage += param.name;

                if (param.description) {
                    outputMessage += ' (' + param.description + ')';
                }

                outputMessage += '\n';
            });

            outputMessage += 'are also needed to run this job. Specify ' +
            'parameters with -p KEY=value';

            callback1({
                "id": 4,
                "type": "message",
                "channel": channel,
                "text": outputMessage
            });

            return false;

        }

        else {
            callback2(requestedJobObject, channel, callback1, inputParams);
        }

    });
}


function executePlugin (channel, callback, text) {

    var outputMessage = '';
    var regexp;

    var query = text.split("jenkins ")[1].trim();

    // get list of all jobs for reference
    getFullJobList(function (jobArray) {

        // determine if list keyword present
        var list = /(.*)list$/i.exec(query);

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
                        handleParameters(parameters, info);
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
                checkParams(exactMatch, parameters, callback, channel,
                    buildJenkinsJob);
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
                    checkParams(finalMatches[0], parameters, callback, channel,
                    buildJenkinsJob);
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


module.exports = {
    isCallable: isCallable,
    executePlugin: executePlugin,
    buildJenkinsJob: buildJenkinsJob,
    findMatches: findMatches,
    helpDescription: helpDescription
};
