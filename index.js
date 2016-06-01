//var https = require('https');
require('dotenv').load();   // loads variables from .env to ENV
var app = require('./app.js');
var core = require('./core.js');

// contents of HTTPS server request
var options = {
    url: 'slack.com/api/rtm.start?token=' + process.env.SLACK_API_TOKEN
};

core.makeRequest(options, app.initializeWebSocket);

// // collects data from HTTPS response
// function httpsResponse(res) {
//     // console.log('statusCode: ', res.statusCode);
//     // console.log('headers: ', res.headers);

//     res.on('data', function (data) {
//         alldata = alldata + data.toString();
//         //console.log('end data callback');
//     });

//     res.on('close', function() {
//         //console.log('end response callback');
//         app.initializeWebSocket(alldata);

//     });
// }

//var alldata = '';

// makes HTTPS request, collects data received
// var req = https.request(options, function(res) {
//     httpsResponse(res);
// });

// req.on('close', function() {
//     //console.log('end request');
//     //console.log(alldata);
//     //console.log(exports.alldata);
//     app.initializeWebSocket(alldata);
// });

// req.end();


module.exports = {
    options: options
    //httpsResponse: httpsResponse,
    //request: req,
    //alldata: alldata
};
