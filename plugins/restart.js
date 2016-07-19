const slackutils = require('../slackutils')
    ;

exports.isCallable = function (text) {
    return /^restart$/.test(text);
};

exports.executePlugin = function (channel, callback, text) {
  if (slackutils.isDMChannel(channel)) {
    console.log('terminating because of user request');
    process.exit(127);
  }
};
