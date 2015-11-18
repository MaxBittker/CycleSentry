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
    Client = require('mongodb').MongoClient,
    ObjectId = require('mongodb').ObjectID;

var url = 'mongodb://localhost:27017/Cycle'
var db

var start = function(port, done) {
    if (!done) {
        done = () => console.log('\n')
    }
    Client.connect(url, function(err, retDB) {
        if (err) throw err

        db = retDB
        console.log('connected to mongo')
        createServer(port, done)
    })
}

var createServer = function(port, done) {


    var userCollection = db.collection("users");


    app.get('/api/listUsers', function(req, res) {
        userCollection.find({}, function(err, docs) {
            res.set('Content-Type', 'text/html');

            docs.each(function(err, doc) {
                if (doc !== null) {
                    console.log(doc)
                    res.write('<h4>' + doc.name + doc.signedIn + '</h4><br>')
                } else
                    res.end()

            })
        })
    });

    app.get('/api/insertUser/:name', function(req, res) {
        var name = req.params.name;
        // Insert a single document
        console.log(name.toString());

        userCollection.insert({
            name: name.toString(),
            signedIn: 0
        }, function(err, docsInserted) {
            if (!err) {
                res.send(docsInserted.ops[0]._id);
            }

        });

    });

    app.get('/api/signUser/:name/:state', function(req, res) {
        var name = req.params.name.toString();
        var newState = req.params.state.toString();

        // Insert a single document

        userCollection.update({
            name: name,
        }, {
            $set: {
                signedIn: newState
            }
        }, function(err, results) {

            if (err) throw err
            else {
                res.send(JSON.parse(results).n.toString());
            }
        })

    });

    app.use('/', express.static(path.join(__dirname, 'public')));

    var server = app.listen(port, () => {

        var host = server.address().address;
        var port = server.address().port;

        console.log('CycleSentry listening at http://%s:%s', host, port);
        done()
    });
};

module.exports = start;
// start(8080)
