var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var ObjectId = require('mongodb').ObjectID;
var url = 'mongodb://localhost:27017/test';


var insertDocument = function(db, callback, object) {
    db.collection('users').insertOne(object, function(err, result) {
        assert.equal(err, null);
        //console.log("Inserted a document into the restaurants collection.");
        callback();
    });
  };
}


