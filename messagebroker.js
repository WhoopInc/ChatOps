const _ = require('lodash');

function MessageBroker (soc) {
    this.socket = soc;
    this.queue = [];
    this.whitelist = ['C1DNMQSCD', // #botdev
                      'C1BBWJ7PF' // #bottest
                     ];
}

MessageBroker.prototype.sendMessage = function () {
    if (this.queue.length > 0) {

        var val = this.queue.pop();

        if (_.includes(this.whitelist, val.channel) ||
            /^D/.test(val.channel)) {
            this.socket.send(JSON.stringify(val));
        }
    }
};

MessageBroker.prototype.push = function (item) {
    if (item) {
        this.queue.push(item);
    }
};

MessageBroker.prototype.init = function () {
    console.log('INIT');
    this.queue = [];
    setInterval(this.sendMessage.bind(this), 1500);
};


// instance of messagebroker
var messageBroker;

// functions for other modules to interact with messagebroker
function initialize (sock) {
    if (!messageBroker) {
        messageBroker = new MessageBroker(sock);
        messageBroker.init();
    } else {
        throw "messageBroker already exists";
    }

}

function send (item) {
    if (messageBroker) {
        messageBroker.push(item);
    } else {
        throw "messageBroker disconnected";
    }
}

function destroy () {
    messageBroker = undefined;
}

function exists () {
    return messageBroker !== undefined;
}

module.exports = {
    initialize: initialize,
    send: send,
    destroy: destroy,
    exists: exists
};
