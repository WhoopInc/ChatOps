var assert = require('chai').assert;
var index = require('../index.js');
//var app = require('../app.js');
//var request = require('request');
//var https = require('https');

describe('example test', function () {
    it('should be get', function (done) {
        assert(index.options.method === 'GET');
        done();
    });
});



