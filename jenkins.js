var core = require('./core.js');

function buildJenkinsJob (requestedJob, channel, callback) {

    // search for match among listed jobs
    var options = {
        url: 'jenkins.whoop.com/api/json',
        method: 'POST'
    };

    core.makeRequest(options, function (dataObject) {
        var jobsArray = dataObject.jobs;

        jobsArray.forEach(function (currJob) {
            if (currJob.name === requestedJob) {
                var jobOptions = {
                    url: currJob.url.split("//").pop() + 'build',
                    method: 'POST'
                };

                // make request to specified url
                core.makeRequest(jobOptions, function () {},
                    function (response) {
                        if (response.statusCode === 201) {
                            callback({
                                "id": 4,
                                "type": "message",
                                "channel": channel,
                                "text": requestedJob + ' successfully built.'
                            });
                        }
                    });
            }
        });
    });


}

module.exports = {
    buildJenkinsJob: buildJenkinsJob
};
