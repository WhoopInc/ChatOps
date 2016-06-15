function DataStore () {
    this.dataStore = {};
}

DataStore.prototype.store = function (key, val, bigkey) {
    if (bigkey) {
        this.dataStore[bigkey][key] = val;
    }
    else {
        this.dataStore[key] = val;
    }
}

DataStore.prototype.get = function (key, bigkey) {
    if (bigkey) {
        return this.dataStore[bigkey][key];
    }
    else {
        return this.dataStore[key];
    }
}

module.exports = {
    DataStore: DataStore
};
