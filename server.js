var express = require('express'),
    app = express(),
    path = require('path'),
    // request = require('request'),
    _ = require('underscore'),
    // child_process = require('child_process'),
    hostname = process.env.HOSTNAME || 'localhost',
    // cheerio = require('cheerio'),
    // port = process.env.PORT || 4567,
    publicDir = process.argv[2] || __dirname + '/public',
    // favicon = require('serve-favicon'),
    fs = require('fs');


var data = []

var createServer = function(port) {

    // app.use(favicon(__dirname + '/favicon.ico'));

    app.get('/', function(req, res) {

        res.set('Content-Type', 'text/html');
        res.send('<h4>DATA:<br>' + data.join('<br>') + '</h4>');

    })

    app.get('/api/insert/:text', function(req, res) {

        var text = req.params.text.toString();
        console.log(text);
        data.push(text)
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
