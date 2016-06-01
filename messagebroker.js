function MessageBroker (soc) {
    self = this;
    this.socket = soc;
    this.queue = new Array();
}

MessageBroker.prototype.sendMessage = function () {
    if (self.queue.length > 0) {
        var val = self.queue.pop();
        this.socket.send(JSON.stringify(val));
    }
};

MessageBroker.prototype.push = function (item) {
    self.queue.push(item);
};

MessageBroker.prototype.init = function () {
    setInterval(this.sendMessage.bind(this), 1000);
    //console.log('interval set');
};





module.exports = {
    MessageBroker: MessageBroker
};


