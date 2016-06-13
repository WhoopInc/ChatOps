const assert = require('chai').assert;

const index = require('../index.js');
const app = require('../app.js');
const core = require('../core.js');

const httpcat = require('../plugins/httpcat.js');
const github = require('../plugins/github.js');

var testerEventObjects = [{type: "message",
                           user: "U1B225887",
                           channel: "C1BBWJ7PF",
                           text: "what’s 404?"}, // correct, should pass
                          {type: "message",
                           user: "U1B225887",
                           channel: "C1BBWJ7PF",
                           text: "what’s 404"}, // correct, should pass
                          {type: "message",
                           user: "U1B225887",
                           channel: "C1BBWJ7PF",
                           text: "404"},	// insufficient cues, should fail
                          {type: "message",
                           channel: "C1BBWJ7PF",
                           text: "what’s 404",
                           username: "slackbot"}, // slackbot, should fail
                          {type: "message",
                           hidden: "true",
                           channel: "C1BBWJ7PF",
                           text: "what’s 404"}, // hidden, should fail
                          {type: "message",
                           user: "U1ASA6B88",
                           channel: "C1BBWJ7PF",
                           text: "what’s 404"}, // self (bot), should fail
                          {type: "notmessage",
                           user: "U1ASA6B88",
                           channel: "C1BBWJ7PF",
                           text: "what’s 404"}]; // not message, should fail


// ignoreEvent tests
describe('ignoreEvent', function () {
    it('should ignore username slackbot', function (done) {
        assert(core.ignoreEvent(testerEventObjects[3]));
        done();
    });

    it('should ignore type !== message', function (done) {
        assert(core.ignoreEvent(testerEventObjects[6]));
        done();
    });

    it('should ignore when user is whoop bot', function (done) {
        assert(core.ignoreEvent(testerEventObjects[5]));
        done();
    });

    it('should ignore hidden events', function (done) {
        assert(core.ignoreEvent(testerEventObjects[4]));
        done();
    });

    it('should not ignore correct events', function (done) {
        assert(!core.ignoreEvent(testerEventObjects[0]));
        done();
    });
});


// handleHTTP tests
describe('handleHTTP', function () {
    it('should return correct url for messages with 1 code & 1 contextClue',
        function (done) {
            httpcat.executePlugin(testerEventObjects[0].channel,
              function (res) {
              assert.equal(res.text, 'https://http.cat/404');
            }, testerEventObjects[0].text);
            done();
        });

    it('should return correct url for messages with 1 code & 2 contextClues',
        function (done) {
            httpcat.executePlugin(testerEventObjects[1].channel,
              function (res) {
              assert.equal(res.text, 'https://http.cat/404');
            }, testerEventObjects[1].text);
            done();
        });

    it('should not return anything for messages with 1 code & 0 contextClues',
        function (done) {
            assert(!httpcat.executePlugin(testerEventObjects[2].channel,
              function () {}, testerEventObjects[2].text));
            done();
        });
});

var testRepos = [
                 [{state: "open"},
                  {state: "open"},
                  {state: "closed"}],
                 [{state: "open"}],
                 []
                ];



describe('countOpenPR', function () {
    it('should only count open PRs',
        function (done) {
            assert.equal(github.countOpenPR(testRepos[0]), 2);
            done();
        });
    it('should work for repos with 1 PR',
        function (done) {
            assert.equal(github.countOpenPR(testRepos[1]), 1);
            done();
        });
    it('should return 0 for empty PR array',
        function (done) {
            assert.equal(github.countOpenPR(testRepos[2]), 0);
            done();
        })
});





