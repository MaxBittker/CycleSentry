var express = require('express'),
    app = express(),
    path = require('path'),
    // request = require('request'),
    _ = require('underscore'),
    // child_process = require('child_process'),
    hostname = process.env.HOSTNAME || 'localhost',
    // port = process.env.PORT || 4567,
    publicDir = process.argv[2] || __dirname + '/public',
    // favicon = require('serve-favicon'),
    fs = require('fs');

var MongoClient = require('mongodb').MongoClient,
    assert = require('assert');

// Connection URL 
var url = 'mongodb://localhost:27017/Cycle';
// Use connect method to connect to the Server 
MongoClient.connect(url, function(err, db) {
    assert.equal(null, err);
    console.log("Connected correctly to server");


});



var insertDocument = function(db, data, callback) {
    db.collection('testCollection').insertOne({
        text: data
    }, function(err, result) {
        assert.equal(err, null);
        console.log("Inserted a document into the testCollection.");
        callback(result);
    });
};

var findDocuments = function(db, callback) {
  // Get the documents collection 
  var collection = db.collection('testCollection');
  // Find some documents 
  collection.find({}).toArray(function(err, docs) {
    assert.equal(err, null);
    assert.equal(2, docs.length);
    console.log("Found the following records");
    console.dir(docs);
    callback(docs);
  });
}


var createServer = function(port) {

    // app.use(favicon(__dirname + '/favicon.ico'));

    app.get('/', function(req, res) {

        res.set('Content-Type', 'text/html');
        res.send('<h4>DATA:<br>' + data.join('<br>') + '</h4>');

    })

    app.get('/api/insert/:text', function(req, res) {

        var text = req.params.text.toString();
        console.log(text);
       
        insertDocument(db, "helloworld", function() {
            db.close();
        });

        res.send(text);

    });


    app.use('/static/', express.static(path.join(__dirname, 'public')));

    var server = app.listen(port, function() {

        var host = server.address().address;
        var port = server.address().port;

        console.log('CycleSentry listening at http://%s:%s', host, port);

    });
};

module.exports = createServer;

createServer(8080)
