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

var url = 'mongodb://localhost:27017/'
var db

var start = function(port, dbName, done) {
    if (!done) {
        done = () => console.log('\n')
    }

    if (!dbName) {
        dbName = 'Cycle'
    }

    Client.connect(url + dbName, function(err, retDB) {
        if (err) throw err
        console.log('connected to mongo')

        db = retDB

        if (dbName === 'test') {
            db.dropCollection("users", function(err, result) {
                console.log("dropped db  for testing: " + result)
            })
        }
        createServer(port, done)
    })
}

var createServer = function(port, done) {


    var userCollection = db.collection('users');


    app.get('/api/listUsers', function(req, res) {
        userCollection.find({}, function(err, docs) {
            res.set('Content-Type', 'text/html');
            // res.write("[")
            // console.log(docs.toArray())
            var userArray = []
            docs.each(function(err, doc) {
                if (doc !== null) {
                    // console.log(doc)
                    userArray.push(doc)
                    // res.write(JSON.stringify(doc))
                } else {
                    // res.write("]")
                    res.send(JSON.stringify(userArray))
                }

            })
        })
    });

    app.get('/api/insertUser/:ID/:name', function(req, res) {
        var id = req.params.ID.toString();
        var name = req.params.name.toString();

        // Insert a single document
        console.log(name);

        userCollection.insert({
            id: id,
            name: name,
            signedIn: 0
        }, function(err, docsInserted) {
            if (!err) {
                res.send(docsInserted.ops[0]._id);
            }

        });

    });

    app.get('/api/signUser/:ID/:state', function(req, res) {
        var id = req.params.ID.toString();
        var newState = req.params.state;

        // Insert a single document

        userCollection.update({
            id: id, //TODO: look into enforcing uniqeness
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

    app.get('/api/getUserInfo/:ID', function(req, res) {
        var id = req.params.ID.toString();

        userCollection.findOne({
            id: id,
        }, function(err, doc) {
            if (err) throw err
            else {
                res.set('Content-Type', 'text/JSON');
                res.send(JSON.stringify(doc));
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
