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

var Db = require('mongodb').Db,
    Server = require('mongodb').Server,
    ObjectId = require('mongodb').ObjectID;

var createServer = function(port) {

    // app.use(favicon(__dirname + '/favicon.ico'));
    var db = new Db('Cycle', new Server('localhost', 27017));
    var collection = db.collection("testCollection");

    var getDocs = function(db, res, callback) {
        var cursor = db.collection('testCollection').find();
        res.set('Content-Type', 'text/html');

        cursor.each(function(err, doc) {
            if (doc != null) {
                console.log(doc.text);
                res.write('<h4>' + doc.text + '</h4><br>')
            } else {
                res.end()
                callback();
            }
        });
    };

    app.get('/api/getText', function(req, res) {
        db.open(function(err, db) {
            getDocs(db, res, function() {
                db.close();
            });
        })
    });



    app.get('/api/insert/:text', function(req, res) {
        var text = req.params.text;
        // Fetch a collection to insert document into
        db.open(function(err, db) {
            // Insert a single document
            console.log(text.toString());

            collection.insert({
                text: text.toString()
            }, function(err, docsInserted) {
                db.close();
                // get last id
                res.send(docsInserted.ops[0]._id);

            });

        });
    });

    app.use('/', express.static(path.join(__dirname, 'public')));

    var server = app.listen(port, function() {

        var host = server.address().address;
        var port = server.address().port;

        console.log('CycleSentry listening at http://%s:%s', host, port);

    });
};

module.exports = createServer;

createServer(8080)
