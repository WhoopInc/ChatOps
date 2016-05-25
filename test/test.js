var assert = require('chai').assert;
var index = require('../index.js');
var app = require('../app.js');
var request = require('request');
const https = require('https');

describe('HTTPS response', function () {
    describe('', function () {
        it('should return 200', function (done) {
            https.get(index.options, function (res) {
                assert.equal(200, res.statusCode);
                done();
            });
        });
    });
});

describe('HTTPS response data', function () {
    var alldata = '';
    describe('', function () {
        it('should contain a WebSocket url', function (done) {
            https.get(index.options, function (res) {
                res.on('data', function (data) {
                    alldata = alldata + data.toString();
                    console.log(alldata);
                });

                res.on('end', function () {
                    var url = JSON.parse(alldata).url;
                    var urlstring = JSON.stringify(url);

                    assert(urlstring !== '', 'Returned url is not empty.');
                    assert(url !== undefined, 'Returned url is not undefined.');
                    done();
                })

            });
        });
    });
});



