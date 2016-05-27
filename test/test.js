var assert = require('chai').assert;
var index = require('../index.js');
var app = require('../app.js');
//var request = require('request');
//var https = require('https');

describe('example test', function () {
    it('should be get', function (done) {
        assert(index.options.method === 'GET');
        done();
    });
});

var testerEventObjects = [ { type: "message",
							 user: "U1B225887",
							 channel: "C1BBWJ7PF",
							 text: "what’s 404?" }, // correct, should pass
						   { type: "message",
							 user: "U1B225887",
							 channel: "C1BBWJ7PF",
							 text: "what’s 404" }, // correct, should pass
						   { type: "message",
							 user: "U1B225887",
							 channel: "C1BBWJ7PF",
							 text: "404" },		   // insufficient cues, should fail
						   { type: "message",
							 channel: "C1BBWJ7PF",
							 text: "what’s 404",
							 username: "slackbot" }, // slackbot, should fail
						   { type: "message",
							 hidden: "true",
							 channel: "C1BBWJ7PF",
							 text: "what’s 404" }, // hidden, should fail
						   { type: "message",
							 user: "U1ASA6B88",
							 channel: "C1BBWJ7PF",
							 text: "what’s 404" }, // self (bot), should fail
						   { type: "notmessage",
							 user: "U1ASA6B88",
							 channel: "C1BBWJ7PF",
							 text: "what’s 404" } ]; // not message, should fail


// ignoreEvent tests
describe('ignoreEvent', function () {
	it('should ignore username slackbot', function (done) {
		assert(app.ignoreEvent(testerEventObjects[3]));
		done();
	});

	it('should ignore type !== message', function (done) {
		assert(app.ignoreEvent(testerEventObjects[6]));
		done();
	});

	it('should ignore when user is whoop bot', function (done) {
		assert(app.ignoreEvent(testerEventObjects[5]));
		done();
	});

	it('should ignore hidden events', function (done) {
		assert(app.ignoreEvent(testerEventObjects[4]));
		done();
	});

	it('should not ignore correct events', function (done) {
		assert(!(app.ignoreEvent(testerEventObjects[0])));
		done();
	});
});


// handleHTTP tests
describe('handleHTTP', function () {
	it('should return correct url for messages with 1 code & 1 contextClue', function (done) {
		assert.equal(app.handleHTTP(testerEventObjects[0]).text, 'https://http.cat/404');
		done();
	});

	it('should return correct url for messages with 1 code & 2 contextClues', function (done) {
		assert.equal(app.handleHTTP(testerEventObjects[1]).text, 'https://http.cat/404');
		done();
	});

	it('should not return anything for messages with 1 code & 0 contextClues', function (done) {
		assert(!(app.handleHTTP(testerEventObjects[2])));
		done();
	});
});




