const users = require('../datastores/users.js');

const _ = require('lodash');

const digitWords = ['zero', 'one', 'two', 'three', 'four', 'five', 'six',
'seven', 'eight', 'nine', 'ten'];

function isCallable (text) {
    return /chatops survey/i.test(text);
}

function helpDescription () {
    return '_SURVEYS_\nSend *chatops survey #[channel name] [Question] ' +
    '[Answer 1] [Answer 2]* etc. to start a survey in specified channel.' +
    'Maximum number of answer options is 10.';
}

function executePlugin (channel, callback, text, user) {
    var channelRegExp;
    var inputChannel;

    // check whether channel valid
    var findInput = /<#(.*)>/.exec(text);


    if (!findInput) {
        callback({
            "id": 7,
            "type": "message",
            "channel": channel,
            "text": 'Make sure to specify a channel for the survey with ' +
            '*chatops survey #[channel name] [question] [answer1] ' +
            '[answer2]* etc.'
        });
    }

    // if good channel, attempt to format message
    else {
        inputChannel = findInput[1];

        var questionAnswers = text.split(inputChannel).pop().trim();
        var contentRegExp = new RegExp(/\[([^\]]+)\]/, 'g');

        var question = contentRegExp.exec(questionAnswers);

        // check if good content provided
        if (!question) {
            callback({
                "id": 7,
                "type": "message",
                "channel": channel,
                "text": 'Make sure to specify a question and answer choices ' +
                'for the survey with *chatops survey #[channel name] ' +
                '[question] [answer1] [answer2]* etc.'
            });
        }
        else {
            var outputMessage = '';

            var alias = users.getSingleUserName(user);

            if (alias) {
                outputMessage += '*' + alias + ' wants to know... ' +
                question[1] + '*\n';
            }
            else {
                outputMessage += '*User ' + user + ' wants to know... ' +
                question[1] + '*\n';
            }

            var answerOption = contentRegExp.exec(questionAnswers);

            if (!answerOption) {
                callback({
                    "id": 7,
                    "type": "message",
                    "channel": channel,
                    "text": 'You must provide answer options.'
                });

                return;
            }

            var counter = 0;

            while (answerOption) {

                // check if too many answer options given
                counter++;
                if (counter > 10) {
                    callback({
                        "id": 7,
                        "type": "message",
                        "channel": channel,
                        "text": 'You have exceeded the limit of 10 answer options.'
                    });

                    return;
                }

                // else format message
                outputMessage += ':' + digitWords[counter] + ': ' + answerOption[1] +
                '\n';

                answerOption = contentRegExp.exec(questionAnswers);
            }

            callback({
                "id": 7,
                "type": "message",
                "channel": inputChannel,
                "text": outputMessage
            });
        }
    }
}

module.exports = {
    isCallable: isCallable,
    executePlugin: executePlugin,
    helpDescription: helpDescription
};
