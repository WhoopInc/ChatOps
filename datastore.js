const _ = require('lodash');

function DataStore () {
    this.dataStore = {};
}

// keysVal is an array of strings, where last term is val and preceding
// terms are keys, in order
DataStore.prototype.store = function (keysVal) {

    var current = this.dataStore;

    for (var i = 0; i < keysVal.length - 2; i++) {

        if (!current[keysVal[i]]) {
            current[keysVal[i]] = {};
        }

        current = current[keysVal[i]];
    }

    current[keysVal[keysVal.length - 2]] = keysVal[keysVal.length - 1];

    console.log('DATASTORE: ', this.dataStore);
}

DataStore.prototype.get = function (keys) {

    if (!_.has(this.dataStore, keys)) {
        console.log('BAD KEYS TO DS.GET');
    }
    else {
        var current = this.dataStore;

        for (var i = 0; i < keys.length - 1; i++) {

            if (!current[keys[i]]) {
                console.log('BAD KEYS TO DS.GET');
            }

            current = current[keys[i]];
        }

        return current[keys[keys.length - 1]];
    }
}

DataStore.prototype.remove = function (keys) {
    var current = this.dataStore;

    if (!lo.has(this.dataStore, keys)) {
        console.log('BAD KEY TO DS.REMOVE');
    }
    else {
        for (var i = 0; i < keys.length - 1; i++) {

            if (!current[keys[i]]) {
                console.log('BAD KEYS TO DS.GET');
            }

            current = current[keys[i]];
        }

        var res = delete current[keys[keys.length - 1]];
    }
}

DataStore.prototype.getAll = function () {
    return this.dataStore;
}

module.exports = {
    DataStore: DataStore
};
