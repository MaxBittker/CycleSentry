var express = require('express'),
    app = express(),
    path = require('path'),
    request = require('request'),
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
var activeFobs = {}
var activeDuration = 8 * 1000 // milliseconds
var Alarm = false;

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
            db.dropCollection("tags", function(err, result) {
                console.log("dropped db  for testing: " + result)
            })
        }
        createServer(port, done)
    })
}

var createServer = function(port, done) {


    var userCollection = db.collection('users');
    var tagCollection = db.collection('tags');

    function securityCheck(tID, newState) {
        tagCollection.findOne({
            TagID: tID,
        }, function(err, tagDoc) {
            if (err) throw err
            if (!tagDoc)
                return
            if (tagDoc.type === "fob") {
                activeFobs[tagDoc.UID] = tagDoc;
                setTimeout(() => {
                    activeFobs[tagDoc.UID] = undefined
                }, activeDuration);
            } else {
                if (activeFobs[tagDoc.UID] && activeFobs[tagDoc.UID].type === "fob") {
                    return;
                } else if (newState === '-1') {
                    setTimeout(() => {
                        soundAlarm(tagDoc)
                    }, activeDuration);
                }
            }
        })
    }

    function soundAlarm(tagDoc) {
        if (activeFobs[tagDoc.UID] && activeFobs[tagDoc.UID].type === "fob")
            return;
        else {
            Alarm = true;
            setTimeout(() => {
                Alarm = false
            }, activeDuration * 2);

            tagCollection.update({
                TagID: tagDoc.TagID, //TODO: look into enforcing uniqeness
            }, {
                $set: {
                    state: {
                        location: -2,
                        timestamp: Date.now()
                    }
                }
            }, function(err, results) {

                if (err) throw err
                else {
                    console.log("tag #" + tagDoc.TagID + "reported stolen at " + Date.now().toString())
                        //TODO call ben
                    var requestData = {
                        "channels": [
                            "uid".concat(tagDoc.UID.toString())
                        ],
                        "data": {
                            "alert": "Your bike has left the station",
                            "tagInfo": tagDoc
                        }
                    };

                    request({
                        url: 'https://api.parse.com/1/push',
                        method: "POST",
                        headers: {
                            "X-Parse-Application-Id": "qoCsCcYiHVhEoile0PQ8PWOrqL5ZNpLOX53haQ7T",
                            "X-Parse-REST-API-Key": "Vfl47NWaqpnTOLqysV2kHi90PbYKPyKzHsvgBnj0",
                            "Content-Type": "application/json"
                        },
                        json: true,
                        body: requestData
                    }, function(error, response, body) {
                        if (error) throw error

                    });
                }
            })

        }


    }

    app.get('/api/echo/:text', function(req, res) {
        var echo = req.params.text.toString();
        console.log(echo)
        res.set('Content-Type', 'text/html');
        res.send(echo)
    });

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

    app.get('/api/insertUser/:UID/:name/:password', function(req, res) {
        var id = req.params.UID.toString();
        var name = req.params.name.toString();
        var pword = req.params.password.toString();

        // Insert a single document
        // console.log(name);
        var pnumber = "123456789"
        var address = "123 street"
            // console.log(pword?)
        userCollection.insert({
            UID: id,
            name: name,
            phonenumber: pnumber,
            address: address,
            password: pword
        }, function(err, docsInserted) {
            if (!err) {
                res.send(docsInserted.ops[0]._id);
            }

        });

    });

    app.get('/api/insertTag/:UID/:TagID/:type/:name', function(req, res) {
        var uid = req.params.UID.toString();
        var tid = req.params.TagID.toString();
        var type = req.params.type.toString();
        var name = req.params.name.toString();

        // Insert a single document

        tagCollection.insert({
            UID: uid,
            TagID: tid,
            type: type,
            name: name,
            state: {
                location: -1,
                timestamp: Date.now()
            }
        }, function(err, docsInserted) {
            if (!err) {
                res.send(docsInserted.ops[0]._id);
            }

        });

    });

    app.get('/api/updateTag/:TagID/:state', function(req, res) {
        var id = req.params.TagID.toString();
        var newState = req.params.state;
        //var rackID = 1 // Insert a single document
        var ack = false
        if (newState === '0') {
            ack = true
            newState = -1
        }
        tagCollection.findOne({
            TagID: id,
        }, function(err, tagDoc) {
            if (tagDoc.state.location === newState)
                ack = true

            tagCollection.update({
                TagID: id, //TODO: look into enforcing uniqeness
            }, {
                $set: {
                    state: {
                        location: newState,
                        timestamp: Date.now()
                    }
                }
            }, function(err, results) {

                if (err) throw err
                else {
                    res.send(JSON.parse(results).n.toString());
                    if (!ack)
                        securityCheck(id, newState);
                }
            })
        })

    });

    app.get('/api/timeSignedInToday/:UID', function(req, res) {
        res.set('Content-Type', 'text/JSON');
        var min = 0;
        var max = 10800;
        var retObj = {
            'secondsSignedInToday': Math.floor(Math.random() * (max - min + 1)) + min
        };
        res.send(JSON.stringify(retObj));
    });

    app.get('/api/averageFirstSignInTime/:UID', function(req, res) {
        res.set('Content-Type', 'text/JSON');
        var min = 28800;
        var max = 36000;
        var retObj = {
            'secondsPastMidnight': Math.floor(Math.random() * (max - min + 1)) + min
        };
        res.send(JSON.stringify(retObj));
    });

    app.get('/api/getUserInfo/:UID', function(req, res) {
        var UID = req.params.UID;

        res.set('Content-Type', 'text/JSON');
        userCollection.findOne({
            UID: UID,
        }, function(err, doc) {
            if (err) throw err
            else {
                tagCollection.find({
                    UID: UID,
                }, function(err, docs) {

                    var tags = []
                    if (err) throw err

                    docs.each(function(err, tagdoc) {

                        if (tagdoc !== null) {
                            tags.push(tagdoc)
                        } else {

                            var retObj = {
                                UID: UID,
                                name: doc.name,
                                tagInfo: tags
                            }

                            res.send(JSON.stringify(retObj));

                        }
                    })
                })
            }
        })

    });


    app.get('/api/getLocationInfo/', function(req, res) {
        //this is faked right now because we only have one location.
        //it should return an array of all locations.
        tagCollection.count({
                "state.location": "1"
            },
            function(err, count) {

                if (err) throw err

                res.set('Content-Type', 'text/JSON');
                res.send(JSON.stringify([{
                    "locationid": 1,
                    occupancy: count,
                    capacity: 1
                }]))
            })
    });

    app.get('/api/shouldAlarm/', function(req, res) {
        // var result = (Math.random() > .95) ? 1 : 0
        var result = Alarm ? 1 : 0
        res.set('Content-Type', 'text/JSON');
        res.send(result.toString())
    });

    app.get('/api/random/', function(req, res) {
        var result = (Math.random() > .95) ? 1 : 0
            // var result = Alarm ? 1 : 0
        res.set('Content-Type', 'text/JSON');
        res.send(result.toString())
    });

    app.post('api/upload', function(req, res) {
        console.log(req)
    })

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
