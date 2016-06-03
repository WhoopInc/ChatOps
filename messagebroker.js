function MessageBroker (soc) {
    this.socket = soc;
    this.queue = [];
}

MessageBroker.prototype.sendMessage = function () {
    if (this.queue.length > 0) {

        var val = this.queue.pop();

        //console.log('TRYING TO SEND MESSAGE: ', val);
        this.socket.send(JSON.stringify(val));
    }
};

MessageBroker.prototype.push = function (item) {
    if (item) {
        this.queue.push(item);
    }

};

MessageBroker.prototype.init = function () {
    setInterval(this.sendMessage.bind(this), 1500);
};

module.exports = {
    MessageBroker: MessageBroker
};


