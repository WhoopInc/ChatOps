function executePlugin (channel, callback, text) {
    var codes = ['100', '101', /* '102', */
                '200', '201', '202', /* 203, */ '204', '205', '206', '207',
                /* '208', */ '226',
                '300', '301', '302', '303', '304', '305', /* '306', */ '307',
                /* '308', */
                '400', '401', '402', '403', '404', '405', '406', /* '407', */
                '408', '409',
                '410', '411', '412', '413', '414', '415', '416', '417', '418',
                /* '421', */ '422', '423', '424', '425', '426', /* '428', */
                '429',
                '431', '444', '450', '451', /* '499', */
                '500', /* '501', */ '502', '503', /* '504', '505', */ '506',
                '507', '508', '509',
                /* '510', '511',  */ '599'];

    var contextClues = ['what', 'what\'s', '?', 'mean'];

    var foundCodes = [];

    codes.forEach(function (item) {
        if (text.includes(item)) {
            foundCodes.push(item);
        }
    });

    for (var i = 0; i < contextClues.length; i++) {
        if (text.includes(contextClues[i]) && foundCodes.length !== 0) {
            var outgoing = {
                "id": 2,
                "type": "message",
                "channel": channel,
                "text": "https://http.cat/" + foundCodes[0]
            };

            callback(outgoing);
        }
    }
}

function isCallable (text) {
    return /\d{3}/.test(text);
}

module.exports = {
    isCallable: isCallable,
    executePlugin: executePlugin
};
