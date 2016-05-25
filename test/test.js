var assert = require('chai').assert;
var index = require('../index.js');
var app = require('../app.js');
const https = require('https');
require('dotenv').load();

var alldata = '';

console.log(JSON.stringify(index.options));

describe('HTTPS Req', function() {
    it('should return status code 200', function () {
        var code;
        var req = https.request(index.options, function(res){

            console.log(JSON.stringify(res));

            res.on('data', function (data) {
                alldata = alldata + data.toString();
                //console.log('end data callback');
            });
            code = JSON.stringify(res.statusCode);
            console.log(code);
        });
        req.end();
        assert.equal('200', code);
    });
});


describe('Data returned by HTTPS request', function () {
    it('should include a WebSocket url', function () {
        var url = JSON.parse(alldata).url;
        var urlstring = JSON.stringify(url);
        assert(urlstring !== '', 'Returned url is not empty.');
        assert(url !== undefined, 'Returned url is not undefined.');
    })
});

