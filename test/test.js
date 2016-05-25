var assert = require('chai').assert;
var index = require('../index.js');
var app = require('../app.js');

describe('HTTPS Req', function() {
    it('should return status code 200', function () {
        var code = https.request(index.options, function(res){
            return(res.statusCode);
        });
        assert.equal(200, code);
    });
});

describe('Data returned by HTTPS request', function () {
    it('should include a WebSocket url', function () {
        var url = JSON.parse(index.alldata).url;
        var urlstring = JSON.stringify(url);
        assert(urlstring !== '', 'Returned url is not empty.');
        assert(url !== undefined, 'Returned url is not undefined.');
    })
});

