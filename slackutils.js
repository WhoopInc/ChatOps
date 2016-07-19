
function isDMChannel(channelId) {
  return /^D/.test(channelID);
}

module.exports = {
  isDMChannel: isDMChannel
};
